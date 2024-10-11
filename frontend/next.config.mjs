/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*', // Proxy para o backend
        },
      ];
    },
  };
  
  export default nextConfig;