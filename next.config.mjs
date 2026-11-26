/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Allow remote educational imagery (Unsplash/Pexels) plus any CDN the admin configures.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
    formats: ['image/webp'],
    // Next 16 only serves qualities declared here. These are the values used
    // across the site (thumbnails through to full-bleed hero backgrounds).
    qualities: [60, 70, 75, 76, 78, 80, 82, 86, 90],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048],
  },
  // mysql2 must stay a real Node module (never bundled for the edge runtime).
  serverExternalPackages: ['mysql2', 'bcryptjs'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
