// src/app/api/courier/track/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface TrackingEvent {
    timestamp: string;
    status: string;
    location: string;
    description: string;
}

const COURIER_CONFIG = {
    postex: {
        enabled: !!process.env.POSTEX_API_TOKEN,
        token: process.env.POSTEX_API_TOKEN || '',
        baseUrl: 'https://api.postex.pk/services/integration/api',
    },
    leopards: {
        enabled: !!(process.env.LEOPARDS_API_KEY && process.env.LEOPARDS_API_PASSWORD),
        apiKey: process.env.LEOPARDS_API_KEY || '',
        apiPassword: process.env.LEOPARDS_API_PASSWORD || '',
        baseUrl: 'https://www.leopardscourier.com/api',
    },
};

async function trackPostEx(cn: string) {
    const res = await fetch(`${COURIER_CONFIG.postex.baseUrl}/order/details/${cn}`, {
        headers: { 'token': COURIER_CONFIG.postex.token },
    });
    const data = await res.json();
    if (!res.ok) throw new Error('PostEx tracking failed');

    const events: TrackingEvent[] = (data.dist?.orderTrail || []).map((e: any) => ({
        timestamp: e.createdOn,
        status: e.orderStatus,
        location: e.operationName || '',
        description: e.orderStatusDescription || e.orderStatus,
    }));

    return {
        currentStatus: data.dist?.orderStatus || 'BOOKED',
        currentLocation: data.dist?.city || '',
        estimatedDelivery: '',
        events,
        source: 'postex_api',
    };
}

async function trackLeopards(cn: string) {
    const res = await fetch(
        `${COURIER_CONFIG.leopards.baseUrl}/trackBookedPacket?api_key=${COURIER_CONFIG.leopards.apiKey}&api_password=${COURIER_CONFIG.leopards.apiPassword}&track_numbers=${cn}`
    );
    const data = await res.json();
    if (data.status !== 1) throw new Error('Leopards tracking failed');

    const packet = data.packet_list?.[0];
    const events: TrackingEvent[] = (packet?.activity || []).map((a: any) => ({
        timestamp: a.cn_date,
        status: a.cn_status,
        location: a.city_name || '',
        description: a.status,
    }));

    return {
        currentStatus: packet?.booked_packet_status || 'BOOKED',
        currentLocation: packet?.destination_city || '',
        estimatedDelivery: '',
        events,
        source: 'leopards_api',
    };
}

function buildEventsFromDB(shipment: any): TrackingEvent[] {
    const statusOrder = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const statusLabels: Record<string, string> = {
        BOOKED: 'Order Booked — awaiting pickup',
        PICKED_UP: 'Parcel collected from sender',
        IN_TRANSIT: 'Parcel in transit to destination hub',
        OUT_FOR_DELIVERY: 'Out for delivery with rider',
        DELIVERED: 'Successfully delivered to recipient',
        FAILED: 'Delivery attempt failed',
        RETURNED: 'Parcel returned to sender',
        CANCELLED: 'Shipment cancelled',
    };

    const currentIdx = statusOrder.indexOf(shipment.shipmentStatus);
    const events: TrackingEvent[] = [];

    for (let i = currentIdx; i >= 0; i--) {
        const st = statusOrder[i];
        const hoursAgo = (currentIdx - i) * 6;
        const t = new Date(shipment.bookedAt);
        t.setHours(t.getHours() + hoursAgo);
        events.push({
            timestamp: t.toISOString(),
            status: st,
            location: i === 0 ? (shipment.senderCity || 'Origin') : (shipment.receiverCity || 'Destination'),
            description: statusLabels[st] || st,
        });
    }

    return events;
}

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
        const cn = searchParams.get('cn')?.trim();
        const courier = searchParams.get('courier') || '';

        if (!cn) {
            return NextResponse.json({ error: 'Tracking number required' }, { status: 400 });
        }

        // Step 1: DB mein dhundo
        const shipment = await prisma.shipment.findFirst({
            where: {
                trackingNumber: cn,
                userId: dbUser.id,   // ✅ real DB id
            },
        });

        // Step 2: Real courier API try karo
        const courierKey = (courier || shipment?.courierName || '').toLowerCase();
        let apiResult = null;

        try {
            if (courierKey === 'postex' && COURIER_CONFIG.postex.enabled) {
                apiResult = await trackPostEx(cn);
            } else if (courierKey === 'leopards' && COURIER_CONFIG.leopards.enabled) {
                apiResult = await trackLeopards(cn);
            }
        } catch (e) {
            console.warn('Courier API tracking failed, falling back to DB:', e);
        }

        // Step 3: API result mila to return karo + DB update
        if (apiResult) {
            if (shipment) {
                const dbStatus = apiResult.currentStatus.toUpperCase().replace(/ /g, '_') as any;
                await prisma.shipment.update({
                    where: { id: shipment.id },
                    data: { shipmentStatus: dbStatus },
                });
            }

            return NextResponse.json({
                trackingNumber: cn,
                courierName: shipment?.courierName || courier,
                currentStatus: apiResult.currentStatus,
                currentLocation: apiResult.currentLocation,
                estimatedDelivery: apiResult.estimatedDelivery,
                events: apiResult.events,
                shipmentId: shipment?.id,
                source: apiResult.source,
            });
        }

        // Step 4: DB fallback
        if (shipment) {
            await new Promise(r => setTimeout(r, 600));
            return NextResponse.json({
                trackingNumber: cn,
                courierName: shipment.courierName,
                currentStatus: shipment.shipmentStatus,
                currentLocation: shipment.shipmentStatus === 'BOOKED'
                    ? (shipment.senderCity || 'Origin Hub')
                    : (shipment.receiverCity || 'Destination'),
                estimatedDelivery: shipment.estimatedDelivery
                    ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-PK')
                    : '2-3 Business Days',
                events: buildEventsFromDB(shipment),
                shipmentId: shipment.id,
                source: 'db',
                isMock: true,
            });
        }

        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

    } catch (error: any) {
        console.error('Tracking error:', error);
        return NextResponse.json({ error: error.message || 'Tracking failed' }, { status: 500 });
    }
}