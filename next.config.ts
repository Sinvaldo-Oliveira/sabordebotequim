import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autossuficiente (pasta dist/ + PM2), ativado só pelo script
  // `npm run build:dist`. Em plataformas que compilam do código-fonte
  // (Nixpacks, Vercel etc.) fica desligado, porque `next start` não é
  // compatível com output: "standalone".
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
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
