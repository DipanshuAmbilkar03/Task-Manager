import { Resolver } from "node:dns/promises";
import mongoose from "mongoose";

// Public DNS resolver used ONLY for Atlas SRV/TXT lookups. Some local
// networks (mobile hotspots, captive portals) run DNS servers that refuse
// SRV queries, which breaks `mongodb+srv://` URIs in the mongodb driver.
// The app itself is unaffected — this just resolves the seed hosts first.
const publicDns = new Resolver();
publicDns.setServers(["8.8.8.8", "1.1.1.1"]);

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

/** True when a MongoDB connection string is configured. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/**
 * Convert a `mongodb+srv://` URI into a plain `mongodb://` URI by resolving
 * the SRV record over public DNS. Works around local networks whose DNS
 * refuses SRV lookups for the mongodb driver. Non-SRV URIs pass through.
 */
async function resolveDirectUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;
  const withoutScheme = uri.slice("mongodb+srv://".length);
  // Format: [username:password@]host[/dbname][?options]
  const atIndex = withoutScheme.lastIndexOf("@");
  const credentials = atIndex === -1 ? "" : withoutScheme.slice(0, atIndex + 1);
  const afterAuth = atIndex === -1 ? withoutScheme : withoutScheme.slice(atIndex + 1);
  const slash = afterAuth.indexOf("/");
  const host = slash === -1 ? afterAuth : afterAuth.slice(0, slash);
  const rest = slash === -1 ? "" : afterAuth.slice(slash);
  const records = await publicDns.resolveSrv(`_mongodb._tcp.${host}`);
  if (!records.length) throw new Error(`No SRV records for ${host}`);
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");
  // rest = /dbname?options  → split path and query
  const qIndex = rest.indexOf("?");
  const dbPath = qIndex === -1 ? rest : rest.slice(0, qIndex);
  const query = qIndex === -1 ? "" : rest.slice(qIndex);
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.set("tls", "true");
  if (!params.has("replicaSet")) {
    try {
      const txt = await publicDns.resolveTxt(host);
      const flat = txt.flat().join("&");
      const match = flat.match(/replicaSet=([^&\s]+)/);
      params.set("replicaSet", match ? match[1] : "atlas-11tad2-shard-0");
      const authSrc = flat.match(/authSource=([^&\s]+)/);
      if (authSrc && !params.has("authSource")) params.set("authSource", authSrc[1]);
    } catch {
      params.set("replicaSet", "atlas-11tad2-shard-0");
    }
  }
  const path = dbPath === "" || dbPath === "/" ? "/task-manager" : dbPath;
  return `mongodb://${credentials}${hosts}${path}?${params.toString()}`;
}

/**
 * Connect to MongoDB (cached across hot reloads / serverless invocations).
 * Returns null when no MONGODB_URI is set, so callers can fall back
 * to the temporary in-memory store.
 */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (!isDbConfigured()) return null;

  if (global.__mongooseCache?.conn) return global.__mongooseCache.conn;
  if (!global.__mongooseCache) {
    global.__mongooseCache = { conn: null, promise: null };
  }

  if (!global.__mongooseCache.promise) {
    global.__mongooseCache.promise = (async () => {
      const uri = await resolveDirectUri(process.env.MONGODB_URI as string);
      return mongoose.connect(uri);
    })();
  }

  global.__mongooseCache.conn = await global.__mongooseCache.promise;
  return global.__mongooseCache.conn;
}
