import { NextResponse } from 'next/server';
import { calculateCourierCost, Zone } from '@/lib/postexEngine';
import { auth } from '@/auth';
import { checkAndIncrement } from '@/lib/usageLimit';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Login karo pehle' }, { status: 401 });
        }

        const isPro = session.user.planType?.toUpperCase() === 'PRO';

        // --- FREE TIER LIMIT: 50 calculations/day ---
        if (!isPro) {
            const check = await checkAndIncrement(session.user.id, 'calculationsToday');
            if (!check.allowed) {
                return NextResponse.json(
                    { success: false, limitReached: true, error: check.reason },
                    { status: 403 }
                );
            }
        }

        const body = await req.json();
        const {
            sellingPrice, costPrice, marketingCost,
            weight, zone, packagingCost, miscCost, rtoPercent,
        } = body;

        const shipping = calculateCourierCost(Number(weight), zone as Zone);
        const totalRevenue = Number(sellingPrice);
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