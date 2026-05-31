ALTER TYPE "public"."user_role" ADD VALUE 'accountant' BEFORE 'vendor';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'sales' BEFORE 'vendor';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;