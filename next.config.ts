import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "randomuser.me" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
