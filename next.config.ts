import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Webpack aliases — prevent browser from trying to load
  // server-only native modules (sharp, onnxruntime-node).
  // These are needed for rembg / AI image tools on the Python side.
  // NOTE: turbopack block removed — turbopack and webpack() are mutually
  // exclusive in Next.js 15. webpack() is used for both dev and production builds.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;