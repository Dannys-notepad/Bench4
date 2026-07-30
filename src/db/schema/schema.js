import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    googleId: varchar('google_id', {length: 255}).unique(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// export const reports = pgTable('reports', {

// })