/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.1.2:3000',
        '192.168.1.2',
        'localhost:3000',
        '127.0.0.1:3000',
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
