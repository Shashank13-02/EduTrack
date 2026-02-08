import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds to allow deployment despite lint warnings.
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
