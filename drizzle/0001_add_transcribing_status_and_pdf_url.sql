ALTER TYPE "report_status" ADD VALUE IF NOT EXISTS 'transcribing' BEFORE 'needs_review';--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "pdf_url" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "pdf_public_id" text;
