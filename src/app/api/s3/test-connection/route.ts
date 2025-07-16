import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const { endpoint, region, accessKeyId, secretAccessKey, bucket } =
      await request.json();

    // Validar que todos los campos requeridos estén presentes
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en la configuración S3" },
        { status: 400 }
      );
    }

    // Crear cliente S3
    const s3Client = new S3Client({
      endpoint,
      region: region || "us-east-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    // Intentar subir un archivo de prueba pequeño
    const testData = new TextEncoder().encode("test-connection");
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: "test-connection.txt",
        Body: testData,
        ContentType: "text/plain",
      })
    );

    return NextResponse.json({
      success: true,
      message: "✅ Conexión S3 exitosa",
    });
  } catch (error) {
    console.error("Error de conexión S3:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: `❌ Error de conexión: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
