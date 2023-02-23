/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // env: {
  //   APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  // },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/public/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
