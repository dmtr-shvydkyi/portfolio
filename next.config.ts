import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
    formats: ["image/webp"],
    qualities: [75, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048, 3840],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{
      source: '/work-images/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
};

export default nextConfig;
