import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const {
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
      bucket,
      prefix = "",
    } = await request.json();

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en la configuración S3" },
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

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    const folders = (response.CommonPrefixes || []).map((prefix) => ({
      name:
        prefix.Prefix?.replace(
          (prefix.Prefix.slice(0, -1).lastIndexOf("/") + 1).toString(),
          ""
        ).slice(0, -1) || "",
      fullPath: prefix.Prefix || "",
      type: "folder" as const,
      size: 0,
      lastModified: null,
    }));

    const files = (response.Contents || [])
      .filter((obj) => obj.Key !== prefix && !obj.Key?.endsWith("/"))
      .map((obj) => ({
        name: obj.Key?.split("/").pop() || "",
        fullPath: obj.Key || "",
        type: "file" as const,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || null,
      }));

    return NextResponse.json({
      success: true,
      items: [...folders, ...files],
      currentPath: prefix,
    });
  } catch (error) {
    console.error("Error al listar archivos:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: `❌ Error al listar archivos: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
