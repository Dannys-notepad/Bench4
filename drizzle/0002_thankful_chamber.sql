ALTER TABLE "reports" ADD COLUMN "raw_photo_urls" text[];--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "raw_photo_public_ids" text[];--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "raw_photo_url";