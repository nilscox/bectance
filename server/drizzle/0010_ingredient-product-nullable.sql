ALTER TABLE "ingredients" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "label" varchar(255);--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "unit" varchar(255);--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_product_id_xor_label" CHECK (("product_id" IS NULL) != ("label" IS NULL));--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_label_and_unit" CHECK (("label" IS NULL) = ("unit" IS NULL));