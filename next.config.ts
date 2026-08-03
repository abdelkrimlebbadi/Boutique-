import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Next.js defaults Server Actions to a 1MB request body — well under
    // our own 10MB upload limit (src/lib/uploads/sniff-image.ts). A real
    // phone photo (2-10MB) would otherwise be silently rejected by the
    // framework before uploadDesignImage/finalizeCartItemDesign ever run,
    // surfacing as an uncaught error instead of our validation messages.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
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
