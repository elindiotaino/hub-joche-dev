import type { NextConfig } from "next";

const fundingOpsOrigin = process.env.FUNDING_OPS_ORIGIN;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!fundingOpsOrigin) {
      return [];
    }

    return [
      {
        source: "/funding-ops",
        destination: `${fundingOpsOrigin}/funding-ops`,
      },
      {
        source: "/funding-ops/:path+",
        destination: `${fundingOpsOrigin}/funding-ops/:path+`,
      },
    ];
  },
};

export default nextConfig;
