import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["172.20.10.8"],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://docugyan-backend.onrender.com/api/:path*",
      },
      {
        // Special case for auth endpoints that don't start with /api/ in your Django urls
        source: "/api/backend/auth/:path*",
        destination: "https://docugyan-backend.onrender.com/:path*",
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
