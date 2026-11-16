import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { HOSPITAL_FIELDS } from "@/lib/institutional-hospitals";
import { getProHospitalLinks } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const codes = await getProHospitalLinks(request);
  if (!Array.isArray(codes)) return codes;

  const headers = { "Cache-Control": "no-store" };
  function current(hospitals: object[]) {
    const body = { hospitals };
    const etag = `"${createHash("sha256").update(JSON.stringify(body)).digest("hex")}"`;
    const cacheHeaders = { ...headers, ETag: etag };
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: cacheHeaders });
    }
    return NextResponse.json(body, { headers: cacheHeaders });
  }

  if (codes.length === 0) return current([]);

  const { data: hospitals, error } = await supabaseAdmin.from("institutional_hospitals")
    .select(HOSPITAL_FIELDS).eq("is_active", true).in("code", codes).order("name").order("code");
  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar os hospitais." }, { status: 500, headers });
  }
  if (hospitals.length === 0) return current([]);

  const { data: logos, error: logoError } = await supabaseAdmin.from("institutional_hospital_logos")
    .select("hospital_code,version").in("hospital_code", hospitals.map(({ code }) => code));
  if (logoError) {
    return NextResponse.json({ hospitals }, {
      headers: { ...headers, "X-Anest-Logo-Versions": "unavailable" },
    });
  }

  const versions = new Map(logos.map(({ hospital_code, version }) => [hospital_code, version]));
  return current(hospitals.map((hospital) => ({
      ...hospital,
      logo_version: versions.get(hospital.code) ?? null,
    })));
}
