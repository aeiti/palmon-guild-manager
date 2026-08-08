import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Neon + Drizzle. The HTTP driver connects per-query, so constructing with a
 * placeholder URL is harmless — it only fails if you actually query without
 * DATABASE_URL set, which keeps `next build` green before secrets are wired.
 */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost/placeholder";

export const db = drizzle(neon(connectionString), { schema });

export { schema };
