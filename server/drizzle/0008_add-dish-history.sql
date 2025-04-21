CREATE TABLE "dish_history" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"recipe_id" varchar(8) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "recipe_instance_id" varchar(8);--> statement-breakpoint
ALTER TABLE "dish_history" ADD CONSTRAINT "dish_history_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_instance_id_dish_history_id_fk" FOREIGN KEY ("recipe_instance_id") REFERENCES "public"."dish_history"("id") ON DELETE no action ON UPDATE no action;