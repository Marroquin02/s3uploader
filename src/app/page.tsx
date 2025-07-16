"use client";

import S3Uploader from "./components/S3Uploader";
import Navbar from "./components/Navbar";
import AuthWrapper from "./components/AuthWrapper";
import { ConditionalRender } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <AuthWrapper loadingMessage="Inicializando S3 Uploader...">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              S3 File Uploader
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sube archivos a Amazon S3 de forma segura y sencilla
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Bienvenido a S3 Uploader
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Para comenzar a subir archivos, necesitas iniciar sesión con tu
                  cuenta.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Subida segura</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Múltiples formatos</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Control de acceso</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <ConditionalRender
                requiredRoles={["uploader", "admin", "administrator"]}
                fallback={
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                      Sin Permisos de Subida
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Tu cuenta no tiene permisos para subir archivos. Contacta al
                      administrador para obtener acceso.
                    </p>
                  </div>
                }
              >
                <S3Uploader />
              </ConditionalRender>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
