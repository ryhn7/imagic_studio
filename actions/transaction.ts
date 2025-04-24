'use server';

import { db } from "@/database/drizzle";
import { transactions } from "@/database/schema";
import { handleError } from "@/lib/utils";
import Stripe from "stripe";
import { updateCredits } from "./user.action";

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const amount = Number(transaction.amount) * 100;

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: transaction.plan,
                            description: `Purchase ${transaction.amount} credits`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                credits: transaction.credits,
                plan: transaction.plan,
                buyerId: transaction.buyerId,
            },
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        })

        return session.url ?? null;


    } catch (error) {
        handleError(error);
    }
}

export async function createDBTransaction(transaction: CreateTransactionParams) {
    try {
        const newTransaction = await db.insert(transactions).values({
            ...transaction,
            buyerId: transaction.buyerId,
        }).returning();

        await updateCredits(transaction.buyerId, transaction.credits);

        return newTransaction[0];
    } catch (error) {
        handleError(error);
    }
}