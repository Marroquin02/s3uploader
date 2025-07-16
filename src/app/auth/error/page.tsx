"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useBasePath } from "../../hooks/useBasePath";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { basePath } = useBasePath();

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Error de Configuración",
          description: "Hay un problema con la configuración del servidor de autenticación.",
          suggestion: "Por favor, contacta al administrador del sistema.",
        };
      case "AccessDenied":
        return {
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder a esta aplicación.",
          suggestion: "Contacta al administrador para solicitar acceso.",
        };
      case "Verification":
        return {
          title: "Error de Verificación",
          description: "El token de verificación es inválido o ha expirado.",
          suggestion: "Por favor, solicita un nuevo enlace de verificación.",
        };
      default:
        return {
          title: "Error de Autenticación",
          description: "Ha ocurrido un error durante el proceso de autenticación.",
          suggestion: "Por favor, inténtalo de nuevo más tarde.",
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {errorDetails.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {errorDetails.description}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {errorDetails.suggestion}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Código de error: <span className="font-mono">{error}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href={`${basePath}/auth/signin`}
            className="w-full flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Intentar de Nuevo
          </Link>
          
          <Link
            href={`${basePath}/`}
            className="w-full flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Si el problema persiste, contacta al soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-8"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}