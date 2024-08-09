/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["pbs.twimg.com", "cdn-production-opera-website.operacdn.com", "via.placeholder.com", "iili.io", "api.dicebear.com"],

  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
