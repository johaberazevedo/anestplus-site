import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    const { fileKey, fileName } = body ?? {};

    if (!fileKey) {
      return NextResponse.json(
        { error: "fileKey é obrigatório." },
        { status: 400 }
      );
    }

    const s3 = getR2Client();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ResponseContentType: "application/pdf",
      ...(fileName
        ? {
            ResponseContentDisposition: `attachment; filename="${fileName}"`,
          }
        : {}),
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Erro ao gerar URL de download:", error);
    return NextResponse.json(
      { error: "Erro ao gerar download da ficha." },
      { status: 500 }
    );
  }
}