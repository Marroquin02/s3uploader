import { useState, useEffect, useCallback } from "react";
import { S3Config } from "@/types/s3-explorer";
import { useSecureStorage } from "./useSecureStorage";

// Configuración desde variables de entorno
const STORAGE_KEY =
  process.env.NEXT_PUBLIC_S3_CONFIG_STORAGE_KEY || "s3_config_encrypted";
const SALT_KEY = process.env.NEXT_PUBLIC_S3_SALT_KEY || "s3_config_salt_2024";

export function useS3Config() {
  const [config, setConfig] = useState<S3Config>({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    region: "",
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [needsPassword, setNeedsPassword] = useState(false);

  // Hook de almacenamiento seguro
  const secureStorage = useSecureStorage<S3Config>({
    storageKey: STORAGE_KEY,
    saltKey: SALT_KEY,
  });

  // Cargar configuración al inicializar
  useEffect(() => {
    if (secureStorage.hasStoredData) {
      setNeedsPassword(true);
    }
  }, [secureStorage.hasStoredData]);

  /**
   * Desbloquea la configuración con la contraseña maestra
   */
  const unlockConfig = useCallback(
    async (password: string) => {
      try {
        setIsLoading(true);
        setError("");

        const loadedConfig = secureStorage.loadSecure(password);
        if (loadedConfig) {
          setConfig(loadedConfig);
          setIsConnected(true);
          setNeedsPassword(false);
        }
      } catch (error) {
        setError("Contraseña incorrecta o datos corruptos");
        console.error("Error al desbloquear configuración:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [secureStorage]
  );

  /**
   * Guarda la configuración con encriptación
   */
  const saveConfig = useCallback(
    async (newConfig: S3Config, password: string) => {
      try {
        setIsLoading(true);
        setError("");

        secureStorage.saveSecure(newConfig, password);
        setConfig(newConfig);
        setIsConnected(true);
        setNeedsPassword(false);
      } catch (error) {
        setError("Error al guardar la configuración");
        console.error("Error al guardar configuración:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [secureStorage]
  );

  /**
   * Actualiza la configuración existente
   */
  const updateConfig = useCallback(
    async (newConfig: S3Config) => {
      try {
        setIsLoading(true);
        setError("");

        secureStorage.updateSecure(newConfig);
        setConfig(newConfig);
      } catch (error) {
        setError("Error al actualizar la configuración");
        console.error("Error al actualizar configuración:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [secureStorage]
  );

  /**
   * Limpia la configuración y bloquea
   */
  const clearConfig = useCallback(() => {
    secureStorage.clearSecure();
    setConfig({
      endpoint: "",
      accessKeyId: "",
      secretAccessKey: "",
      bucket: "",
      region: "",
    });
    setIsConnected(false);
    setNeedsPassword(false);
    setError("");
  }, [secureStorage]);

  /**
   * Bloquea la sesión actual
   */
  const lockConfig = useCallback(() => {
    secureStorage.lock();
    setConfig({
      endpoint: "",
      accessKeyId: "",
      secretAccessKey: "",
      bucket: "",
      region: "",
    });
    setIsConnected(false);
    setNeedsPassword(true);
    setError("");
  }, [secureStorage]);

  /**
   * Cambia la contraseña maestra
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setIsLoading(true);
        setError("");

        secureStorage.changePassword(currentPassword, newPassword);
      } catch (error) {
        setError("Error al cambiar la contraseña");
        console.error("Error al cambiar contraseña:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [secureStorage]
  );

  /**
   * Valida la configuración S3
   */
  const validateConfig = useCallback((configToValidate: S3Config): boolean => {
    return !!(
      configToValidate.endpoint &&
      configToValidate.accessKeyId &&
      configToValidate.secretAccessKey &&
      configToValidate.bucket &&
      configToValidate.region
    );
  }, []);

  return {
    // Estado
    config,
    isConnected,
    isLoading,
    error,
    needsPassword,
    hasStoredData: secureStorage.hasStoredData,
    isUnlocked: secureStorage.isUnlocked,

    // Métodos principales
    unlockConfig,
    saveConfig,
    updateConfig,
    clearConfig,
    lockConfig,
    changePassword,
    validateConfig,

    // Helpers
    setConfig,
    setError,
  };
}
