/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@toolbox/design-tokens', '@toolbox/shared', '@toolbox/ui-web', '@toolbox/db'],
};
export default nextConfig;
