/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
     middlewareClientMaxBodySize: "200mb", // Add this line
  },
  // Note: For App Router API routes, body size is handled by the runtime
  // You may need to set NODE_OPTIONS=--max-old-space-size=4096 or similar
  // for very large uploads, or use a streaming approach
};

export default nextConfig;
