"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Unauthorized() {
  const { user, roles } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acceso No Autorizado
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No tienes los permisos necesarios para acceder a esta página.
            </p>

            {user && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">Usuario:</span> {user.name || user.email}
                </p>
                {roles.length > 0 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Roles actuales:</span> {roles.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Volver al Inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Volver Atrás
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Si crees que deberías tener acceso a esta página, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}