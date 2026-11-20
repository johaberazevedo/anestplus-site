import { isHospitalCode } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store" };
const imageHeaders = { "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable" };
const maxBytes = 2 * 1024 * 1024;
const isVersion = (value: unknown): value is string => typeof value === "string"
  && /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value);

function failure(error: string, status: number) {
  return Response.json({ error }, { status, headers });
}

export async function GET(request: Request) {
  const started = performance.now();
  const durations: Record<string, number> = {};
  async function measure<T>(name: string, operation: () => T | PromiseLike<T>) {
    const start = performance.now();
    try { return await operation(); }
    finally { durations[name] = performance.now() - start; }
  }
  const url = new URL(request.url);
  const params = url.searchParams;
  const code = params.get("hospitalCode");
  const version = params.get("version")?.toLowerCase() ?? null;
  const metadata = params.get("metadata");
  function finish(response: Response, bytes = 0) {
    durations.total = performance.now() - started;
    response.headers.set("Server-Timing", Object.entries(durations)
      .map(([name, duration]) => `${name};dur=${duration.toFixed(1)}`).join(", "));
    if (process.env.NODE_ENV === "development") {
      const ms = Object.fromEntries(Object.entries(durations).map(([name, duration]) => [name, Math.round(duration)]));
      console.info("[hospital.logo.tempo]", { etapa: version === null ? "versao" : "imagem",
        status: response.status, ms, bytes });
    }
    return response;
  }
  if (!isHospitalCode(code) || (version !== null && !isVersion(version))
    || (metadata !== null && (metadata !== "1" || version !== null))) {
    return finish(failure("Confira o hospital e a versão da logo.", 400));
  }
  try {
    // Somente a identidade visual é pública. As APIs de fichas mantêm sua autorização própria.
    const query = supabaseAdmin.from("institutional_hospital_logos")
      .select(version === null ? "version,institutional_hospitals!inner(code)" : "version,png_data,institutional_hospitals!inner(code)")
      .eq("hospital_code", code).eq("institutional_hospitals.is_active", true);
    if (version !== null) query.eq("version", version);
    const { data, error } = await measure(version === null ? "versao" : "leitura",
      () => query.maybeSingle<{ version: unknown; png_data?: unknown }>());
    if (error) throw error;
    if (!data) return finish(version === null ? new Response(null, { status: 204, headers }) : failure("Logo indisponível.", 404));
    if (!isVersion(data.version)) return finish(failure("Logo indisponível.", 500));
    if (version === null) {
      // Esta consulta fica sem cache: troca e remoção aparecem no próximo carregamento.
      if (metadata === "1") return finish(Response.json({ version: data.version.toLowerCase() }, { headers }));
      const target = new URLSearchParams({ hospitalCode: code, version: data.version.toLowerCase() });
      return finish(new Response(null, { status: 307, headers: { ...headers, Location: `${url.pathname}?${target}` } }));
    }
    const hex = typeof data.png_data === "string" && data.png_data.startsWith("\\x") ? data.png_data.slice(2) : "";
    if (hex.length < 16 || hex.length > maxBytes * 2 || hex.length % 2 !== 0
      || /[^a-f\d]/i.test(hex) || !hex.toLowerCase().startsWith("89504e470d0a1a0a")) {
      return finish(failure("Logo indisponível.", 500));
    }
    const etag = `"${data.version}"`;
    if (request.headers.get("if-none-match") === etag) {
      return finish(new Response(null, { status: 304, headers: { ...imageHeaders, ETag: etag } }));
    }
    const png = await measure("preparo", () => new Uint8Array(Buffer.from(hex, "hex")));
    return finish(new Response(png, {
      headers: { ...imageHeaders, ETag: etag, "Content-Type": "image/png", "Content-Length": String(png.byteLength),
        "X-Content-Type-Options": "nosniff" },
    }), png.byteLength);
  } catch {
    return finish(failure("Não foi possível carregar a logo.", 503));
  }
}
