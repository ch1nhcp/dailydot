import { defineConfig } from "drizzle-kit";

import { env } from "./src/env.mjs";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
});
