import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Default to the deployed Railway instance; override via NEXT_PUBLIC_RISK_API_URL env var
    NEXT_PUBLIC_RISK_API_URL:
      process.env.NEXT_PUBLIC_RISK_API_URL ??
      "https://financial-risk-pipeline-production.up.railway.app",
  },
};

export default nextConfig;
