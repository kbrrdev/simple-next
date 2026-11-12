import type { NextConfig } from 'next';
import { env } from './src/config/env';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Only the API's uploaded files. Storage hosts, such as S3, are added when images are shown.
    remotePatterns: [new URL(`${env.apiUrl}/uploads/**`)],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
