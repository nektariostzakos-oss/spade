/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@toolbox/design-tokens', '@toolbox/shared', '@toolbox/ui-web'],
  experimental: { typedRoutes: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mux.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
};
export default nextConfig;
