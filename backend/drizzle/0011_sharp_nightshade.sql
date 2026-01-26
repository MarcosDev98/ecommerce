ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;