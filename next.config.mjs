/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '200mb'
    }
  }
};

export default nextConfig;
