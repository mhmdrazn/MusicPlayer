import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
