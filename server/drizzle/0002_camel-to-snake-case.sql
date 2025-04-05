ALTER TABLE "shopping_list_items" RENAME COLUMN "shoppingListId" TO "shopping_list_id";--> statement-breakpoint
ALTER TABLE "shopping_list_items" RENAME COLUMN "productId" TO "product_id";--> statement-breakpoint
ALTER TABLE "stocks" RENAME COLUMN "productId" TO "product_id";--> statement-breakpoint
ALTER TABLE "shopping_list_items" DROP CONSTRAINT "order_unique";--> statement-breakpoint
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "order_unique" UNIQUE("shopping_list_id","position");