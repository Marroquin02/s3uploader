"use client";

import { useAuth, useAuthorization } from "../hooks/useAuth";
import { useBasePath } from "../hooks/useBasePath";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredGroups?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredGroups = [],
  requireAll = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole, hasAllRoles, hasAnyGroup, hasAllGroups } =
    useAuthorization();
  const { basePath } = useBasePath();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
            <button
              onClick={() => window.location.href = `${basePath}/auth/signin`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )
    );
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Sin Permisos Suficientes
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No tienes los permisos necesarios para acceder a esta página.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Roles requeridos: {requiredRoles.join(", ")}
              </p>
            </div>
          </div>
        )
      );
    }
  }

  if (requiredGroups.length > 0) {
    const hasRequiredGroups = requireAll
      ? hasAllGroups(requiredGroups)
      : hasAnyGroup(requiredGroups);

    if (!hasRequiredGroups) {
      return (
        fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Sin Permisos Suficientes
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No perteneces a los grupos necesarios para acceder a esta
                página.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Grupos requeridos: {requiredGroups.join(", ")}
              </p>
            </div>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredGroups?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function ConditionalRender({
  children,
  requiredRoles = [],
  requiredGroups = [],
  requireAll = false,
  fallback = null,
}: ConditionalRenderProps) {
  const { isAuthenticated } = useAuth();
  const { hasAnyRole, hasAllRoles, hasAnyGroup, hasAllGroups } =
    useAuthorization();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return <>{fallback}</>;
    }
  }

  if (requiredGroups.length > 0) {
    const hasRequiredGroups = requireAll
      ? hasAllGroups(requiredGroups)
      : hasAnyGroup(requiredGroups);

    if (!hasRequiredGroups) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
