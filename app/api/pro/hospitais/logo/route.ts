import { NextResponse } from "next/server";
import { isUuid } from "@/lib/admin-auth";
import { isHospitalCode } from "@/lib/institutional-hospitals";
import { getProHospitalLinks, getProHospitalModuleLinks } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const headers = { "Cache-Control": "private, no-store" };

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("hospitalCode");
  const version = params.get("version")?.toLowerCase();
  const includeModules = params.get("modules");
  if (!isHospitalCode(code) || !version || !isUuid(version)) {
    return failure("Confira o código do hospital e a versão da logo.", 400);
  }
  if (includeModules !== null && includeModules !== "1") return failure("Opção de módulos inválida.", 400);

  const links = includeModules === "1" ? await getProHospitalModuleLinks(request, code) : await getProHospitalLinks(request, code);
  if (!Array.isArray(links)) return links;
  const unavailable = () => failure("Logo indisponível.", 404);
  if (!links.some((link) => (typeof link === "string" ? link : link.code) === code)) return unavailable();

  const { data: hospital, error: hospitalError } = await supabaseAdmin.from("institutional_hospitals")
    .select("code").eq("code", code).eq("is_active", true).maybeSingle();
  if (hospitalError) return failure("Não foi possível verificar o hospital.", 500);
  if (!hospital) return unavailable();

  const { data: logo, error: logoError } = await supabaseAdmin.from("institutional_hospital_logos")
    .select("version,png_data").eq("hospital_code", code).maybeSingle();
  if (logoError) return failure("Não foi possível carregar a logo.", 500);
  if (!logo) return unavailable();
  if (logo.version !== version) return failure("A logo mudou. Atualize a lista de hospitais.", 409);
  // O Postgres serializa bytea em hexadecimal, com o prefixo \x.
  const hex = typeof logo.png_data === "string" && logo.png_data.startsWith("\\x")
    ? logo.png_data.slice(2) : "";
  if (hex.length < 2 || hex.length % 2 !== 0 || /[^a-f\d]/i.test(hex)) {
    return failure("Não foi possível ler a logo.", 500);
  }
  return new Response(new Uint8Array(Buffer.from(hex, "hex")), {
    headers: { ...headers, "Content-Type": "image/png", "X-Content-Type-Options": "nosniff" },
  });
}
