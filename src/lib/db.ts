import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/env.mjs";
import * as schema from "@/lib/schema";

export const db = drizzle(
  createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  }),
  { schema },
);
