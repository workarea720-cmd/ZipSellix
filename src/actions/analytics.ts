'use server';

import { unstable_noStore as noStore } from 'next/cache'; // 👈 YEH IMPORT ADD KIYA HAI
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type {
    DateRangePreset,
    ReportsData,
    ReportsActionResponse,
    RevenueDataPoint,
    ProductPerformance,
    OrderStatusBreakdown,
    PaymentMethodSplit,
    CityRtoData,
    LedgerEntry,
    FinancialSummary,
    RtoAnalysis,
    SmartInsight,
} from '@/types/report-types';

// ============================================================
// Date Range Resolver
// ============================================================
function resolveDateRange(preset: DateRangePreset): { start: Date; end: Date } {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    switch (preset) {
        case 'today':
            return { start: startOfToday, end: endOfToday };

        case 'yesterday': {
            const yesterday = new Date(startOfToday);
            yesterday.setDate(yesterday.getDate() - 1);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            return { start: yesterday, end: endOfYesterday };
        }

        case 'last-7-days': {
            const start = new Date(startOfToday);
            start.setDate(start.getDate() - 6); // includes today
            return { start, end: endOfToday };
        }

        case 'this-month': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end: endOfToday };
        }

        case 'last-month': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return { start, end };
        }

        case 'last-3-months': {
            const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return { start, end: endOfToday };
        }

        case 'all-time':
        default:
            return { start: new Date(2020, 0, 1), end: endOfToday };
    }
}

/** Compute the comparison period (same length, immediately before) */
function getComparisonRange(start: Date, end: Date): { start: Date; end: Date } {
    const durationMs = end.getTime() - start.getTime();
    const compEnd = new Date(start.getTime() - 1); // 1ms before current start
    const compStart = new Date(compEnd.getTime() - durationMs);
    return { start: compStart, end: compEnd };
}

