// drizzle/schema.ts

import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid, json, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    photo: text("photo").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    planId: integer("plan_id").default(1),
    creditBalance: integer("credit_balance").default(10),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable("transactions", {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    stripeId: text("stripe_id").notNull().unique(),
    amount: integer("amount").notNull(),
    plan: text("plan"),
    credits: integer("credits"),
    buyerId: uuid("buyer_id").references(() => users.id), // Foreign key ke users.id
});

export const images = pgTable("images", {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    title: text("title").notNull(),
    transformationType: text("transformation_type").notNull(),
    publicId: text("public_id").notNull(),
    secureURL: text("secure_url").notNull(),
    width: integer("width"),
    height: integer("height"),
    config: json("config"), // cocok untuk object bebas
    transformationUrl: text("transformation_url"),
    aspectRatio: varchar("aspect_ratio", { length: 10 }),
    color: varchar("color", { length: 20 }),
    prompt: text("prompt"),
    authorId: uuid("author_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ------------------
// RELATIONS (Optional)
// ------------------

export const userRelations = relations(users, ({ many }) => ({
    transactions: many(transactions),
    images: many(images),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
    buyer: one(users, {
        fields: [transactions.buyerId],
        references: [users.id],
    }),
}));

export const imageRelations = relations(images, ({ one }) => ({
    author: one(users, {
        fields: [images.authorId],
        references: [users.id],
    }),
}));

