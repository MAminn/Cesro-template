ALTER TABLE "order" ADD COLUMN "daftra_sync_status" text DEFAULT 'not_synced';--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_order_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_invoice_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_customer_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_last_sync_error" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "daftra_payload" jsonb;