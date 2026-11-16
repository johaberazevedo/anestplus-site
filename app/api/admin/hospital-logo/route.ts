import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { hasValidAdminSession, isTrustedAdminMutationRequest } from "@/lib/admin-auth";
import { isHospitalCode } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_SIDE = 4096;
const MAX_PIXELS = 8_000_000;
const headers = { "Cache-Control": "private, no-store" };

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers });
}

async function loadHospitalCode(request: Request, write = false) {
  if (!(await hasValidAdminSession())) return failure("Não autenticado.", 401);
  if (write && !isTrustedAdminMutationRequest(request)) return failure("Origem inválida.", 403);

  const code = new URL(request.url).searchParams.get("hospitalCode");
  if (!isHospitalCode(code)) return failure("Código de hospital inválido.", 400);

  const { data, error } = await supabaseAdmin.from("institutional_hospitals")
    .select("code").eq("code", code).maybeSingle();
  if (error) return failure("Não foi possível verificar o hospital.", 500);
  if (!data) return failure("Hospital não encontrado.", 404);
  return code;
}

function pngResponse(png: Buffer) {
  return new Response(new Uint8Array(png), {
    headers: { ...headers, "Content-Type": "image/png", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(request: Request) {
  const code = await loadHospitalCode(request);
  if (typeof code !== "string") return code;

  const { data, error } = await supabaseAdmin.from("institutional_hospital_logos")
    .select("png_data").eq("hospital_code", code).maybeSingle();
  if (error) return failure("Não foi possível carregar a logo.", 500);
  if (!data) return new Response(null, { status: 204, headers });
  // A Data API entrega bytea no formato hexadecimal do PostgreSQL.
  if (typeof data.png_data !== "string" || !data.png_data.startsWith("\\x")) {
    return failure("Não foi possível ler a logo.", 500);
  }
  return pngResponse(Buffer.from(data.png_data.slice(2), "hex"));
}

export async function PUT(request: Request) {
  const code = await loadHospitalCode(request, true);
  if (typeof code !== "string") return code;
  if (request.headers.get("content-type") !== "image/png") {
    return failure("Envie um arquivo PNG.", 415);
  }
  const tooLarge = () => failure("A logo deve ter no máximo 2 MiB.", 413);
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return tooLarge();
  if (!request.body) return failure("Selecione uma logo PNG.", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel().catch(() => {});
        return tooLarge();
      }
      chunks.push(value);
    }
  } catch {
    return failure("Não foi possível ler o arquivo enviado.", 400);
  } finally {
    reader.releaseLock();
  }

  let png: Buffer;
  try {
    const image = sharp(Buffer.concat(chunks), { limitInputPixels: MAX_PIXELS, failOn: "warning" });
    const { format, width, height, hasAlpha, pages } = await image.metadata();
    if (format !== "png" || !hasAlpha || (pages ?? 1) !== 1) {
      return failure("Use uma imagem PNG com transparência e sem animação.", 400);
    }
    if (!width || !height || width > MAX_SIDE || height > MAX_SIDE) {
      return failure("A logo deve ter até 4096 pixels em cada lado.", 400);
    }
    png = await image.png().toBuffer();
  } catch {
    return failure("PNG inválido ou com dimensões acima do limite.", 400);
  }
  if (png.length > MAX_BYTES) return tooLarge();

  const { error } = await supabaseAdmin.from("institutional_hospital_logos").upsert({
    hospital_code: code,
    png_data: `\\x${png.toString("hex")}`,
    version: randomUUID(),
  }, { onConflict: "hospital_code" });
  if (error?.code === "23503") return failure("Hospital não encontrado.", 404);
  if (error) return failure("Não foi possível salvar a logo.", 500);
  return pngResponse(png);
}

export async function DELETE(request: Request) {
  const code = await loadHospitalCode(request, true);
  if (typeof code !== "string") return code;

  const { error } = await supabaseAdmin.from("institutional_hospital_logos")
    .delete().eq("hospital_code", code);
  if (error) return failure("Não foi possível remover a logo.", 500);
  return new Response(null, { status: 204, headers });
}
