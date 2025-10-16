import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "static.usernames.app-backend.toolsforhumanity.com",
      "api.dicebear.com", // For fallback profile pictures
    ],
  },
  allowedDevOrigins: ["*"], // Add your dev origin here
  reactStrictMode: false,
};

export default nextConfig;
