import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash: true,
  allowedDevOrigins: ["172.20.10.8"],
  async rewrites() {
    return [];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
