import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { HOSPITAL_FIELDS } from "@/lib/institutional-hospitals";
import { getProHospitalLinks, getProHospitalModuleLinks } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const includeModules = new URL(request.url).searchParams.get("modules");
  if (includeModules !== null && includeModules !== "1") {
    return NextResponse.json({ error: "Opção de módulos inválida." }, { status: 400, headers });
  }
  const links = includeModules === "1" ? await getProHospitalModuleLinks(request) : await getProHospitalLinks(request);
  if (!Array.isArray(links)) return links;
  const codes = links.map((link) => typeof link === "string" ? link : link.code);
  const modules = new Map(links.flatMap((link) => typeof link === "string" ? [] : [[link.code, link.modules] as const]));
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
  const authorized = hospitals.map((hospital) => includeModules === "1"
    ? { ...hospital, modules: modules.get(hospital.code) } : hospital);

  const { data: logos, error: logoError } = await supabaseAdmin.from("institutional_hospital_logos")
    .select("hospital_code,version").in("hospital_code", hospitals.map(({ code }) => code));
  if (logoError) {
    return NextResponse.json({ hospitals: authorized }, {
      headers: { ...headers, "X-Anest-Logo-Versions": "unavailable" },
    });
  }

  const versions = new Map(logos.map(({ hospital_code, version }) => [hospital_code, version]));
  return current(authorized.map((hospital) => ({
      ...hospital,
      logo_version: versions.get(hospital.code) ?? null,
    })));
}
