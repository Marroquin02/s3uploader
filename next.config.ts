import type { NextConfig } from "next";

// Configuración dinámica del basePath desde variables de entorno
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // BasePath dinámico configurado desde variables de entorno
  basePath: basePath,

  // Configuración para assets estáticos
  assetPrefix: basePath,

  publicRuntimeConfig: {
    basePath,
    assetPrefix: basePath,
  },

  // Configuración de trailing slash para compatibilidad
  trailingSlash: true,
};

export default nextConfig;
