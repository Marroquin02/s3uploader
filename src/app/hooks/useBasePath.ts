import { useEffect, useState, useCallback } from "react";

/**
 * Hook para obtener el basePath configurado en Next.js
 * Útil para construir rutas de API que respeten el basePath
 */
export function useBasePath() {
  const [basePath, setBasePath] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const nextData = (
      globalThis as {
        __NEXT_DATA__?: { runtimeConfig?: { basePath?: string } };
      }
    ).__NEXT_DATA__;
    const config = nextData?.runtimeConfig;
    const configuredBasePath =
      config?.basePath || process.env.NEXT_PUBLIC_BASE_PATH || "";
    setBasePath(configuredBasePath);
    setIsLoaded(true); 
  }, []);

  /**
   * Construye una ruta de API con el basePath correcto
   * @param apiPath - Ruta de la API (ej: '/api/s3/test-connection')
   * @returns Ruta completa con basePath
   */
  const buildApiPath = useCallback((apiPath: string) => {
    const normalizedApiPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
    return `${basePath}${normalizedApiPath}`;
  }, [basePath]);

  return {
    basePath,
    buildApiPath,
    isLoaded,
  };
}
