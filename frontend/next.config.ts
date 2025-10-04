import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Temporarily disable standalone for Docker debugging
  // output: "standalone",
  // Environment variables for Docker container
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  },
  // Disable strict type checking and linting during build for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
