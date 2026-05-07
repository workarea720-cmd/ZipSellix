// src/app/api/courier/shipments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Login required' }, { status: 401 });
        }

        // ✅ FIX: email se real DB id lo
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = { userId: dbUser.id };   // ✅ real DB id
        if (status && status !== 'ALL') where.shipmentStatus = status;

        const [shipments, total] = await Promise.all([
            prisma.shipment.findMany({
                where,
                orderBy: { bookedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    trackingNumber: true,
                    routingCode: true,
                    courierName: true,
                    shipmentStatus: true,
                    orderRef: true,
                    paymentType: true,
                    codAmount: true,
                    receiverName: true,
                    receiverCity: true,
                    receiverPhone: true,
                    senderName: true,
                    weight: true,
                    pieces: true,
                    bookedAt: true,
                    estimatedDelivery: true,
                },
            }),
            prisma.shipment.count({ where }),
        ]);

        // Stats
        const stats = await prisma.shipment.groupBy({
            by: ['shipmentStatus'],
            where: { userId: dbUser.id },   // ✅ real DB id
            _count: { id: true },
        });

        const statsMap = stats.reduce((acc: Record<string, number>, s) => {
            acc[s.shipmentStatus] = s._count.id;
            return acc;
        }, {});

        return NextResponse.json({
            shipments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            stats: {
                total,
                booked: statsMap.BOOKED || 0,
                inTransit: (statsMap.IN_TRANSIT || 0) + (statsMap.PICKED_UP || 0) + (statsMap.OUT_FOR_DELIVERY || 0),
                delivered: statsMap.DELIVERED || 0,
                failed: (statsMap.FAILED || 0) + (statsMap.RETURNED || 0),
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Login required' }, { status: 401 });
        }

        // ✅ FIX: email se real DB id lo
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { shipmentId } = await request.json();
        if (!shipmentId) return NextResponse.json({ error: 'Shipment ID required' }, { status: 400 });

        const shipment = await prisma.shipment.findFirst({
            where: { id: shipmentId, userId: dbUser.id },   // ✅ real DB id
        });

        if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

        if (!['BOOKED', 'PICKED_UP'].includes(shipment.shipmentStatus)) {
            return NextResponse.json({
                error: `Cannot cancel shipment with status: ${shipment.shipmentStatus}`
            }, { status: 400 });
        }

        const updated = await prisma.shipment.update({
            where: { id: shipmentId },
            data: { shipmentStatus: 'CANCELLED' },
        });

        return NextResponse.json({ success: true, shipment: updated });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}