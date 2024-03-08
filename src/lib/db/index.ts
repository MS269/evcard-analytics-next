import { createPool, sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

let client;

if (process.env.NODE_ENV === 'production') {
  client = sql;
} else {
  client = createPool({
    connectionString: process.env.POSTGRES_URL_NO_SSL,
  });
}

export const db = drizzle(client);
