import { createPool, sql as directConnection } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

let client;

if (process.env.NODE_ENV === 'production') {
  client = directConnection;
} else {
  client = createPool({
    connectionString: process.env.POSTGRES_URL_NO_SSL,
  });
}

export const db = drizzle(client);
