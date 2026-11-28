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
    // AVIF first: typically 30-50% smaller than WebP on photographs, which is
    // where this site's weight is (hero slides and course thumbnails). Next
    // falls back to WebP, then the original, based on the Accept header.
    formats: ['image/avif', 'image/webp'],
    // Optimised images were being re-generated every 4 hours (the default),
    // and each miss costs ~1.3s of CPU on this shared host. The URLs are
    // content-addressed by src+width+quality, so a long TTL is safe.
    minimumCacheTTL: 2678400,
    // Next 16 only serves qualities declared here. These are the values used
    // across the site (thumbnails through to full-bleed hero backgrounds).
    qualities: [60, 70, 75, 76, 78, 80, 82, 86, 90],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048],
  },
  // mysql2 must stay a real Node module (never bundled for the edge runtime).
  serverExternalPackages: ['mysql2', 'bcryptjs'],
  experimental: {
    // cPanel/CloudLinux accounts cap concurrent processes (LVE NPROC). Next's
    // default of one static-generation worker per task spawns ~30 processes
    // during `next build` and the build dies with EAGAIN. One worker keeps the
    // build inside the cap; it is slower but reliable on shared hosting.
    cpus: 1,
  },
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
