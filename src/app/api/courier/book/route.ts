// src/app/api/courier/book/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// ─── City Code Map ───────────────────────────────────────────────────
const CITY_CODES: Record<string, string> = {
    'karachi': 'KHI', 'lahore': 'LHE', 'islamabad': 'ISB', 'rawalpindi': 'RWP',
    'faisalabad': 'FSD', 'multan': 'MUL', 'peshawar': 'PSH', 'quetta': 'QTA',
    'sialkot': 'SKT', 'gujranwala': 'GRW', 'hyderabad': 'HYD', 'bahawalpur': 'BWP',
    'sargodha': 'SGD', 'sukkur': 'SUK', 'larkana': 'LRK', 'abbottabad': 'ABT',
    'mardan': 'MRD', 'gujrat': 'GJT', 'sahiwal': 'SWL', 'dera ghazi khan': 'DGK',
    'dera ismail khan': 'DIK', 'chiniot': 'CNT', 'jhang': 'JHG', 'rahim yar khan': 'RYK',
    'muzaffarabad': 'MZD', 'mirpur': 'MRP', 'swat': 'SWT', 'mansehra': 'MNS',
};

function getCityCode(city: string): string {
    if (!city) return 'UNK';
    return CITY_CODES[city.toLowerCase().trim()] || city.substring(0, 3).toUpperCase();
}

const COURIER_PREFIXES: Record<string, string> = {
    'postex': 'PX', 'leopards': 'LP', 'tcs': 'TC',
    'trax': 'TX', 'callcourier': 'CC', 'm&p': 'MP',
    'bluex': 'BX', 'sonic': 'SN',
};

function generateCN(courierName: string): string {
    const key = courierName.toLowerCase().replace(/\s/g, '');
    const prefix = COURIER_PREFIXES[key] || courierName.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
}

// ─── Courier API Config ───────────────────────────────────────────────
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

// ─── Real PostEx Booking ──────────────────────────────────────────────
async function bookViaPostEx(body: any) {
    const res = await fetch(`${COURIER_CONFIG.postex.baseUrl}/order/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': COURIER_CONFIG.postex.token,
        },
        body: JSON.stringify({
            cityName: body.receiverCity,
            customerName: body.receiverName,
            customerPhone: body.receiverPhone,
            deliveryAddress: body.receiverAddress,
            invoicePayment: body.codAmount || 0,
            invoiceAmount: body.codAmount || 0,
            items: parseInt(body.pieces) || 1,
            orderRefNumber: body.orderRef,
            orderType: body.paymentType === 'COD' ? '1' : '2',
            pickupAddressCode: 'DEFAULT',
        }),
    });
    const data = await res.json();
    if (data.statusCode !== '200') throw new Error(data.message || 'PostEx booking failed');
    return {
        trackingNumber: data.dist?.trackingNumber,
        routingCode: data.dist?.orderStatus || '',
        courierBookingId: data.dist?.trackingNumber,
        courierResponse: data,
    };
}

// ─── Real Leopards Booking ────────────────────────────────────────────
async function bookViaLeopards(body: any) {
    const res = await fetch(`${COURIER_CONFIG.leopards.baseUrl}/bookPacket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: COURIER_CONFIG.leopards.apiKey,
            api_password: COURIER_CONFIG.leopards.apiPassword,
            booked_packet_weight: body.weight || '0.5',
            booked_packet_no_piece: parseInt(body.pieces) || 1,
            booked_packet_collect_amount: body.codAmount || 0,
            booked_packet_order_id: body.orderRef,
            origin_city: body.senderCity || '',
            destination_city: body.receiverCity,
            shipment_name_eng: body.receiverName,
            shipment_phone: body.receiverPhone,
            shipment_address: body.receiverAddress,
        }),
    });
    const data = await res.json();
    if (data.status !== 1) throw new Error(data.error || 'Leopards booking failed');
    return {
        trackingNumber: data.track_number,
        routingCode: `${getCityCode(body.senderCity)}-${getCityCode(body.receiverCity)}`,
        courierBookingId: data.track_number,
        courierResponse: data,
    };
}

// ─── POST Handler ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        // ✅ Auth check
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ status: 401, message: 'Login required' }, { status: 401 });
        }

        // ✅ FIX: email se real DB id lo
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!dbUser) {
            return NextResponse.json({ status: 401, message: 'Session expired or user deleted. Please log in again.' }, { status: 401 });
        }

        const body = await request.json();
        const courierKey = (body.courierName || '').toLowerCase().replace(/\s/g, '');

        let trackingNumber: string;
        let routingCode: string;
        let courierBookingId: string | undefined;
        let courierResponse: any;
        let isMock = false;

        // Real API ya mock
        if (courierKey === 'postex' && COURIER_CONFIG.postex.enabled) {
            const result = await bookViaPostEx(body);
            trackingNumber = result.trackingNumber;
            routingCode = result.routingCode;
            courierBookingId = result.courierBookingId;
            courierResponse = result.courierResponse;

        } else if (courierKey === 'leopards' && COURIER_CONFIG.leopards.enabled) {
            const result = await bookViaLeopards(body);
            trackingNumber = result.trackingNumber;
            routingCode = result.routingCode;
            courierBookingId = result.courierBookingId;
            courierResponse = result.courierResponse;

        } else {
            // Mock mode — proper CN format, DB mein save
            isMock = true;
            trackingNumber = generateCN(body.courierName || 'ZS');
            routingCode = `${getCityCode(body.senderCity || '')}-${getCityCode(body.receiverCity || '')}`;
            courierBookingId = trackingNumber;
            courierResponse = { mode: 'mock', generatedAt: new Date().toISOString() };
            await new Promise(r => setTimeout(r, 1200));
        }

        // ✅ DB mein save — real dbUser.id use hoga
        const shipment = await prisma.shipment.create({
            data: {
                trackingNumber,
                routingCode,
                courierName: body.courierName || 'Unknown',
                shipmentStatus: 'BOOKED',
                orderRef: body.orderRef || null,
                paymentType: body.paymentType === 'COD' ? 'COD' : 'PREPAID',
                codAmount: parseFloat(body.codAmount) || 0,
                weight: body.weight || null,
                pieces: body.pieces || null,
                contents: body.contents || null,
                senderName: body.senderName || '',
                senderPhone: body.senderPhone || null,
                senderAddress: body.senderAddress || null,
                senderCity: body.senderCity || null,
                receiverName: body.receiverName || '',
                receiverPhone: body.receiverPhone || '',
                receiverAddress: body.receiverAddress || '',
                receiverCity: body.receiverCity || '',
                receiverProvince: body.receiverProvince || null,
                receiverEmail: body.receiverEmail || null,
                fragile: body.instructions?.fragile || false,
                dontOpen: body.instructions?.dontOpen || false,
                callFirst: body.instructions?.callFirst || false,
                insurance: body.instructions?.insurance || false,
                signature: body.instructions?.signature || false,
                specialInstructions: body.specialInstructions || null,
                courierBookingId: courierBookingId || null,
                courierResponse,
                userId: dbUser.id,   // ✅ real DB id
            },
        });

        return NextResponse.json({
            status: 200,
            message: 'Order Booked Successfully',
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            routingCode: shipment.routingCode,
            barcodeValue: shipment.trackingNumber,
            qrData: shipment.trackingNumber,
            courierName: shipment.courierName,
            bookedAt: shipment.bookedAt.toISOString(),
            isMock,
        });

    } catch (error: any) {
        console.error('Courier booking error:', error);
        return NextResponse.json(
            { status: 500, message: error.message || 'Booking failed. Please try again.' },
            { status: 500 }
        );
    }
}