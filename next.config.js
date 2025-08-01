/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // Ensure proper transpilation of dependencies
  transpilePackages: ['lucide-react', 'class-variance-authority'],
};

module.exports = nextConfig;