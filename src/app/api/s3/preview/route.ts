import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, region, accessKeyId, secretAccessKey, bucket, key } =
      await request.json();

    if (
      !endpoint ||
      !region ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucket ||
      !key
    ) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Necesario para endpoints personalizados
    });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // Generar URL firmada válida por 1 hora
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error al generar URL de vista previa:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar vista previa" },
      { status: 500 }
    );
  }
}
