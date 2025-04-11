CREATE TABLE "ingredients" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"recipe_id" varchar(8) NOT NULL,
	"product_id" varchar(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL
);
