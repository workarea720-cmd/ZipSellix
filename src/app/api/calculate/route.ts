import { NextResponse } from 'next/server';
import { calculateCourierCost, Zone } from '@/lib/postexEngine';
// import dbConnect from '@/lib/db'; // Uncomment when DB is connected
// import User from '@/models/User'; // Uncomment when DB is connected

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            sellingPrice, costPrice, marketingCost,
            weight, zone, packagingCost, miscCost, rtoPercent,
            isPro // In real app, this comes from Session/Auth
        } = body;

        // --- SAAS LIMIT LOGIC (Mocked for now) ---
        // In a real app: Check DB for user usage count.
        // If (plan === 'free' && usage > 50) return Error.

        // 1. Calculate Shipping (The Engine)
        const shipping = calculateCourierCost(Number(weight), zone as Zone);

        // 2. Financial Math
        const totalRevenue = Number(sellingPrice);

        // RTO Logic: 
        // If RTO is 10%, it means 10% of orders fail. 
        // You lose Shipping + Packaging + Marketing on those.
        // We amortize this loss across successful orders or show it as "Expected Loss".
        const rtoProbability = Number(rtoPercent) / 100;
        const rtoLossPerOrder = (shipping.total + Number(packagingCost) + Number(marketingCost)) * rtoProbability;

        const totalCosts =
            Number(costPrice) +
            Number(marketingCost) +
            Number(packagingCost) +
            Number(miscCost) +
            shipping.total +
            rtoLossPerOrder;

        const netProfit = totalRevenue - totalCosts;
        const margin = (netProfit / totalRevenue) * 100;

        // 3. Construct Response
        return NextResponse.json({
            success: true,
            data: {
                shipping,
                financials: {
                    revenue: totalRevenue,
                    totalCosts: Math.round(totalCosts),
                    netProfit: Math.round(netProfit),
                    margin: margin.toFixed(2),
                    rtoLosses: Math.round(rtoLossPerOrder)
                },
                // Only return advanced suggestions if PRO
                suggestions: isPro ? [
                    "Increase price by Rs 200 to hit 20% margin",
                    "PostEx 'Same Province' is your most profitable zone"
                ] : null
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Calculation failed' }, { status: 500 });
    }
}