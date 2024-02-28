import { sql as client } from '@vercel/postgres';
import dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { Argon2id } from 'oslo/password';

import { logger } from '../logger';
import { userTable } from './schema';

dotenv.config({ path: '.env.local' });

const authDatabase = drizzle(client);

async function migrate() {
  try {
    await authDatabase.execute(sql`DROP TABLE IF EXISTS "session"`);
    await authDatabase.execute(sql`DROP TABLE IF EXISTS "user"`);

    await authDatabase.execute(sql`CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL
        );`);

    await authDatabase.execute(sql`CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "password" text NOT NULL
        );`);

    await authDatabase.execute(sql`DO $$ BEGIN
        ALTER TABLE "session"
        ADD CONSTRAINT "session_user_id_user_id_fk"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON DELETE no action
        ON UPDATE no action;
        EXCEPTION
        WHEN duplicate_object THEN null;
        END $$;`);

    const userSelectResult = await authDatabase
      .select()
      .from(userTable)
      .where(eq(userTable.id, 'admin'))
      .limit(1);

    if (userSelectResult.length) {
      await authDatabase.delete(userTable).where(eq(userTable.id, 'admin'));
    }

    const adminPassword = process.env.ADMIN_PASSWORD!;

    if (!adminPassword) {
      throw new Error(
        'Admin Password not found. Read README.md and setup env.local.',
      );
    }

    const hashedPassword = await new Argon2id().hash(adminPassword);

    await authDatabase
      .insert(userTable)
      .values({ id: 'admin', password: hashedPassword });

    await client.end();
  } catch (error) {
    logger.error('Vercel Postgres Auth DB', error);
  }
}
migrate();
