import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    ppr: true,
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // jika kamu punya domain gambar tambahan, bisa ditambah di sini
      // {
      //   protocol: "https",
      //   hostname: "*.supabase.co",
      // },
    ],
  },
};

export default nextConfig;