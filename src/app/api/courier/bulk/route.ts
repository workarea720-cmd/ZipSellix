// src/app/api/courier/bulk/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const COURIER_PREFIXES: Record<string, string> = {
    'postex': 'PX', 'leopards': 'LP', 'tcs': 'TC',
    'trax': 'TX', 'callcourier': 'CC', 'm&p': 'MP',
};

function generateCN(courierName: string): string {
    const key = courierName.toLowerCase().replace(/\s/g, '');
    const prefix = COURIER_PREFIXES[key] || courierName.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
}

function parseCSV(csv: string): any[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s/g, '_'));
    return lines.slice(1).map((line, idx) => {
        const values = line.split(',').map(v => v.trim());
        const row: any = { _row: idx + 2 };
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return row;
    });
}

function validateRow(row: any): string[] {
    const errors: string[] = [];
    if (!row.name?.trim()) errors.push('name is required');
    if (!row.phone?.trim()) errors.push('phone is required');
    if (!row.address?.trim()) errors.push('address is required');
    if (!row.city?.trim()) errors.push('city is required');
    if (row.cod && isNaN(parseFloat(row.cod))) errors.push('cod must be a number');
    if (row.weight && isNaN(parseFloat(row.weight))) errors.push('weight must be a number');
    return errors;
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Login required' }, { status: 401 });
        }

        // ✅ FIX: email se real DB id lo + PRO check ek hi query mein
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, planType: true, subscriptionStatus: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ✅ PRO check
        const isPro = dbUser.planType?.toUpperCase() === 'PRO' && dbUser.subscriptionStatus === 'ACTIVE';
        if (!isPro) {
            return NextResponse.json({
                error: 'Bulk shipment requires Pro plan. Please upgrade.',
                requiresUpgrade: true,
            }, { status: 403 });
        }

        const formData = await request.formData();
        const csvFile = formData.get('csv') as File;
        const courierName = formData.get('courier') as string || 'PostEx';
        const senderName = formData.get('senderName') as string || '';
        const senderAddress = formData.get('senderAddress') as string || '';
        const senderCity = formData.get('senderCity') as string || '';
        const senderPhone = formData.get('senderPhone') as string || '';

        if (!csvFile) return NextResponse.json({ error: 'CSV file required' }, { status: 400 });

        const csvText = await csvFile.text();
        const rows = parseCSV(csvText);

        if (rows.length === 0) return NextResponse.json({ error: 'CSV is empty or malformed' }, { status: 400 });
        if (rows.length > 200) return NextResponse.json({ error: 'Maximum 200 shipments per batch' }, { status: 400 });

        const results: any[] = [];
        const errors: any[] = [];

        for (const row of rows) {
            const rowErrors = validateRow(row);
            if (rowErrors.length > 0) {
                errors.push({ row: row._row, errors: rowErrors, data: row });
                continue;
            }

            try {
                const trackingNumber = generateCN(courierName);
                const shipment = await prisma.shipment.create({
                    data: {
                        trackingNumber,
                        courierName,
                        shipmentStatus: 'BOOKED',
                        orderRef: row.order_ref || row.ref || null,
                        paymentType: (row.payment_type || 'COD').toUpperCase() === 'PREPAID' ? 'PREPAID' : 'COD',
                        codAmount: parseFloat(row.cod) || 0,
                        weight: row.weight || '0.5',
                        pieces: row.pieces || '1',
                        contents: row.contents || row.description || null,
                        senderName,
                        senderPhone,
                        senderAddress,
                        senderCity,
                        receiverName: row.name,
                        receiverPhone: row.phone,
                        receiverAddress: row.address,
                        receiverCity: row.city,
                        receiverProvince: row.province || null,
                        userId: dbUser.id,   // ✅ real DB id
                        courierResponse: { mode: 'bulk_mock', row: row._row },
                    },
                });
                results.push({
                    row: row._row,
                    success: true,
                    trackingNumber: shipment.trackingNumber,
                    shipmentId: shipment.id,
                    receiverName: row.name,
                    city: row.city,
                });
            } catch (e: any) {
                errors.push({ row: row._row, errors: [e.message], data: row });
            }
        }

        return NextResponse.json({
            total: rows.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}