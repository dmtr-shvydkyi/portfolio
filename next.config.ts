import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No rewrites needed when a real `/public/favicon.ico` exists
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
