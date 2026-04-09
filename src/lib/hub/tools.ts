export type HubToolDefinition = {
  key: string;
  name: string;
  description: string;
  href: string;
  repo: string;
  status: "live" | "planned";
  adminOnly?: boolean;
};

export const HUB_TOOLS: HubToolDefinition[] = [
  {
    key: "funding-ops",
    name: "Funding Ops",
    description: "Track funding programs, deadlines, and submission tasks.",
    href: process.env.FUNDING_OPS_URL ?? "https://hub.joche.dev/funding-ops",
    repo: "https://github.com/elindiotaino/funding-ops",
    status: "live",
  },
  {
    key: "lola-ai",
    name: "Lola AI",
    description: "Personal AI assistant for local and remote operations.",
    href: process.env.LOLA_URL ?? "https://lola.joche.dev",
    repo: "https://github.com/elindiotaino/lola",
    status: "live",
    adminOnly: true,
  },
];

export function getToolDefinition(key: string) {
  return HUB_TOOLS.find((tool) => tool.key === key) ?? null;
}
