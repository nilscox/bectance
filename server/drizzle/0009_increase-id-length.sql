ALTER TABLE "dish_history" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "dish_history" ALTER COLUMN "recipe_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "recipe_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "dish_history_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "product_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "shopping_lists" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "shopping_list_items" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "shopping_list_items" ALTER COLUMN "shopping_list_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "shopping_list_items" ALTER COLUMN "product_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "stocks" ALTER COLUMN "id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "stocks" ALTER COLUMN "product_id" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "dish_history" ADD COLUMN "date" timestamp NOT NULL;