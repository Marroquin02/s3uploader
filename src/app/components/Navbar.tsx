"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useKeycloakLogout } from "../hooks/useKeycloakLogout";
import { useBasePath } from "../hooks/useBasePath";

export default function Navbar() {
  const { basePath } = useBasePath();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isLoggingOut } = useKeycloakLogout();

  const handleSignOut = () => {
    logout();
  };

  const handleSignIn = () => {
    signIn("keycloak", { callbackUrl: `${basePath}/` });
  };

  if (status === "loading" || isLoggingOut) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                S3 Uploader
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                {isLoggingOut && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cerrando sesión...
                  </span>
                )}
                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              S3 Uploader
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      Bienvenido,{" "}
                      <span className="font-medium">{session.user?.name}</span>
                    </p>
                    {session.user?.roles && session.user.roles.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Roles: {session.user.roles.slice(0, 1).join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {session ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      Bienvenido,{" "}
                      <span className="font-medium">{session.user?.name}</span>
                    </p>
                    {session.user?.roles && session.user.roles.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Roles: {session.user.roles.slice(0, 1).join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
