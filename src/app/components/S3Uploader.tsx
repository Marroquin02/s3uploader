"use client";

import { useState } from "react";
import { useBasePath } from "../hooks/useBasePath";

interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

interface UploadConfig {
  folderName: string;
  fileName: string;
}

export default function S3Uploader() {
  const { buildApiPath } = useBasePath();

  const [s3Config, setS3Config] = useState<S3Config>({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    region: "us-east-1",
  });

  const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
    folderName: "",
    fileName: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isConfigValid, setIsConfigValid] = useState(false);

  // Validar configuración S3
  const validateS3Config = () => {
    const isValid =
      s3Config.endpoint &&
      s3Config.accessKeyId &&
      s3Config.secretAccessKey &&
      s3Config.bucket;
    setIsConfigValid(!!isValid);
    return !!isValid;
  };

  // Manejar cambios en la configuración S3
  const handleS3ConfigChange = (field: keyof S3Config, value: string) => {
    setS3Config((prev) => ({ ...prev, [field]: value }));
    setTimeout(validateS3Config, 100);
  };

  // Manejar cambios en la configuración de subida
  const handleUploadConfigChange = (
    field: keyof UploadConfig,
    value: string
  ) => {
    setUploadConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file && !uploadConfig.fileName) {
      setUploadConfig((prev) => ({ ...prev, fileName: file.name }));
    }
  };

  // Probar conexión S3
  const testS3Connection = async () => {
    if (!validateS3Config()) {
      setStatusMessage("Por favor, completa toda la configuración de S3");
      setUploadStatus("error");
      return;
    }

    try {
      const response = await fetch(buildApiPath("/api/s3/test-connection"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(s3Config),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage(result.message);
        setUploadStatus("success");
      } else {
        setStatusMessage(result.error);
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Error de conexión S3:", error);
      setStatusMessage(
        `❌ Error de conexión: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setUploadStatus("error");
    }
  };

  // Subir archivo
  const uploadFile = async () => {
    if (!selectedFile) {
      setStatusMessage("Por favor, selecciona un archivo");
      setUploadStatus("error");
      return;
    }

    if (!validateS3Config()) {
      setStatusMessage("Por favor, completa la configuración de S3");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("idle");

    try {
      // Crear FormData para enviar el archivo y la configuración
      const formData = new FormData();

      // Agregar configuración S3
      formData.append("endpoint", s3Config.endpoint);
      formData.append("region", s3Config.region);
      formData.append("accessKeyId", s3Config.accessKeyId);
      formData.append("secretAccessKey", s3Config.secretAccessKey);
      formData.append("bucket", s3Config.bucket);

      // Agregar configuración de upload
      formData.append("folderName", uploadConfig.folderName);
      formData.append("fileName", uploadConfig.fileName);

      // Agregar archivo
      formData.append("file", selectedFile);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(buildApiPath("/api/s3/upload"), {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setStatusMessage(result.message);
        setUploadStatus("success");
      } else {
        setStatusMessage(result.error);
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setStatusMessage(
        `❌ Error al subir: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración S3 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Configuración S3
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Servidor S3 (Endpoint)
            </label>
            <input
              type="text"
              value={s3Config.endpoint}
              onChange={(e) => handleS3ConfigChange("endpoint", e.target.value)}
              placeholder="https://s3.amazonaws.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Región
            </label>
            <input
              type="text"
              value={s3Config.region}
              onChange={(e) => handleS3ConfigChange("region", e.target.value)}
              placeholder="us-east-1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Key ID
            </label>
            <input
              type="text"
              value={s3Config.accessKeyId}
              onChange={(e) =>
                handleS3ConfigChange("accessKeyId", e.target.value)
              }
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secret Access Key
            </label>
            <input
              type="password"
              value={s3Config.secretAccessKey}
              onChange={(e) =>
                handleS3ConfigChange("secretAccessKey", e.target.value)
              }
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bucket
            </label>
            <input
              type="text"
              value={s3Config.bucket}
              onChange={(e) => handleS3ConfigChange("bucket", e.target.value)}
              placeholder="mi-bucket"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={testS3Connection}
            disabled={!isConfigValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Probar Conexión
          </button>
        </div>
      </div>

      {/* Configuración de Subida */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Configuración de Subida
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Carpeta (opcional)
            </label>
            <input
              type="text"
              value={uploadConfig.folderName}
              onChange={(e) =>
                handleUploadConfigChange("folderName", e.target.value)
              }
              placeholder="documentos/imagenes"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Archivo
            </label>
            <input
              type="text"
              value={uploadConfig.fileName}
              onChange={(e) =>
                handleUploadConfigChange("fileName", e.target.value)
              }
              placeholder="archivo.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Selección y Subida de Archivo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Subir Archivo
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Archivo
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Archivo seleccionado:</strong> {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Tamaño:</strong>{" "}
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Ruta final:</strong>{" "}
                {uploadConfig.folderName ? `${uploadConfig.folderName}/` : ""}
                {uploadConfig.fileName || selectedFile.name}
              </p>
            </div>
          )}

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <button
            onClick={uploadFile}
            disabled={!selectedFile || !isConfigValid || isUploading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isUploading ? `Subiendo... ${uploadProgress}%` : "Subir Archivo"}
          </button>
        </div>
      </div>

      {/* Estado de la operación */}
      {statusMessage && (
        <div
          className={`p-4 rounded-md ${
            uploadStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
              : uploadStatus === "error"
              ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
              : "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
          }`}
        >
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}
    </div>
  );
}
