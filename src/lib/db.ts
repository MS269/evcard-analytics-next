import sqlite from 'better-sqlite3';
import oracledb from 'oracledb';
import { Argon2id } from 'oslo/password';

import { logger } from './logger';

export interface DatabaseUser {
  id: string;
  password: string;
}

// TODO: drizzle-orm + vercel-postgres
// TODO: migrate script
export const authDb = sqlite('auth.db');

export async function migrateAuthDb() {
  try {
    authDb.exec('PRAGMA foreign_keys = OFF');

    authDb.exec(`DROP TABLE IF EXISTS user`);
    authDb.exec(`DROP TABLE IF EXISTS session`);

    authDb.exec(`CREATE TABLE IF NOT EXISTS user (
      id TEXT NOT NULL PRIMARY KEY,
      password TEXT NOT NULL
  )`);

    authDb.exec(`CREATE TABLE IF NOT EXISTS session (
      id TEXT NOT NULL PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
  )`);

    const admin = authDb
      .prepare(`SELECT * FROM user WHERE id = ?`)
      .get('admin') as DatabaseUser | undefined;

    if (admin) {
      authDb.prepare(`DELETE FROM user WHERE id = ?`).run('admin');
    }

    const adminPassword = process.env.ADMIN_PASSWORD!;

    if (!adminPassword) {
      throw new Error('Admin password not found. Read README.md.');
    }

    const hashedPassword = await new Argon2id().hash(adminPassword);

    authDb
      .prepare(`INSERT INTO user (id, password) VALUES (?, ?)`)
      .run('admin', hashedPassword);

    authDb.exec('PRAGMA foreign_keys = ON');
  } catch (error) {
    logger.error('DB', error);
  }
}

// TODO: rename
export const dbConfig: oracledb.ConnectionAttributes = {
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  connectString: `${process.env.DB_HOST!}:${process.env.DB_PORT!}/${process.env.DB_SID!}`,
};

if (!dbConfig.user || !dbConfig.password || !dbConfig.connectString) {
  throw new Error('DB config not found. Read README.md.');
}
