import { NextRequest, NextResponse } from 'next/server';

// ─── City Code Map ──────────────────────────────────────────────────
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
    const normalized = city.toLowerCase().trim();
    return CITY_CODES[normalized] || city.substring(0, 3).toUpperCase();
}

function generateTrackingNumber(): string {
    const digits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
    return `TRK-${digits}`;
}

// ─── POST Handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            courierName,
            receiverCity,
            senderCity,
        } = body;

        // Simulate network delay (1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const trackingNumber = generateTrackingNumber();
        const originCode = getCityCode(senderCity || '');
        const destCode = getCityCode(receiverCity || '');
        const routingCode = `${originCode}-${destCode}`;

        const qrData = `https://track.courier.pk/${trackingNumber}`;

        return NextResponse.json({
            status: 200,
            message: 'Order Booked Successfully',
            trackingNumber,
            routingCode,
            barcodeValue: trackingNumber,
            qrData,
            courierName: courierName || 'Unknown',
            bookedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Courier booking error:', error);
        return NextResponse.json(
            { status: 500, message: 'Booking failed. Please try again.' },
            { status: 500 }
        );
    }
}
