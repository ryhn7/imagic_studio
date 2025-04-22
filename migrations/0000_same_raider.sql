CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"transformation_type" text NOT NULL,
	"public_id" text NOT NULL,
	"secure_url" text NOT NULL,
	"width" integer,
	"height" integer,
	"config" json,
	"transformation_url" text,
	"aspect_ratio" varchar(10),
	"color" varchar(20),
	"prompt" text,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "images_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"stripe_id" text NOT NULL,
	"amount" integer NOT NULL,
	"plan" text,
	"credits" integer,
	"buyer_id" uuid,
	CONSTRAINT "transactions_id_unique" UNIQUE("id"),
	CONSTRAINT "transactions_stripe_id_unique" UNIQUE("stripe_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"photo" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"plan_id" integer DEFAULT 1,
	"credit_balance" integer DEFAULT 10,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;