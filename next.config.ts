import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Páginas autenticadas (cookies do Supabase) renderizam por requisição.
  cacheComponents: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
