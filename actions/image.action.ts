
'use server';

import { handleError } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary'
import { eq } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { db } from "@/database/drizzle";
import { users, images } from "@/database/schema";
import { redirect } from 'next/navigation';

async function getImageWithUser(imageId: string) {
    const result = await db
        .select({
            image: images,
            author: {
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                clerkId: users.clerkId,
            }
        })
        .from(images)
        .leftJoin(users, eq(images.authorId, users.id))
        .where(eq(images.id, imageId))
        .limit(1);

    return result[0] || null;
}

export async function addImage(params: AddImageParams) {
    try {
        const { image, userId, path } = params;

        const author = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (author.length === 0) {
            throw new Error('User not found');
        }

        const newImage = await db.insert(images).values({
            ...image,
            authorId: author[0].id,
        }).returning();

        revalidatePath(path);

        return newImage[0];
    } catch (error) {
        handleError(error);
    }
}

export async function updateImage(params: UpdateImageParams) {
    try {
        const { image, userId, path } = params;

        const imageToUpdate = await db.select().from(images).where(eq(images.id, image._id)).limit(1);

        if (imageToUpdate.length === 0 || imageToUpdate[0].authorId !== userId) {
            throw new Error('Unauthorized or image not found');
        }

        const updatedImage = await db.update(images).set({
            ...image,
        }).where(eq(images.id, image._id)).returning();

        revalidatePath(path);

        return updatedImage[0];
    } catch (error) {
        handleError(error);
    }
}

export async function deleteImage(imageId: string) {
    try {
        await db.delete(images).where(eq(images.id, imageId));
    } catch (error) {
        handleError(error);
    } finally {
        redirect('/');
    }
}

export async function getImageById(imageId: string) {
    try {
        const imagewithAuthor = await getImageWithUser(imageId);

        if (!imagewithAuthor) {
            throw new Error('Image not found');
        }

        return imagewithAuthor;
    } catch (error) {
        handleError(error);
    }
}