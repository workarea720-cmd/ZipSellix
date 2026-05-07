import { useMemo, useState } from 'react';
import { useBusinessStore } from '@/store/business-store';

export interface DashboardProps {
    data: any;
    products?: any[];
    setActiveTab: (tab: string) => void;
    isMobile?: boolean;
}

export type ChartRange = '7days' | '15days' | '30days' | 'all';

const RANGE_DAYS: Record<ChartRange, number | null> = {
    '7days': 7,
    '15days': 15,
    '30days': 30,
    'all': null,
};

export interface ChartDataPoint {
    date: string;
    day: string;
    total: number;
    delivered: number;
    pending: number;
    returned: number;
}

export function useDashboardLogic({ data, products = [], setActiveTab }: DashboardProps) {
    const summary = data?.summary || {};
    const orders = data?.orders || [];

    const [chartRange, setChartRange] = useState<ChartRange>('7days');

    const pendingCOD = useMemo(() => {
        return orders
            .filter((o: any) => o.status === 'PENDING')
            .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
    }, [orders]);

    // Compute chart data from ALL orders with status breakdown
    const computedChartData: ChartDataPoint[] = useMemo(() => {
        const days = RANGE_DAYS[chartRange];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build maps: date -> { total, delivered, pending, returned }
        const byDate: Record<string, { total: number; delivered: number; pending: number; returned: number }> = {};

        orders.forEach((o: any) => {
            const dateStr = o.date;
            if (!dateStr) return;
            const amount = Number(o.totalAmount) || 0;
            if (!byDate[dateStr]) byDate[dateStr] = { total: 0, delivered: 0, pending: 0, returned: 0 };
            byDate[dateStr].total += amount;

            const status = (o.status || '').toUpperCase();
            if (status === 'DELIVERED') {
                byDate[dateStr].delivered += amount;
            } else if (status === 'PENDING') {
                byDate[dateStr].pending += amount;
            } else if (status === 'RTO' || status === 'RETURNED') {
                byDate[dateStr].returned += amount;
            } else {
                // Unknown status — count in total only
                byDate[dateStr].total += 0; // already counted above
            }
        });

        if (days === null) {
            // "All Time" — show all dates that have orders, sorted
            const allDates = Object.keys(byDate).sort();
            if (allDates.length === 0) return [];
            return allDates.map(d => {
                const dateObj = new Date(d + 'T00:00:00');
                const info = byDate[d] || { total: 0, delivered: 0, pending: 0, returned: 0 };
                return {
                    date: d,
                    day: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    total: info.total,
                    delivered: info.delivered,
                    pending: info.pending,
                    returned: info.returned,
                };
            });
        }

        // For fixed ranges, generate each day in the range
        const result: ChartDataPoint[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dayLabel =
                days <= 7
                    ? d.toLocaleDateString('en-US', { weekday: 'short' })
                    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const info = byDate[dateStr] || { total: 0, delivered: 0, pending: 0, returned: 0 };
            result.push({
                date: dateStr,
                day: dayLabel,
                total: info.total,
                delivered: info.delivered,
                pending: info.pending,
                returned: info.returned,
            });
        }
        return result;
    }, [orders, chartRange]);

    const topProducts = useMemo(() => {
        const stats: any = {};
        orders.forEach((o: any) => {
            if (Array.isArray(o.items)) {
                o.items.forEach((item: any) => {
                    const pName = item.productName || "Unknown Item";
                    if (!stats[pName]) stats[pName] = { name: pName, sold: 0, revenue: 0 };
                    stats[pName].sold += Number(item.quantity) || 0;
                    stats[pName].revenue += (Number(item.salePrice) * Number(item.quantity)) || 0;
                });
            }
        });
        return Object.values(stats).sort((a: any, b: any) => b.sold - a.sold).slice(0, 3);
    }, [orders]);

    const lowStockItems = useMemo(() => {
        if (!products) return [];
        return products.filter((p: any) => (p.currentStock || 0) <= 3);
    }, [products]);

    const store = useBusinessStore();
    const grossRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
    const totalPackagingCost = orders.length * store.getVariableCostPerOrder();
    const netProfit = grossRevenue - store.getMonthlyFixedCosts() - totalPackagingCost;

    return {
        summary,
        chartData: computedChartData,
        chartRange,
        setChartRange,
        pendingCOD,
        topProducts,
        lowStockItems,
        netProfit,
        setActiveTab
    };
}

export type DashboardLogicReturn = ReturnType<typeof useDashboardLogic>;
