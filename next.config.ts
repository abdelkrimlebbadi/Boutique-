import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Demo catalog placeholder images (supabase/seed.sql). Swap/extend
      // for the real Supabase Storage host once product photography exists.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Supabase Storage (product-images, custom-designs) — every uploaded
      // product photo and customer design thumbnail is served from here.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default withNextIntl(nextConfig);
