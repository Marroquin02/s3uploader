import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint, region, accessKeyId, secretAccessKey, bucket, key } =
      await request.json();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !key) {
      return NextResponse.json(
        { error: "Faltan campos requeridos para eliminar el archivo" },
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

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: `✅ Archivo eliminado exitosamente: ${key}`,
    });
  } catch (error) {
    console.error("Error al eliminar archivo:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: `❌ Error al eliminar: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}