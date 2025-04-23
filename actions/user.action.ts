'use server';

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { handleError } from "@/lib/utils";
import { eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createUser(user: CreateUserParams) {
    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(or(eq(users.clerkId, user.clerkId), eq(users.email, user.email)))
            .limit(1);

        if (existingUser.length > 0) {
            return existingUser[0]; // User sudah ada, return data existing
        }

        const inserted = await db.insert(users).values(user).returning();
        return inserted[0]; // Kembalikan user yang baru dibuat

    } catch (error) {
        handleError(error);
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

        return user[0]; // Kembalikan user yang ditemukan
    } catch (error) {
        handleError(error);
    }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        const updatedUser = await db
            .update(users)
            .set(user)
            .where(eq(users.clerkId, clerkId))
            .returning();

        return updatedUser[0]; // Kembalikan user yang diperbarui

    } catch (error) {
        handleError(error);
    }
}

export async function deleteUser(clerkId: string) {
    try {
        const deletedUser = await db
            .delete(users)
            .where(eq(users.clerkId, clerkId))
            .returning();

        revalidatePath("");

        return deletedUser[0]; // Kembalikan user yang dihapus

    } catch (error) {
        handleError(error);
    }
}

export async function updateCredits(userId: string, creditFee: number) {
    try {
        const updatedUser = await db
            .update(users)
            .set({
                creditBalance: sql`${users.creditBalance} + ${creditFee}`
            })
            .where(eq(users.id, userId))
            .returning();

        if (updatedUser.length === 0) {
            throw new Error("User credits update failed");
        }

        console.log("Updated user credits:", updatedUser[0]);

        return updatedUser[0]; // Kembalikan user yang diperbarui

    } catch (error) {
        handleError(error);
    }
}