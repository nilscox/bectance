ALTER TABLE "shopping_list_items" ADD COLUMN "position" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "order_unique" UNIQUE("shoppingListId","position");