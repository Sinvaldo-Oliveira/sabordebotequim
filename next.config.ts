import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autossuficiente para deploy em VPS (Hostinger) com PM2
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
