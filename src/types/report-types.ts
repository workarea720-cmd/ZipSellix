// ============================================================
// ZipSellix Reports & Analytics — Shared Type Definitions
// ============================================================
// These types are shared between the server action (analytics.ts)
// and the client UI components (ReportsView.tsx).
// ============================================================

/** Accepted date range presets for the analytics query */
export type DateRangePreset =
    | 'today'
    | 'yesterday'
    | 'last-7-days'
    | 'this-month'
    | 'last-month'
    | 'last-3-months'
    | 'all-time';

/** A single data point for time-series chart rendering */
export interface RevenueDataPoint {
    date: string;       // ISO date string (YYYY-MM-DD)
    revenue: number;
    profit: number;
    orderCount: number;
}

/** Product performance row for the Product Profitability tab */
export interface ProductPerformance {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;     // percentage (0-100)
}

/** City-level RTO data for geographic analysis */
export interface CityRtoData {
    city: string;
    totalOrders: number;
    returnedOrders: number;
    returnRate: number; // percentage (0-100)
}

/** Order status breakdown */
export interface OrderStatusBreakdown {
    status: string;
    count: number;
    percentage: number;
}

/** Payment method split */
export interface PaymentMethodSplit {
    method: string;
    count: number;
    percentage: number;
}

/** Core financial summary metrics */
export interface FinancialSummary {
    totalRevenue: number;
    totalProfit: number;
    totalCost: number;          // productCost + shippingCost + packagingCost
    totalExpenses: number;      // from Expense model (OPEX)
    totalOrders: number;
    avgOrderValue: number;
    profitMargin: number;       // percentage (0-100)
    // Growth vs comparison period
    revenueGrowth: number;      // percentage change
    profitGrowth: number;       // percentage change
    orderGrowth: number;        // percentage change
}

/** RTO analysis summary */
export interface RtoAnalysis {
    overallRate: number;        // percentage
    codReturnRate: number;      // percentage
    prepaidReturnRate: number;  // percentage
    totalReturns: number;
    highRiskCities: CityRtoData[];
}

/** A single smart insight card — computed server-side */
export interface SmartInsight {
    id: string;
    type: 'growth' | 'warning' | 'info';
    title: string;
    message: string;
    metric?: string;        // e.g. "+12%" or "Rs 45,000"
    metricLabel?: string;   // e.g. "WoW Growth" or "Top Product"
    severity?: 'low' | 'medium' | 'high';  // for warnings
}

/** Ledger entry for the Detailed Ledger tab */
export interface LedgerEntry {
    id: string;
    date: string;
    customerName: string;
    city: string;
    revenue: number;
    cost: number;
    profit: number;
    status: string;
    paymentMethod: string;
    productName: string | null;
}

/** The complete analytics response payload */
export interface ReportsData {
    /** Date range that was queried */
    dateRange: {
        preset: DateRangePreset;
        start: string;  // ISO date string
        end: string;    // ISO date string
    };
    /** Core financial KPIs */
    summary: FinancialSummary;
    /** Status breakdown for order funnel */
    ordersByStatus: OrderStatusBreakdown[];
    /** COD vs Prepaid split */
    paymentSplit: PaymentMethodSplit[];
    /** Time-series data for charts */
    salesByDay: RevenueDataPoint[];
    /** Top product performance (sorted by profit desc) */
    topProducts: ProductPerformance[];
    /** RTO risk analysis */
    rto: RtoAnalysis;
    /** Detailed order ledger (last 100 orders) */
    ledger: LedgerEntry[];
    /** Smart Insights — auto-generated business intelligence cards */
    insights: SmartInsight[];
    /** Server timestamp for cache validation */
    generatedAt: string;
}

/** Wrapper response for the server action */
export interface ReportsActionResponse {
    success: boolean;
    data?: ReportsData;
    error?: string;
}
