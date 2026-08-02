import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    googleId: varchar('google_id', { length: 255 }).unique(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    template: varchar('template', { length: 100 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('draft'),
    rawPhotoUrls: text('raw_photo_urls').array(),
    rawPhotoPublicIds: text('raw_photo_public_ids').array(),
    transcript: text('transcript'),
    structuredData: jsonb('structured_data'),
    flaggedFields: jsonb('flagged_fields'),
    version: integer('version').notNull().default(1),
    approvedAt: timestamp('approved_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});