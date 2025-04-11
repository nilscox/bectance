ALTER TABLE "shopping_list_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_list_items" ADD COLUMN "label" varchar(255);--> statement-breakpoint
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_product_id_xor_label" CHECK (("product_id" IS NULL) != ("label" IS NULL));