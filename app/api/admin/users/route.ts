import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const FEATURE = "pre_anesthetic";
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

type EntitlementRow = {
  user_id: string;
  institution_code: string;
  status: "active" | "suspended" | "revoked";
  starts_at: string;
  expires_at: string | null;
  updated_at: string;
};

type ResidentHospitalRow = {
  user_id: string;
  name: string;
  city: string;
  state: string;
  is_archived: boolean;
  replacement_allowed: boolean;
};

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function effectiveEntitlementStatus(row: EntitlementRow) {
  if (row.status !== "active") return row.status;

  const now = Date.now();
  if (new Date(row.starts_at).getTime() > now) return "scheduled";
  if (row.expires_at && new Date(row.expires_at).getTime() <= now) {
    return "expired";
  }

  return "active";
}

export async function GET(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const perPage = Math.min(
      positiveInteger(searchParams.get("perPage"), DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE,
    );

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (authError) {
      console.error("Erro ao listar usuários no admin:", authError);
      return NextResponse.json(
        { error: "Não foi possível listar os usuários." },
        { status: 500 },
      );
    }

    const authUsers = authData.users;
    const userIds = authUsers.map((user) => user.id);

    let entitlements: EntitlementRow[] = [];
    let hospitals: ResidentHospitalRow[] = [];

    if (userIds.length > 0) {
      const [entitlementResult, hospitalResult] = await Promise.all([
        supabaseAdmin
          .from("institutional_entitlements")
          .select(
            "user_id, institution_code, status, starts_at, expires_at, updated_at",
          )
          .in("user_id", userIds)
          .eq("feature", FEATURE),
        supabaseAdmin
          .from("resident_hospitals")
          .select(
            "user_id, name, city, state, is_archived, replacement_allowed",
          )
          .in("user_id", userIds),
      ]);

      if (entitlementResult.error || hospitalResult.error) {
        console.error("Erro ao montar listagem administrativa:", {
          entitlement: entitlementResult.error,
          hospital: hospitalResult.error,
        });
        return NextResponse.json(
          { error: "Não foi possível carregar os acessos residenciais." },
          { status: 500 },
        );
      }

      entitlements = (entitlementResult.data ?? []) as EntitlementRow[];
      hospitals = (hospitalResult.data ?? []) as ResidentHospitalRow[];
    }

    const entitlementsByUser = new Map<string, EntitlementRow[]>();
    for (const entitlement of entitlements) {
      const current = entitlementsByUser.get(entitlement.user_id) ?? [];
      current.push(entitlement);
      entitlementsByUser.set(entitlement.user_id, current);
    }
    const hospitalByUser = new Map(
      hospitals.map((row) => [row.user_id, row]),
    );

    const users = authUsers.map((user) => {
      const userEntitlements = entitlementsByUser.get(user.id) ?? [];
      const hospital = hospitalByUser.get(user.id);

      return {
        id: user.id,
        email: user.email ?? "",
        emailConfirmedAt: user.email_confirmed_at ?? null,
        createdAt: user.created_at,
        fullName: String(user.user_metadata?.full_name ?? ""),
        crm: String(user.user_metadata?.crm ?? ""),
        rqe: String(user.user_metadata?.rqe ?? ""),
        entitlements: userEntitlements
          .sort((first, second) =>
            first.institution_code.localeCompare(second.institution_code),
          )
          .map((entitlement) => ({
              institutionCode: entitlement.institution_code,
              status: entitlement.status,
              effectiveStatus: effectiveEntitlementStatus(entitlement),
              startsAt: entitlement.starts_at,
              expiresAt: entitlement.expires_at,
              updatedAt: entitlement.updated_at,
            })),
        residentHospital: hospital
          ? {
              name: hospital.name,
              city: hospital.city,
              state: hospital.state,
              isArchived: hospital.is_archived,
              replacementAllowed: hospital.replacement_allowed,
            }
          : null,
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        perPage,
        total: authData.total ?? users.length,
        lastPage: authData.lastPage ?? page,
      },
    });
  } catch (error) {
    console.error("Erro interno ao listar usuários no admin:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar usuários." },
      { status: 500 },
    );
  }
}
