CREATE TYPE "user_plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "user_billing_interval" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "report_type" AS ENUM('guided', 'digitized');--> statement-breakpoint
CREATE TYPE "report_status" AS ENUM('draft', 'transcribing', 'needs_review', 'structuring', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "token_status" AS ENUM('active', 'blacklisted');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "report_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"template" varchar(100) NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"edit_instructions" text,
	"raw_photo_urls" text[],
	"raw_photo_public_ids" text[],
	"transcript" text,
	"flagged_fields" jsonb,
	"structured_data" jsonb,
	"ai_assisted" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"status" "token_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"avatar_url" text,
	"plan" "user_plan" DEFAULT 'free' NOT NULL,
	"billing_interval" "user_billing_interval",
	"digitized_count_today" smallint DEFAULT 0 NOT NULL,
	"guided_count_today" smallint DEFAULT 0 NOT NULL,
	"usage_reset_at" date DEFAULT CURRENT_DATE NOT NULL,
	"prompt_credit" integer DEFAULT 10 NOT NULL,
	"prompt_credit_reset_at" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;