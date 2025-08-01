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
  // Enhanced webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Ensure case-sensitive module resolution (important for Linux builds)
    config.resolve.plugins = config.resolve.plugins || [];
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;