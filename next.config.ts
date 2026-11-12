import type { NextConfig } from 'next';
import { env } from './src/config/env';

const imageHosts = [`${env.apiUrl}/uploads/**`, ...(env.imageUrl ? [`${env.imageUrl}/**`] : [])];

// Next.js refuses to optimize images from private addresses. Allow it only for an API on this
// machine, as when developing.
const localHostnames = ['localhost', '127.0.0.1', '[::1]'];
const imagesAreLocal = localHostnames.includes(new URL(env.apiUrl).hostname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        // Guest order links hold a private token, which must never reach another site.
        source: '/orders/guest',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
  images: {
    remotePatterns: imageHosts.map((host) => new URL(host)),
    dangerouslyAllowLocalIP: imagesAreLocal,
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
