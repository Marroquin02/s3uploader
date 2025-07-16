"use client";

interface AuthLoadingProps {
  message?: string;
}

export default function AuthLoading({
  message = "Verificando autenticación...",
}: AuthLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Logo/Icono animado */}
          <div className="mb-6">
            <div className="relative mx-auto w-16 h-16">
              {/* Círculo exterior giratorio */}
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>

              {/* Icono S3 en el centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 4.5L19.5 8 12 11.5 4.5 8 12 4.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            S3 File Uploader
          </h2>

          {/* Mensaje de estado */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

          {/* Barra de progreso animada */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full animate-pulse"
              style={{
                width: "60%",
                animation: "loading-bar 2s ease-in-out infinite",
              }}
            ></div>
          </div>

          {/* Puntos de carga animados */}
          <div className="flex justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>Cargando...</p>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 20%;
          }
          50% {
            width: 80%;
          }
          100% {
            width: 20%;
          }
        }
      `}</style>
    </div>
  );
}
