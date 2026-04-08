import type { NextConfig } from "next";

const defaultFundingOpsOrigin = "https://funding-ops.vercel.app";
const configuredFundingOpsOrigin = process.env.FUNDING_OPS_ORIGIN?.trim();
const fundingOpsOrigin =
  configuredFundingOpsOrigin === "https://funding-ops.joche.dev"
    ? defaultFundingOpsOrigin
    : configuredFundingOpsOrigin || defaultFundingOpsOrigin;

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
