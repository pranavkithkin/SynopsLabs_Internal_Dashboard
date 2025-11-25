/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build for Docker
  },
  images: {
    unoptimized: true, // For better Docker compatibility
  },
}

export default nextConfig
