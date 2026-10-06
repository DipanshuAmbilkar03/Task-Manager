import dns from "node:dns";

/**
 * Runs before anything else in the Node runtime.
 * Some local networks (mobile hotspots, captive portals) ship DNS servers
 * that refuse SRV lookups, which breaks `mongodb+srv://` Atlas URIs.
 * Preferring public resolvers fixes local dev; Vercel's own DNS is
 * unaffected and resolves Atlas normally.
 */
export async function register() {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore — default resolvers will be used
  }
}
