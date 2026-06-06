import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "*.ykaromarques.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/minio/:path*',
        destination: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/:path*`,
      },
    ];
  },
  turbopack: {},
};

export default nextConfig;
