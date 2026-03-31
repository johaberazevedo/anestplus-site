import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_");
}

function buildSafePdfName(fileName?: string) {
  if (!fileName) return "ficha.pdf";

  const cleaned = fileName
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_");

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

    const body = await request.json();
    const { idHospital, crm, fileName } = body ?? {};

    if (!idHospital || !crm) {
      return NextResponse.json(
        { error: "idHospital e crm são obrigatórios." },
        { status: 400 }
      );
    }

    const safeHospital = sanitizeSegment(String(idHospital));
    const safeCrm = sanitizeSegment(String(crm));
    const safeFileName = buildSafePdfName(
      typeof fileName === "string" ? fileName : undefined
    );

    const hoje = new Date();
    const pastaData = `${hoje.getFullYear()}/${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}/${String(hoje.getDate()).padStart(2, "0")}`;

    const finalFileName = `${safeCrm}_${Date.now()}_${safeFileName}`;
    const fileKey = `hospitais/${safeHospital}/${pastaData}/${finalFileName}`;

    const s3 = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: "application/pdf",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadUrl,
      fileKey,
      fileName: finalFileName,
    });
  } catch (error) {
    console.error("Erro ao gerar signed upload URL:", error);

    return NextResponse.json(
      { error: "Erro ao gerar permissão de upload." },
      { status: 500 }
    );
  }
}