// ============================================================
// Main Server Action
// ============================================================
export async function getReportsData(
    preset: DateRangePreset = 'this-month'
): Promise<ReportsActionResponse> {
    noStore(); // 👈 YEH FUNCTION CALL ADD KIYA HAI TA'KE DATA CACHE NA HO

    try {
        // ── 1. Authentication ──
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }
        const userId = session.user.id;

        // ── 2. Resolve Date Ranges ──
        const { start, end } = resolveDateRange(preset);
        const comparison = getComparisonRange(start, end);

        // ── 3. Common Prisma Where Clause ──
        const baseWhere = {
            userId,
            date: { gte: start, lte: end },
        };
        const validWhere = {
            ...baseWhere,
            status: { notIn: ['CANCELLED'] },
        };

        // ── 4. Execute All Queries in Parallel ──
        const [
            // A) Aggregate financials for current period
            currentAgg,
            // B) Aggregate financials for comparison period
            comparisonAgg,
            // C) Group by paymentMethod
            paymentGroups,
            // D) Group by status
            statusGroups,
            // E) Group by date (time-series)
            dailyGroups,
            // F) Group by productId (top products)
            productGroups,
            // G) All returned orders grouped by city (RTO analysis)
            rtoByCity,
            // H) Expenses sum in date range
            expensesAgg,
            // I) Full orders for ledger (limited to 100)
            ledgerOrders,
            // J) COD return stats
            codReturnStats,
            // K) Prepaid return stats
            prepaidReturnStats,
        ] = await Promise.all([
            // A) Current period aggregate
            prisma.order.aggregate({
                where: validWhere,
                _sum: {
                    salePrice: true,
                    netProfit: true,
                    productCost: true,
                    shippingCost: true,
                    packagingCost: true,
                    quantity: true,
                },
                _count: { id: true },
                _avg: { salePrice: true },
            }),

            // B) Comparison period aggregate
            prisma.order.aggregate({
                where: {
                    userId,
                    date: { gte: comparison.start, lte: comparison.end },
                    status: { notIn: ['CANCELLED'] },
                },
                _sum: { salePrice: true, netProfit: true },
                _count: { id: true },
            }),

            // C) Payment method split
            prisma.order.groupBy({
                by: ['paymentMethod'],
                where: validWhere,
                _count: { id: true },
            }),

            // D) Status breakdown
            prisma.order.groupBy({
                by: ['status'],
                where: baseWhere,
                _count: { id: true },
            }),

            // E) Daily time-series — using Prisma ORM instead of raw SQL for Neon resilience
            prisma.order.findMany({
                where: validWhere,
                select: {
                    date: true,
                    salePrice: true,
                    netProfit: true,
                },
                orderBy: { date: 'asc' },
            }),

            // F) Top products
            prisma.order.groupBy({
                by: ['productId'],
                where: {
                    ...validWhere,
                    productId: { not: null },
                },
                _sum: {
                    salePrice: true,
                    netProfit: true,
                    productCost: true,
                    quantity: true,
                },
                _count: { id: true },
                orderBy: { _sum: { netProfit: 'desc' } },
                take: 10,
            }),

            // G) RTO by city
            prisma.order.groupBy({
                by: ['city'],
                where: {
                    userId,
                    date: { gte: start, lte: end },
                    status: { in: ['RETURNED', 'RTO'] },
                },
                _count: { id: true },
            }),

            // H) Expenses sum
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: start, lte: end },
                },
                _sum: { amount: true },
            }),

            // I) Ledger data (latest 100 orders)
            prisma.order.findMany({
                where: baseWhere,
                include: { product: { select: { name: true } } },
                orderBy: { date: 'desc' },
                take: 100,
            }),

            // J) COD orders for return rate calc
            prisma.order.groupBy({
                by: ['status'],
                where: {
                    ...baseWhere,
                    paymentMethod: 'COD',
                },
                _count: { id: true },
            }),

            // K) Prepaid orders for return rate calc
            prisma.order.groupBy({
                by: ['status'],
                where: {
                    ...baseWhere,
                    paymentMethod: { not: 'COD' },
                },
                _count: { id: true },
            }),
        ]);

        // ── 5. Process: Financial Summary ──
        const totalRevenue = currentAgg._sum.salePrice || 0;
        const totalProfit = currentAgg._sum.netProfit || 0;
        const totalProductCost = currentAgg._sum.productCost || 0;
        const totalShipping = currentAgg._sum.shippingCost || 0;
        const totalPackaging = currentAgg._sum.packagingCost || 0;
        const totalCost = totalProductCost + totalShipping + totalPackaging;
        const totalExpenses = expensesAgg._sum.amount || 0;
        const totalOrders = currentAgg._count.id || 0;
        const avgOrderValue = currentAgg._avg.salePrice || 0;
        const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0;

        // Comparison growth calculations
        const prevRevenue = comparisonAgg._sum.salePrice || 0;
        const prevProfit = comparisonAgg._sum.netProfit || 0;
        const prevOrders = comparisonAgg._count.id || 0;

        const calcGrowth = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        const summary: FinancialSummary = {
            totalRevenue,
            totalProfit,
            totalCost,
            totalExpenses,
            totalOrders,
            avgOrderValue: Number(avgOrderValue.toFixed(0)),
            profitMargin,
            revenueGrowth: calcGrowth(totalRevenue, prevRevenue),
            profitGrowth: calcGrowth(totalProfit, prevProfit),
            orderGrowth: calcGrowth(totalOrders, prevOrders),
        };

        // ── 6. Process: Order Status Breakdown ──
        const totalStatusCount = statusGroups.reduce((sum, g) => sum + g._count.id, 0);
        const ordersByStatus: OrderStatusBreakdown[] = statusGroups.map(g => ({
            status: g.status,
            count: g._count.id,
            percentage: totalStatusCount > 0
                ? Number(((g._count.id / totalStatusCount) * 100).toFixed(1))
                : 0,
        }));

        // ── 7. Process: Payment Method Split ──
        const totalPaymentCount = paymentGroups.reduce((sum, g) => sum + g._count.id, 0);
        const paymentSplit: PaymentMethodSplit[] = paymentGroups.map(g => ({
            method: g.paymentMethod,
            count: g._count.id,
            percentage: totalPaymentCount > 0
                ? Number(((g._count.id / totalPaymentCount) * 100).toFixed(1))
                : 0,
        }));

        // ── 8. Process: Time-series Chart Data ──
        // Group the raw order rows by day in JS (replaces raw SQL grouping)
        const dailyMap: Record<string, { revenue: number; profit: number; orderCount: number }> = {};
        (dailyGroups as Array<{ date: Date; salePrice: number; netProfit: number }>).forEach(row => {
            const dayKey = row.date.toISOString().split('T')[0];
            if (!dailyMap[dayKey]) {
                dailyMap[dayKey] = { revenue: 0, profit: 0, orderCount: 0 };
            }
            dailyMap[dayKey].revenue += row.salePrice || 0;
            dailyMap[dayKey].profit += row.netProfit || 0;
            dailyMap[dayKey].orderCount += 1;
        });
        const salesByDay: RevenueDataPoint[] = Object.keys(dailyMap)
            .sort()
            .map(date => ({
                date,
                revenue: Number(dailyMap[date].revenue.toFixed(0)),
                profit: Number(dailyMap[date].profit.toFixed(0)),
                orderCount: dailyMap[date].orderCount,
            }));

        // ── 9. Process: Top Products ──
        // Fetch product names for the grouped productIds
        const productIds = productGroups
            .map(g => g.productId)
            .filter((id): id is string => id !== null);

        const productNames = productIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true },
            })
            : [];

        const productNameMap = new Map(productNames.map(p => [p.id, p.name]));

        const topProducts: ProductPerformance[] = productGroups.map(g => {
            const revenue = g._sum.salePrice || 0;
            const cost = g._sum.productCost || 0;
            const profit = g._sum.netProfit || 0;
            const unitsSold = g._sum.quantity || g._count.id;
            return {
                productId: g.productId || 'unknown',
                name: productNameMap.get(g.productId || '') || 'Unknown Product',
                unitsSold,
                revenue,
                cost,
                profit,
                margin: revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0,
            };
        });

        // ── 10. Process: RTO Analysis ──
        // Get returned orders by city
        const returnedByCity = await prisma.order.groupBy({
            by: ['city'],
            where: {
                userId,
                date: { gte: start, lte: end },
                status: { in: ['RETURNED', 'RTO'] },
            },
            _count: { id: true },
        });

        // Build city-level RTO map
        const cityTotalMap = new Map(rtoByCity.map(g => [g.city, g._count.id]));
        const highRiskCities: CityRtoData[] = returnedByCity
            .map(g => {
                const total = cityTotalMap.get(g.city) || 1;
                return {
                    city: g.city,
                    totalOrders: total,
                    returnedOrders: g._count.id,
                    returnRate: Number(((g._count.id / total) * 100).toFixed(1)),
                };
            })
            .sort((a, b) => b.returnRate - a.returnRate)
            .slice(0, 10);

        // Overall RTO
        const totalAllOrders = statusGroups.reduce((s, g) => s + g._count.id, 0);
        const totalReturns = statusGroups
            .filter(g => ['RETURNED', 'RTO'].includes(g.status.toUpperCase()))
            .reduce((s, g) => s + g._count.id, 0);
        const overallRate = totalAllOrders > 0
            ? Number(((totalReturns / totalAllOrders) * 100).toFixed(1))
            : 0;

        // COD return rate
        const codTotal = codReturnStats.reduce((s, g) => s + g._count.id, 0);
        const codReturns = codReturnStats
            .filter(g => ['RETURNED', 'RTO'].includes(g.status.toUpperCase()))
            .reduce((s, g) => s + g._count.id, 0);
        const codReturnRate = codTotal > 0
            ? Number(((codReturns / codTotal) * 100).toFixed(1))
            : 0;

        // Prepaid return rate
        const prepaidTotal = prepaidReturnStats.reduce((s, g) => s + g._count.id, 0);
        const prepaidReturns = prepaidReturnStats
            .filter(g => ['RETURNED', 'RTO'].includes(g.status.toUpperCase()))
            .reduce((s, g) => s + g._count.id, 0);
        const prepaidReturnRate = prepaidTotal > 0
            ? Number(((prepaidReturns / prepaidTotal) * 100).toFixed(1))
            : 0;

        const rto: RtoAnalysis = {
            overallRate,
            codReturnRate,
            prepaidReturnRate,
            totalReturns,
            highRiskCities,
        };

        // ── 11. Process: Ledger ──
        const ledger: LedgerEntry[] = ledgerOrders.map(o => ({
            id: o.id.slice(0, 8).toUpperCase(),
            date: o.date.toISOString().split('T')[0],
            customerName: o.customerName,
            city: o.city,
            revenue: o.salePrice,
            cost: o.productCost + o.shippingCost + o.packagingCost,
            profit: o.netProfit,
            status: o.status,
            paymentMethod: o.paymentMethod,
            productName: o.product?.name || null,
        }));

        // ── 13. SMART INSIGHTS ENGINE ──
        const insights: SmartInsight[] = [];

        // Insight 1: Week-over-Week Revenue Growth
        const wowGrowth = summary.revenueGrowth;
        if (summary.totalOrders > 0) {
            if (wowGrowth > 0) {
                insights.push({
                    id: 'wow-growth',
                    type: 'growth',
                    title: 'Revenue Growing',
                    message: `Your revenue is up ${wowGrowth}% compared to the previous period. Keep the momentum going!`,
                    metric: `+${wowGrowth}%`,
                    metricLabel: 'vs Previous Period',
                });
            } else if (wowGrowth < 0) {
                insights.push({
                    id: 'wow-decline',
                    type: 'warning',
                    title: 'Revenue Declining',
                    message: `Revenue has dropped ${Math.abs(wowGrowth)}% vs the previous period. Consider running promotions or restocking bestsellers.`,
                    metric: `${wowGrowth}%`,
                    metricLabel: 'vs Previous Period',
                    severity: Math.abs(wowGrowth) > 25 ? 'high' : 'medium',
                });
            } else {
                insights.push({
                    id: 'wow-flat',
                    type: 'info',
                    title: 'Revenue Stable',
                    message: 'Your revenue is flat compared to the previous period.',
                    metric: '0%',
                    metricLabel: 'No Change',
                });
            }
        }

        // Insight 2: RTO Alert
        if (rto.totalReturns > 0) {
            const rtoSeverity: 'low' | 'medium' | 'high' =
                rto.overallRate > 25 ? 'high' : rto.overallRate > 15 ? 'medium' : 'low';

            if (rto.overallRate > 15) {
                const worstCity = rto.highRiskCities[0];
                insights.push({
                    id: 'rto-alert',
                    type: 'warning',
                    title: 'High Return Rate',
                    message: `Your return rate is ${rto.overallRate}%${worstCity ? `. Worst city: ${worstCity.city} (${worstCity.returnRate}%)` : ''}. Consider verifying COD orders before dispatch.`,
                    metric: `${rto.overallRate}%`,
                    metricLabel: 'Return Rate',
                    severity: rtoSeverity,
                });
            } else {
                insights.push({
                    id: 'rto-healthy',
                    type: 'growth',
                    title: 'Returns Under Control',
                    message: `Your return rate is ${rto.overallRate}% — well within the healthy range.`,
                    metric: `${rto.overallRate}%`,
                    metricLabel: 'Return Rate',
                });
            }
        }

        // Insight 3: Champion Product
        if (topProducts.length > 0) {
            const champion = topProducts[0];
            insights.push({
                id: 'champion-product',
                type: 'info',
                title: 'Top Performer',
                message: `"${champion.name}" is your highest-grossing product with Rs ${champion.revenue.toLocaleString()} revenue and ${champion.margin}% margin.`,
                metric: `Rs ${champion.revenue.toLocaleString()}`,
                metricLabel: 'Revenue',
            });
        }

        // Insight 4: Payment Dependency
        const codSplit = paymentSplit.find(p => p.method === 'COD');
        if (codSplit && codSplit.percentage > 90) {
            insights.push({
                id: 'cod-dependency',
                type: 'warning',
                title: 'Heavy COD Dependency',
                message: `${codSplit.percentage}% of your orders are Cash on Delivery. This increases return risk. Consider offering prepaid discounts.`,
                metric: `${codSplit.percentage}%`,
                metricLabel: 'COD Orders',
                severity: 'medium',
            });
        }

        // Insight 5: Profit Margin Health
        if (summary.totalOrders > 0 && summary.profitMargin < 10 && summary.profitMargin >= 0) {
            insights.push({
                id: 'low-margin',
                type: 'warning',
                title: 'Thin Profit Margins',
                message: `Your profit margin is only ${summary.profitMargin}%. Review shipping costs and pricing strategy.`,
                metric: `${summary.profitMargin}%`,
                metricLabel: 'Net Margin',
                severity: summary.profitMargin < 5 ? 'high' : 'medium',
            });
        } else if (summary.profitMargin >= 25) {
            insights.push({
                id: 'healthy-margin',
                type: 'growth',
                title: 'Strong Margins',
                message: `Excellent! Your ${summary.profitMargin}% profit margin is well above industry average.`,
                metric: `${summary.profitMargin}%`,
                metricLabel: 'Net Margin',
            });
        }

        // ── 14. Assemble Final Response ──
        const reportsData: ReportsData = {
            dateRange: {
                preset,
                start: start.toISOString(),
                end: end.toISOString(),
            },
            summary,
            ordersByStatus,
            paymentSplit,
            salesByDay,
            topProducts,
            rto,
            ledger,
            insights,
            generatedAt: new Date().toISOString(),
        };

        return { success: true, data: reportsData };

    } catch (error) {
        console.error('[REPORTS_ANALYTICS_ERROR]', error);

        // Neon serverless can drop connections on cold start — surface a friendly message
        const message = error instanceof Error ? error.message : '';
        const isConnectionError = message.includes("Can't reach database") || message.includes('ECONNREFUSED') || message.includes('connection');

        return {
            success: false,
            error: isConnectionError
                ? 'Database is waking up (serverless cold start). Please hit Retry in a few seconds.'
                : error instanceof Error
                    ? `Analytics engine failure: ${error.message}`
                    : 'Failed to compile analytical data.',
        };
    }
}