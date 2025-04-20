ALTER TABLE "ingredients" ALTER COLUMN "quantity" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "default_quantity" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "shopping_list_items" ALTER COLUMN "quantity" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "stocks" ALTER COLUMN "quantity" SET DATA TYPE numeric;