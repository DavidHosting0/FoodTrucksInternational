import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function getConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL fehlt. Trage eine Postgres-Verbindungszeichenfolge in .env.local ein."
    );
  }
  return url;
}

export function getDb() {
  const client =
    globalForDb.postgresClient ??
    postgres(getConnectionString(), { max: 10, prepare: false });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof getDb>;
