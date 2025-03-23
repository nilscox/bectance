CREATE TYPE "public"."unit" AS ENUM('unit', 'gram', 'liter');--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit" "unit" NOT NULL,
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "shopping_lists" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" date,
	"cost" numeric
);
--> statement-breakpoint
CREATE TABLE "shopping_list_items" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"shoppingListId" varchar(8) NOT NULL,
	"productId" varchar(8) NOT NULL,
	"quantity" integer,
	"checked" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"productId" varchar(8) NOT NULL,
	"quantity" integer NOT NULL
);
