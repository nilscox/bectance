UPDATE "shopping_list_items" set "quantity" = 1;
ALTER TABLE "shopping_list_items" ALTER COLUMN "quantity" SET NOT NULL;

ALTER TABLE "products" ADD COLUMN "default_quantity" integer;
UPDATE "products" set "default_quantity" = 1;
ALTER TABLE "products" ALTER COLUMN "default_quantity" SET NOT NULL;
