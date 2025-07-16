"use client";

import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";

export function useKeycloakLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Obtener configuración de Keycloak
      const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
      
      if (keycloakIssuer && clientId) {
        // Construir URL de logout de Keycloak
        const redirectUri = encodeURIComponent(window.location.origin);
        const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;
        
        // Cerrar sesión en NextAuth sin redirección automática
        await signOut({ 
          callbackUrl: "/", 
          redirect: false 
        });
        
        // Pequeña pausa para asegurar que el logout se procese
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirigir al logout de Keycloak
        window.location.href = logoutUrl;
      } else {
        // Fallback: logout normal de NextAuth
        console.warn("Keycloak configuration not found for complete logout. Using fallback.");
        await signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
      // En caso de error, al menos redirigir a la página principal
      window.location.href = "/";
    }
  }, []);

  return { logout, isLoggingOut };
}