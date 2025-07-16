import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, region, accessKeyId, secretAccessKey, bucket, folderPath } =
      await request.json();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !folderPath) {
      return NextResponse.json(
        { error: "Faltan campos requeridos para crear la carpeta" },
        { status: 400 }
      );
    }

    const s3Client = new S3Client({
      endpoint,
      region: region || "us-east-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    // En S3, las carpetas se crean como objetos vacíos que terminan en "/"
    const folderKey = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: folderKey,
      Body: new Uint8Array(0),
      ContentType: "application/x-directory",
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: `✅ Carpeta creada exitosamente: ${folderKey}`,
      folderPath: folderKey,
    });
  } catch (error) {
    console.error("Error al crear carpeta:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: `❌ Error al crear carpeta: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}