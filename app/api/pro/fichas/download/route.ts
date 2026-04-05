import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Configuração do R2 incompleta.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getBearerToken(request: Request) {
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token.trim();
}

export async function POST(request: Request) {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket do R2 não configurado." },
        { status: 500 }
      );
    }

    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileKey, fileName } = body ?? {};

    if (!fileKey) {
      return NextResponse.json(
        { error: "fileKey é obrigatório." },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const { data: ficha, error: fichaError } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .select("id, user_id, file_key, file_name, expires_at, deleted_at")
      .eq("user_id", user.id)
      .eq("file_key", fileKey)
      .is("deleted_at", null)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (fichaError) {
      console.error("Erro ao validar ficha do Pro:", fichaError);
      return NextResponse.json(
        { error: "Erro ao validar acesso à ficha." },
        { status: 500 }
      );
    }

    if (!ficha) {
      return NextResponse.json(
        { error: "Ficha não encontrada, expirada ou sem permissão de acesso." },
        { status: 403 }
      );
    }

    const s3 = getR2Client();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: ficha.file_key,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: `attachment; filename="${fileName || ficha.file_name}"`,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const { error: updateError } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .update({ last_downloaded_at: nowIso })
      .eq("id", ficha.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar last_downloaded_at:", updateError);
    }

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Erro ao gerar URL de download do Pro:", error);
    return NextResponse.json(
      { error: "Erro ao gerar download da ficha." },
      { status: 500 }
    );
  }
}