import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      }
    ]
  }
};

export default nextConfig;
