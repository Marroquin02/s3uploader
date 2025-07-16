import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: basePath,

  assetPrefix: basePath,

  publicRuntimeConfig: {
    basePath,
    assetPrefix: basePath,
  },

  trailingSlash: true,

  output: "standalone",

  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
