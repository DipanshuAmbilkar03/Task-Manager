import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt out of Next.js auto-generating AGENTS.md / CLAUDE.md helper files.
  agentRules: false,
};

export default nextConfig;
