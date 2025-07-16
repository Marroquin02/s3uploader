import { useState, useEffect } from "react";
import { useBasePath } from "./useBasePath";

interface KeycloakConfig {
  clientId: string | null;
  issuer: string | null;
}

export function useKeycloakConfig() {
  const [config, setConfig] = useState<KeycloakConfig>({
    clientId: null,
    issuer: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { buildApiPath, isLoaded } = useBasePath();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isLoaded) {
          setIsLoading(false);
          return;
        }

        const apiUrl = buildApiPath("/api/config");

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const data = await response.json();

        setConfig({
          clientId: data.keycloakClientId || null,
          issuer: data.keycloakIssuer || null,
        });
      } catch (err) {
        console.error("Error fetching Keycloak config:", err);
        setError(err instanceof Error ? err.message : "Unknown error");

        setConfig({
          clientId: null,
          issuer: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [buildApiPath, isLoaded]);

  return {
    ...config,
    isLoading,
    error,
  };
}
