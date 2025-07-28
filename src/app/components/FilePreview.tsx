"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { S3Item, S3Config } from "../../types/s3-explorer";

interface FilePreviewProps {
  item: S3Item;
  s3Config: S3Config;
  buildApiPath: (path: string) => string;
  onClose: () => void;
}

export default function FilePreview({
  item,
  s3Config,
  buildApiPath,
  onClose,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (item.type === "folder") return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildApiPath("/api/s3/preview"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...s3Config,
            key: item.fullPath,
          }),
        });

        const result = await response.json();

        if (result.success && result.url) {
          setPreviewUrl(result.url);
        } else {
          setError(result.error || "Error al cargar vista previa");
        }
      } catch {
        setError("Error al cargar vista previa");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [item.fullPath, item.type, s3Config, buildApiPath]);

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const isImage = (filename: string) => {
    const ext = getFileExtension(filename);
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
  };

  const isTextFile = (filename: string) => {
    const ext = getFileExtension(filename);
    return [
      "txt",
      "js",
      "json",
      "html",
      "css",
      "md",
      "py",
      "ts",
      "tsx",
      "jsx",
    ].includes(ext);
  };

  const isPdf = (filename: string) => {
    return getFileExtension(filename) === "pdf";
  };

  const downloadFile = async () => {
    try {
      const response = await fetch(buildApiPath("/api/s3/download"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...s3Config,
          key: item.fullPath,
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        setError(result.error || "Error al descargar archivo");
      }
    } catch {
      setError("Error al descargar archivo");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Vista previa: {item.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={downloadFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📥 Descargar
          </button>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cargando vista previa...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && previewUrl && (
            <div className="text-center">
              {isImage(item.name) && (
                <Image
                  src={previewUrl}
                  alt={item.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] mx-auto rounded object-contain"
                />
              )}

              {isPdf(item.name) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] rounded"
                  title={item.name}
                />
              )}

              {isTextFile(item.name) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] rounded"
                  title={item.name}
                />
              )}

              {!isImage(item.name) &&
                !isPdf(item.name) &&
                !isTextFile(item.name) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vista previa no disponible para este tipo de archivo
                    </p>
                    <button
                      onClick={downloadFile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📥 Descargar archivo
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
