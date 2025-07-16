"use client";

import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { useBasePath } from "./useBasePath";

export function useKeycloakLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { basePath } = useBasePath();

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Obtener configuración de Keycloak
      const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
      
      if (keycloakIssuer && clientId) {
        // Construir URL de logout de Keycloak con base path
        const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/`);
        const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;
        
        // Cerrar sesión en NextAuth sin redirección automática
        await signOut({ 
          callbackUrl: `${basePath}/`, 
          redirect: false 
        });
        
        // Pequeña pausa para asegurar que el logout se procese
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirigir al logout de Keycloak
        window.location.href = logoutUrl;
      } else {
        // Fallback: logout normal de NextAuth con base path
        console.warn("Keycloak configuration not found for complete logout. Using fallback.");
        await signOut({ callbackUrl: `${basePath}/` });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
      // En caso de error, al menos redirigir a la página principal con base path
      window.location.href = `${basePath}/`;
    }
  }, [basePath]);

  return { logout, isLoggingOut };
}