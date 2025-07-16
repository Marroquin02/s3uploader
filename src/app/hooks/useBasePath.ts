import { useEffect, useState } from "react";

/**
 * Hook para obtener el basePath configurado en Next.js
 * Útil para construir rutas de API que respeten el basePath
 */
export function useBasePath() {
  const [basePath, setBasePath] = useState("");

  useEffect(() => {
    // Obtener basePath desde la configuración pública de Next.js
    const nextData = (
      globalThis as {
        __NEXT_DATA__?: { runtimeConfig?: { basePath?: string } };
      }
    ).__NEXT_DATA__;
    const config = nextData?.runtimeConfig;
    const configuredBasePath =
      config?.basePath || process.env.NEXT_PUBLIC_BASE_PATH || "";
    setBasePath(configuredBasePath);
  }, []);

  /**
   * Construye una ruta de API con el basePath correcto
   * @param apiPath - Ruta de la API (ej: '/api/s3/test-connection')
   * @returns Ruta completa con basePath
   */
  const buildApiPath = (apiPath: string) => {
    // Asegurar que apiPath comience con /
    const normalizedApiPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
    return `${basePath}${normalizedApiPath}`;
  };

  return {
    basePath,
    buildApiPath,
  };
}
