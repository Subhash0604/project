/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // optional, disables optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Specific subdomain for many profile pics
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "googleusercontent.com", // Base domain
        pathname: "/**",
      },
      // If you are using Google services for sign-in, it's also common to see:
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
