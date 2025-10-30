import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Ensure browsers that request `/favicon.ico` receive our custom icon
      { source: '/favicon.ico', destination: '/favicon/favicon.ico' },
    ];
  },
};

export default nextConfig;
