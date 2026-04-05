import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getAuthenticatedProUser } from "@/lib/pro-auth";

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function buildSafePdfName(fileName?: string) {
  if (!fileName) return "ficha.pdf";

  const cleaned = fileName
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

  return `${cleaned || "ficha"}.pdf`;
}

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

export async function POST(request: Request) {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket do R2 não configurado." },
        { status: 500 }
      );
    }

    const { user } = await getAuthenticatedProUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const crmRaw = body?.crm;
    const fileNameRaw = body?.fileName;

    if (typeof crmRaw !== "string" || !crmRaw.trim()) {
      return NextResponse.json(
        { error: "crm é obrigatório." },
        { status: 400 }
      );
    }

    if (
      fileNameRaw !== undefined &&
      (typeof fileNameRaw !== "string" || fileNameRaw.length > 200)
    ) {
      return NextResponse.json(
        { error: "fileName inválido." },
        { status: 400 }
      );
    }

    const safeCrm = sanitizeSegment(crmRaw);
    const safeFileName = buildSafePdfName(
      typeof fileNameRaw === "string" ? fileNameRaw : undefined
    );

    const hoje = new Date();
    const pastaData = `${hoje.getFullYear()}/${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}/${String(hoje.getDate()).padStart(2, "0")}`;

    const finalFileName = `${Date.now()}_${safeFileName}`;
    const fileKey = `pro/${user.id}/${pastaData}/${finalFileName}`;

    const s3 = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: "application/pdf",
      Metadata: {
        owner_user_id: user.id,
        crm: safeCrm,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadUrl,
      fileKey,
      fileName: finalFileName,
    });
  } catch (error) {
    console.error("Erro ao gerar signed upload URL do Pro:", error);

    return NextResponse.json(
      { error: "Erro ao gerar permissão de upload." },
      { status: 500 }
    );
  }
}