"use client";

import { useState } from "react";
import { useBasePath } from "../hooks/useBasePath";
import { useS3Config } from "../hooks/useS3Config";
import { PasswordUnlock } from "./PasswordUnlock";
import { S3ConfigForm } from "./S3ConfigForm";
import S3FileExplorer from "./S3FileExplorer";
import { S3Config } from "@/types/s3-explorer";

export default function S3Uploader() {
  const { buildApiPath } = useBasePath();
  const {
    config,
    isConnected,
    isLoading,
    error,
    needsPassword,
    hasStoredData,
    isUnlocked,
    unlockConfig,
    saveConfig,
    clearConfig,
    lockConfig,
    validateConfig,
    setError,
  } = useS3Config();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showConfigForm, setShowConfigForm] = useState(false);

  const testS3Connection = async (configToTest: S3Config) => {
    if (!validateConfig(configToTest)) {
      setStatusMessage("Por favor, completa toda la configuración de S3");
      setConnectionStatus("error");
      return false;
    }

    setIsTestingConnection(true);
    setConnectionStatus("idle");

    try {
      const response = await fetch(buildApiPath("/api/s3/test-connection"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configToTest),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage(result.message);
        setConnectionStatus("success");
        return true;
      } else {
        setStatusMessage(result.error);
        setConnectionStatus("error");
        return false;
      }
    } catch (error) {
      console.error("Error de conexión S3:", error);
      setStatusMessage(
        `❌ Error de conexión: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setConnectionStatus("error");
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleUnlock = async (password: string) => {
    await unlockConfig(password);
  };

  const handleSaveConfig = async (newConfig: S3Config, password: string) => {
    // Primero probar la conexión
    const connectionSuccess = await testS3Connection(newConfig);

    if (connectionSuccess) {
      // Si la conexión es exitosa, guardar la configuración
      await saveConfig(newConfig, password);
      setShowConfigForm(false);
    }
  };

  const handleCreateNew = () => {
    clearConfig();
    setShowConfigForm(true);
    setConnectionStatus("idle");
    setStatusMessage("");
  };

  const handleReconfigure = () => {
    lockConfig();
    setShowConfigForm(true);
    setConnectionStatus("idle");
    setStatusMessage("");
  };

  const handleCancelConfig = () => {
    setShowConfigForm(false);
    setError("");
    setConnectionStatus("idle");
    setStatusMessage("");
  };

  // Si está conectado y desbloqueado, mostrar el explorador
  if (isConnected && isUnlocked && !showConfigForm) {
    return (
      <div className="space-y-6">
        {/* Header con información de conexión */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                📁 Explorador de Archivos S3
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Conectado a:{" "}
                <span className="font-medium">{config.bucket}</span> en{" "}
                <span className="font-medium">{config.endpoint}</span>
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600 font-medium">
                  🔒 Configuración Encriptada AES-256
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => lockConfig()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                title="Bloquear sesión"
              >
                🔒 Bloquear
              </button>
              <button
                onClick={handleReconfigure}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                title="Reconfigurar"
              >
                ⚙️ Reconfigurar
              </button>
            </div>
          </div>
        </div>

        {/* Explorador de archivos */}
        <S3FileExplorer s3Config={config} isConfigValid={true} />
      </div>
    );
  }

  // Si necesita contraseña para desbloquear
  if (needsPassword && !showConfigForm) {
    return (
      <PasswordUnlock
        onUnlock={handleUnlock}
        onCreateNew={handleCreateNew}
        isLoading={isLoading}
        error={error}
        hasStoredData={hasStoredData}
      />
    );
  }

  // Mostrar formulario de configuración
  if (showConfigForm || (!hasStoredData && !needsPassword)) {
    return (
      <div className="space-y-6">
        <S3ConfigForm
          onSave={handleSaveConfig}
          onCancel={hasStoredData ? handleCancelConfig : undefined}
          isLoading={isLoading || isTestingConnection}
          error={error || statusMessage}
          initialConfig={config}
        />

        {/* Estado de la conexión */}
        {statusMessage && (
          <div
            className={`p-4 rounded-md ${
              connectionStatus === "success"
                ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                : connectionStatus === "error"
                ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
                : "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
            }`}
          >
            <p className="font-medium">{statusMessage}</p>
            {connectionStatus === "success" && (
              <p className="text-sm mt-2">
                ✅ Conexión exitosa. La configuración se guardará encriptada con
                AES-256.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Estado de carga inicial
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Inicializando configuración segura...</p>
      </div>
    </div>
  );
}
