import { createPool, sql as directConnection } from '@vercel/postgres';
import dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { Argon2id } from 'oslo/password';

import { logger } from '../logger';
import { userTable } from './schema';

dotenv.config({ path: '.env.local' });

async function migrate() {
  const { error } = logger(migrate.name);

  try {
    let client;

    if (process.env.NODE_ENV === 'production') {
      client = directConnection;
    } else {
      client = createPool({
        connectionString: process.env.POSTGRES_URL_NO_SSL,
      });
    }

    const db = drizzle(client);

    await db.execute(sql`DROP TABLE IF EXISTS "session"`);
    await db.execute(sql`DROP TABLE IF EXISTS "user"`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL
        );`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "password" text NOT NULL
        );`);

    await db.execute(sql`DO $$ BEGIN
        ALTER TABLE "session"
        ADD CONSTRAINT "session_user_id_user_id_fk"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON DELETE no action
        ON UPDATE no action;
        EXCEPTION
        WHEN duplicate_object THEN null;
        END $$;`);

    const userSelectResult = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, 'admin'))
      .limit(1);

    if (userSelectResult.length) {
      await db.delete(userTable).where(eq(userTable.id, 'admin'));
    }

    const adminPassword = process.env.ADMIN_PASSWORD!;

    if (!adminPassword) {
      throw new Error(
        'Admin Password not found. Read README.md and setup env.local.',
      );
    }

    const hashedPassword = await new Argon2id().hash(adminPassword);

    await db
      .insert(userTable)
      .values({ id: 'admin', password: hashedPassword });

    await client.end();
  } catch (err) {
    error(err);
  }
}
migrate();
