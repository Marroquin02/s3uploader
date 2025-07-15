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
  },

  // Configuración de trailing slash para compatibilidad
  trailingSlash: true,

  webpack: (config, { isServer }) => {
    // Optimizaciones para AWS SDK en el navegador
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
