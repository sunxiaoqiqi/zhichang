import { count } from "drizzle-orm";
import { getDb } from "../../../db";
import { users } from "../../../db/schema";

export async function GET() {
  try {
    await getDb().select({ value: count() }).from(users);
    return Response.json({ status: "ok", database: "ok", version: "4", timestamp: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ status: "degraded", database: "error", version: "4", timestamp: new Date().toISOString() }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
