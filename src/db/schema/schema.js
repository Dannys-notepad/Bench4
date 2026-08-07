import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, smallint, date, pgEnum, boolean } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm'

const userPlanEnum = pgEnum('user_plan', ['free', 'pro'])
const billingIntervalEnum = pgEnum('user_billing_interval', ['weekly', 'monthly', 'yearly'])
const reportTypeEnum = pgEnum('report_type', ['guided', 'digitized'])
const reportStatusEnum = pgEnum('report_status', ['draft', 'needs_review', 'structuring', 'completed'])
const tokenStatusEnum = pgEnum('token_status', ['active', 'blacklisted'])

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    googleId: varchar('google_id', { length: 255 }).unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),

    plan: userPlanEnum('plan').notNull().default('free'),
    billingInterval: billingIntervalEnum('billing_interval'),

    digitizedCounToday: smallint('digitized_count_today').notNull().default(0),
    guidedCountToday: smallint('guided_count_today').notNull().default(0),
    usageResetAt: date('usage_reset_at').notNull().default(sql`CURRENT_DATE`),

    promptCredits: integer('prompt_credit').notNull().default(10),
    promptCreditResetAt: date('prompt_credit_reset_at').notNull().default(sql`CURRENT_DATE`),
    

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    reportType: reportTypeEnum('type').notNull(),

    title: varchar('title', { length: 255 }).notNull(),
    template: varchar('template', { length: 100 }).notNull(),
    status: reportSourceEnum('status').notNull().default('draft'),

    editInstructions: text('edit_instructions'),
    rawPhotoUrls: text('raw_photo_urls').array(),
    rawPhotoPublicIds: text('raw_photo_public_ids').array(),
    transcript: text('transcript'),
    flaggedFields: jsonb('flagged_fields'),

    structuredData: jsonb('structured_data'),
    aiAssisted: boolean('ai_assisted').notNull().default(false),
    version: integer('version').notNull().default(1),
    approvedAt: timestamp('approved_at'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    token: text('token').notNull(),
    status: tokenStatusEnum('status').notNull().default('active'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
})