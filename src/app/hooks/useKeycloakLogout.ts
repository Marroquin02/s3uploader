import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { useBasePath } from "./useBasePath";
import { useKeycloakConfig } from "./useKeycloakConfig";

export function useKeycloakLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { basePath } = useBasePath();
  const { clientId, issuer, isLoading: configLoading } = useKeycloakConfig();

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      if (issuer && clientId) {
        const redirectUri = encodeURIComponent(
          `${window.location.origin}${basePath}/`
        );
        const logoutUrl = `${issuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;

        await signOut({
          callbackUrl: `${basePath}/`,
          redirect: false,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        window.location.href = logoutUrl;
      } else {
        console.warn(
          "Keycloak configuration not found for complete logout. Using fallback."
        );
        await signOut({ callbackUrl: `${basePath}/` });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);

      window.location.href = `${basePath}/`;
    }
  }, [basePath, clientId, issuer]);

  return {
    logout,
    isLoggingOut: isLoggingOut || configLoading,
  };
}
