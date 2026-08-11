import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/Manager" : "";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
