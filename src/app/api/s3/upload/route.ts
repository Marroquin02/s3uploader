import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extraer configuración S3
    const endpoint = formData.get("endpoint") as string;
    const region = formData.get("region") as string;
    const accessKeyId = formData.get("accessKeyId") as string;
    const secretAccessKey = formData.get("secretAccessKey") as string;
    const bucket = formData.get("bucket") as string;

    // Extraer configuración de upload
    const folderName = formData.get("folderName") as string;
    const fileName = formData.get("fileName") as string;

    // Extraer archivo
    const file = formData.get("file") as File;

    // Validaciones
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en la configuración S3" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ningún archivo" },
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

    // Convertir archivo a buffer
    const fileBuffer = await file.arrayBuffer();

    // Construir la clave del objeto
    const finalFileName = fileName || file.name;
    const objectKey = folderName
      ? `${folderName}/${finalFileName}`
      : finalFileName;

    // Subir archivo a S3
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      ContentLength: file.size,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: `✅ Archivo subido exitosamente: ${objectKey}`,
      objectKey,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: `❌ Error al subir: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
