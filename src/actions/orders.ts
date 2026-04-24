'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getOrders() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            include: { product: true },
            orderBy: { date: 'desc' }
        });

        return { success: true, orders };
    } catch (e) {
        return { success: false, error: 'Failed to fetch orders' };
    }
}

export async function createOrder(payload: {
    customerName: string;
    city: string;
    salePrice: number;
    productCost?: number;
    shippingCost?: number;
    packagingCost?: number;
    fixedCostShare?: number;
    netProfit?: number;
    status?: string;
    productId?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const orderData: Prisma.OrderCreateInput = {
            user: { connect: { id: session.user.id } },
            customerName: payload.customerName,
            city: payload.city,
            salePrice: payload.salePrice,
            productCost: payload.productCost || 0,
            shippingCost: payload.shippingCost || 0,
            packagingCost: payload.packagingCost || 0,
            fixedCostShare: payload.fixedCostShare || 0,
            netProfit: payload.netProfit || 0,
            status: payload.status || 'PENDING',
            ...(payload.productId && { product: { connect: { id: payload.productId } } })
        };

        const order = await prisma.order.create({
            data: orderData
        });

        revalidatePath('/dashboard');
        return { success: true, order };
    } catch (e) {
        return { success: false, error: 'Failed to create order' };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        await prisma.order.update({
            where: { id: orderId, userId: session.user.id },
            data: { status }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to update order' };
    }
}
