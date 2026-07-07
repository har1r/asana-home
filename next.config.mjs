/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable Gzip/Brotli compression for all HTTP responses.
  // Reduces payload size significantly for JS bundles and API responses.
  compress: true,

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
