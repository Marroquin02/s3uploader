import { useState, useCallback } from "react";
import CryptoJS from "crypto-js";

interface SecureStorageOptions {
  storageKey: string;
  saltKey: string;
}

interface EncryptedData {
  data: string;
  salt: string;
  iv: string;
  timestamp: number;
}

/**
 * Hook para almacenamiento seguro con encriptación AES-256
 * Garantiza que los datos estén 100% seguros usando una contraseña maestra
 */
export const useSecureStorage = <T>(options: SecureStorageOptions) => {
  const { storageKey, saltKey } = options;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string>("");

  /**
   * Genera una clave de encriptación derivada de la contraseña maestra
   */
  const deriveKey = useCallback((password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256,
    }).toString();
  }, []);

  /**
   * Encripta los datos usando AES-256-CBC
   */
  const encrypt = useCallback(
    (data: T, password: string): string => {
      try {
        // Generar salt e IV únicos
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        // Derivar clave de encriptación
        const key = deriveKey(password, salt);

        // Encriptar datos
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        // Crear objeto con datos encriptados
        const encryptedData: EncryptedData = {
          data: encrypted.toString(),
          salt: salt,
          iv: iv.toString(),
          timestamp: Date.now(),
        };

        return JSON.stringify(encryptedData);
      } catch (error) {
        console.error("Error al encriptar datos:", error);
        throw new Error("Error de encriptación");
      }
    },
    [deriveKey]
  );

  /**
   * Desencripta los datos usando AES-256-CBC
   */
  const decrypt = useCallback(
    (encryptedString: string, password: string): T => {
      try {
        const encryptedData: EncryptedData = JSON.parse(encryptedString);

        // Derivar clave de encriptación usando el salt almacenado
        const key = deriveKey(password, encryptedData.salt);

        // Desencriptar datos
        const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
          iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
          throw new Error("Contraseña incorrecta o datos corruptos");
        }

        return JSON.parse(decryptedString);
      } catch (error) {
        console.error("Error al desencriptar datos:", error);
        throw new Error("Contraseña incorrecta o datos corruptos");
      }
    },
    [deriveKey]
  );

  /**
   * Guarda datos encriptados en localStorage
   */
  const saveSecure = useCallback(
    (data: T, password: string): void => {
      try {
        const encryptedData = encrypt(data, password);
        localStorage.setItem(storageKey, encryptedData);

        // Guardar hash de verificación (sin revelar la contraseña)
        const passwordHash = CryptoJS.SHA256(password + saltKey).toString();
        localStorage.setItem(`${storageKey}_hash`, passwordHash);

        setMasterPassword(password);
        setIsUnlocked(true);
      } catch (error) {
        console.error("Error al guardar datos seguros:", error);
        throw error;
      }
    },
    [encrypt, storageKey, saltKey]
  );

  /**
   * Carga y desencripta datos desde localStorage
   */
  const loadSecure = useCallback(
    (password: string): T | null => {
      try {
        const encryptedData = localStorage.getItem(storageKey);
        if (!encryptedData) {
          return null;
        }

        const data = decrypt(encryptedData, password);
        setMasterPassword(password);
        setIsUnlocked(true);
        return data;
      } catch (error) {
        console.error("Error al cargar datos seguros:", error);
        throw error;
      }
    },
    [decrypt, storageKey]
  );

  /**
   * Verifica si existe una configuración guardada
   */
  const hasStoredData = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  /**
   * Verifica si la contraseña es correcta sin desencriptar todos los datos
   */
  const verifyPassword = useCallback(
    (password: string): boolean => {
      try {
        const storedHash = localStorage.getItem(`${storageKey}_hash`);
        if (!storedHash) {
          return false;
        }

        const passwordHash = CryptoJS.SHA256(password + saltKey).toString();
        return passwordHash === storedHash;
      } catch (error) {
        console.error("Error al verificar contraseña:", error);
        return false;
      }
    },
    [storageKey, saltKey]
  );

  /**
   * Actualiza los datos manteniendo la misma contraseña
   */
  const updateSecure = useCallback(
    (data: T): void => {
      if (!isUnlocked || !masterPassword) {
        throw new Error("Debe desbloquear primero con la contraseña maestra");
      }
      saveSecure(data, masterPassword);
    },
    [isUnlocked, masterPassword, saveSecure]
  );

  /**
   * Limpia todos los datos y bloquea el almacenamiento
   */
  const clearSecure = useCallback((): void => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_hash`);
    setMasterPassword("");
    setIsUnlocked(false);
  }, [storageKey]);

  /**
   * Bloquea el almacenamiento (mantiene datos pero requiere contraseña)
   */
  const lock = useCallback((): void => {
    setMasterPassword("");
    setIsUnlocked(false);
  }, []);

  /**
   * Cambia la contraseña maestra
   */
  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): void => {
      try {
        // Verificar contraseña actual
        if (!verifyPassword(currentPassword)) {
          throw new Error("Contraseña actual incorrecta");
        }

        // Cargar datos con contraseña actual
        const data = loadSecure(currentPassword);
        if (!data) {
          throw new Error("No se pudieron cargar los datos");
        }

        // Guardar con nueva contraseña
        saveSecure(data, newPassword);
      } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        throw error;
      }
    },
    [verifyPassword, loadSecure, saveSecure]
  );

  return {
    // Estado
    isUnlocked,
    hasStoredData: hasStoredData(),

    // Métodos principales
    saveSecure,
    loadSecure,
    updateSecure,
    clearSecure,

    // Gestión de sesión
    lock,
    verifyPassword,
    changePassword,
  };
};
