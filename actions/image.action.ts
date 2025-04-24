/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { handleError } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary'
import { eq, inArray, desc, sql } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { db } from "@/database/drizzle";
import { users, images } from "@/database/schema";
import { redirect } from 'next/navigation';

interface GetAllImagesParams {
    limit?: number;
    page: number;
    searchQuery?: string;
}

interface GetUserImagesParams extends GetAllImagesParams {
    userId: string;
}

async function getImageWithUser(imageId: string) {
    const result = await db
        .select({
            image: images,
            author: {
                id: users.id,
                userName: users.username,
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

export async function getAllImages(params: GetAllImagesParams) {
    const { limit = 9, page = 1, searchQuery = '' } = params;

    try {
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        let expression = 'folder=imagic_studio'

        if (searchQuery) {
            expression += ` AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search
            .expression(expression)
            .execute();

        const resourceIds = resources.map((resource: any) => resource.public_id);

        const whereClause = searchQuery
            ? inArray(images.publicId, resourceIds)
            : undefined;

        const offset = (Number(page) - 1) * limit;

        const rawData = await db
            .select({
                image: images,
                author: {
                    id: users.id,
                    userName: users.username,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    clerkId: users.clerkId,
                }
            })
            .from(images)
            .leftJoin(users, eq(images.authorId, users.id))
            .where(whereClause)
            .orderBy(desc(images.updatedAt))
            .limit(limit)
            .offset(offset);

        const imageData = rawData.map((entry) => ({
            ...entry.image,
            author: entry.author ?? undefined,
        }));

        const [{ count: totalImages }] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(images)
            .where(whereClause ?? sql`TRUE`);

        const [{ count: savedImages }] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(images);

        return {
            data: imageData,
            totalPage: Math.ceil(Number(totalImages) / limit),
            savedImages: Number(savedImages),
        };

    } catch (error) {
        handleError(error);
    }
}

export async function getUserImages(params: GetUserImagesParams) {
    const { limit = 9, page = 1, userId } = params;

    try {


        const offset = (Number(page) - 1) * limit;

        const rawData = await db
            .select({
                image: images,
                author: {
                    id: users.id,
                    userName: users.username,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    clerkId: users.clerkId,
                }
            })
            .from(images)
            .leftJoin(users, eq(images.authorId, users.id))
            .where(eq(images.authorId, userId)) 
            .orderBy(desc(images.updatedAt))
            .limit(limit)
            .offset(offset);

        const imageData = rawData.map((entry) => ({
            ...entry.image,
            author: entry.author ?? undefined,
        }));

        const [{ count: totalImages }] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(images)
            .where(eq(images.authorId, userId));

        return {
            data: imageData,
            totalPage: Math.ceil(Number(totalImages) / limit),
        };

    } catch (error) {
        handleError(error);
    }
}

