import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: text('id').primaryKey(),
  password: text('password').notNull(),
});

export type User = typeof userTable.$inferSelect;

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const cacheTable = pgTable('cache', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
