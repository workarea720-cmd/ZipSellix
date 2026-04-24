import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ye zaroori hai taake AI models browser mein load ho sakein
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;