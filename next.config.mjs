/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable Gzip/Brotli compression for all HTTP responses.
  // Reduces payload size significantly for JS bundles and API responses.
  compress: true,

  // Configure Server Actions Body Size Limit (default 1MB, increased to 50MB for scan files/PDFs)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // Allow Next.js Image Optimization (<Image />) to serve and optimize
  // images from remote domains. Without this config, external images
  // fall back to raw <img> tags and bypass lazy-loading, format conversion
  // (WebP/AVIF), and responsive sizing hints.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // No pathname restriction — allow any Unsplash image path
      },
    ],
  },
};

export default nextConfig;
