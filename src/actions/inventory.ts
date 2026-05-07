'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

// Fetch all products for the logged in user
export async function getProducts() {
    noStore(); // FIX: Prevent Next.js from caching stale inventory data

    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const products = await prisma.product.findMany({
            where: { userId: session.user.id },
            include: {
                batches: {
                    orderBy: { dateAdded: 'desc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, products };
    } catch (e) {
        console.error('getProducts Error', e);
        return { success: false, error: 'Failed to fetch products' };
    }
}

// Create a new product
export async function createProduct(payload: {
    name: string;
    sku?: string;
    category?: string;
    initialStock?: number;
    costPrice?: number;
    sellingPrice?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const productData: Prisma.ProductCreateInput = {
            name: payload.name,
            sku: payload.sku || null,
            category: payload.category || 'General',
            currentStock: payload.initialStock || 0,
            averageCost: payload.costPrice || 0,
            sellingPrice: payload.sellingPrice || 0,
            user: { connect: { id: session.user.id } },
            batches: payload.initialStock && payload.initialStock > 0 ? {
                create: [{
                    batchName: 'Initial Stock',
                    initialQty: payload.initialStock,
                    remainingQty: payload.initialStock,
                    totalCost: payload.initialStock * (payload.costPrice || 0),
                    costPerItem: payload.costPrice || 0,
                }]
            } : undefined
        };

        const product = await prisma.product.create({
            data: productData
        });

        // FIX: Revalidate the specific path where inventory is shown
        revalidatePath('/tools/profit-calculator');
        return { success: true, product };
    } catch (e) {
        console.error('createProduct Error', e);
        return { success: false, error: 'Failed to create product' };
    }
}

// Delete product
export async function deleteProduct(productId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        await prisma.product.delete({
            where: { id: productId, userId: session.user.id }
        });

        // FIX: Revalidate the specific path where inventory is shown
        revalidatePath('/tools/profit-calculator');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete product' };
    }
}