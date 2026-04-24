/**
 * ReportPDF.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * @react-pdf/renderer document for ZipSellix Analytics Reports.
 *
 * IMPORTANT: This file MUST only be imported dynamically on the client side.
 * Do NOT import this in any Server Component or at the top level of a page.
 * Use:  const { pdf } = await import('@react-pdf/renderer');
 * const { ReportPDF } = await import('./ReportPDF');
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';

// Use an extended type locally to avoid importing ReportsData and modifying it
type ExtendedReportsData = any;

// ─── Brand Tokens ─────────────────────────────────────────────
const BRAND_GREEN = '#22a96e';
const BRAND_DARK = '#1a1a2e';
const SLATE_100 = '#f1f5f9';
const SLATE_400 = '#94a3b8';
const SLATE_600 = '#475569';
const SLATE_900 = '#0f172a';
const RED = '#ef4444';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';

// 👇 YEH NAYA HELPER FUNCTION HAI JO LOGO KA THEEK PATH NIKALEGA
const getDefaultLogoUrl = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/wordmark-logo.png`;
    }
    return '/wordmark-logo.png';
};

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: SLATE_900,
        backgroundColor: '#ffffff',
        paddingHorizontal: 36,
        paddingVertical: 32,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: SLATE_100,
    },
    logo: {
        height: 28,
        maxWidth: 120,
        objectFit: 'contain',
    },
    headerRight: { alignItems: 'flex-end' },
    reportTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: SLATE_900, marginBottom: 2 },
    reportMeta: { fontSize: 8, color: SLATE_400 },

    // ── KPI Row ──
    kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    kpiCard: {
        flex: 1,
        backgroundColor: SLATE_100,
        borderRadius: 6,
        padding: 10,
    },
    kpiLabel: { fontSize: 7, color: SLATE_400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    kpiValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: SLATE_900, marginBottom: 3 },
    kpiBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 20,
    },
    kpiBadgeText: { fontSize: 7, color: '#065f46', fontFamily: 'Helvetica-Bold' },
    kpiBadgeRed: { backgroundColor: '#fee2e2' },
    kpiBadgeRedText: { color: '#991b1b' },
    kpiBadgeAmber: { backgroundColor: '#fef3c7' },
    kpiBadgeAmberText: { color: '#78350f' },

    // ── Section Header ──
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: SLATE_900 },
    sectionSubtitle: { fontSize: 8, color: SLATE_400, marginLeft: 6 },

    // ── Card ──
    card: {
        borderWidth: 0.5,
        borderColor: SLATE_100,
        borderRadius: 6,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardPad: { padding: 12 },

    // ── Waterfall ──
    wfRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    wfLabel: { width: 110, fontSize: 8, color: SLATE_600 },
    wfLabelBold: { fontFamily: 'Helvetica-Bold', color: SLATE_900 },
    wfBg: { flex: 1, height: 16, backgroundColor: SLATE_100, borderRadius: 4, overflow: 'hidden' },
    wfFill: { height: 16, borderRadius: 4, justifyContent: 'center', paddingLeft: 6 },
    wfFillText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

    // ── Table ──
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: SLATE_100,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e2e8f0',
    },
    tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: SLATE_400, textTransform: 'uppercase', letterSpacing: 0.4 },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f8fafc',
    },
    tableRowAlt: { backgroundColor: '#fafafa' },
    tableCell: { fontSize: 8, color: SLATE_600 },
    tableCellBold: { fontFamily: 'Helvetica-Bold', color: SLATE_900 },
    tableCellGreen: { color: BRAND_GREEN, fontFamily: 'Helvetica-Bold' },
    tableCellRed: { color: RED, fontFamily: 'Helvetica-Bold' },
    tableCellAmber: { color: AMBER, fontFamily: 'Helvetica-Bold' },

    // ── Status Pill ──
    pill: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
    pillGreen: { backgroundColor: '#d1fae5' },
    pillGreenText: { fontSize: 7, color: '#065f46', fontFamily: 'Helvetica-Bold' },
    pillRed: { backgroundColor: '#fee2e2' },
    pillRedText: { fontSize: 7, color: '#991b1b', fontFamily: 'Helvetica-Bold' },
    pillAmber: { backgroundColor: '#fef3c7' },
    pillAmberText: { fontSize: 7, color: '#78350f', fontFamily: 'Helvetica-Bold' },
    pillBlue: { backgroundColor: '#dbeafe' },
    pillBlueText: { fontSize: 7, color: '#1e40af', fontFamily: 'Helvetica-Bold' },

    // ── Insight Box ──
    insightBox: {
        borderLeftWidth: 3,
        borderLeftColor: BRAND_GREEN,
        backgroundColor: '#f0fdf4',
        padding: 8,
        borderRadius: 4,
        marginBottom: 6,
    },
    insightTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: BRAND_GREEN, marginBottom: 2 },
    insightText: { fontSize: 8, color: SLATE_600, lineHeight: 1.4 },

    // ── Footer ──
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 0.5,
        borderTopColor: SLATE_100,
        paddingTop: 8,
    },
    footerText: { fontSize: 7, color: SLATE_400 },

    // ── Two-col layout ──
    row2: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    col2: { flex: 1 },

    // ── Bar row for fulfillment ──
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    barLabel: { width: 70, fontSize: 8, color: SLATE_600 },
    barBg: { flex: 1, height: 5, backgroundColor: SLATE_100, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: 5, borderRadius: 3 },
    barValue: { width: 40, textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold', color: SLATE_900 },

    // ── City row ──
    cityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    cityName: { width: 70, fontSize: 8, color: SLATE_600 },
    cityBg: { flex: 1, height: 5, backgroundColor: SLATE_100, borderRadius: 3, overflow: 'hidden' },
    cityFill: { height: 5, borderRadius: 3 },
    cityPct: { width: 36, textAlign: 'right', fontSize: 8, fontFamily: 'Helvetica-Bold' },

    spacer4: { height: 4 },
    spacer8: { height: 8 },

    infoBox: {
        backgroundColor: '#eff6ff',
        borderRadius: 4,
        padding: 8,
        marginTop: 6,
    },
    infoText: { fontSize: 8, color: BLUE, lineHeight: 1.4 },
});

// ─── Helper Components ────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
    const up = status.toUpperCase();
    if (up === 'DELIVERED' || up === 'COMPLETED')
        return <View style={[s.pill, s.pillGreen]}><Text style={s.pillGreenText}>{status}</Text></View>;
    if (up === 'RETURNED' || up === 'RTO')
        return <View style={[s.pill, s.pillRed]}><Text style={s.pillRedText}>{status}</Text></View>;
    if (up === 'PENDING')
        return <View style={[s.pill, s.pillAmber]}><Text style={s.pillAmberText}>{status}</Text></View>;
    return <View style={[s.pill, s.pillBlue]}><Text style={s.pillBlueText}>{status}</Text></View>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{title}</Text>
            {subtitle && <Text style={s.sectionSubtitle}>— {subtitle}</Text>}
        </View>
    );
}

// ─── Page 1: Financial Overview ───────────────────────────────
function Page1({ data, isPro, isService }: { data: ExtendedReportsData, isPro: boolean, isService: boolean }) {
    const s2 = data.summary;
    const totalCosts = s2.totalCost + s2.totalExpenses;
    const delivered = data.ordersByStatus?.find((o: any) => o.status.toUpperCase() === 'DELIVERED');
    const pending = data.ordersByStatus?.find((o: any) => o.status.toUpperCase() === 'PENDING');
    const returned = data.ordersByStatus?.find((o: any) => ['RETURNED', 'RTO'].includes(o.status.toUpperCase()));

    const maxWidth = s2.totalRevenue > 0 ? s2.totalRevenue : 1;

    return (
        <Page size="A4" style={s.page}>
            {/* HEADER */}
            <View style={s.header} fixed>
                {isPro && data.businessProfile?.logo ? (
                    <Image src={data.businessProfile.logo} style={s.logo} />
                ) : (
                    <Image src={getDefaultLogoUrl()} style={s.logo} />
                )}

                <View style={s.headerRight}>
                    <Text style={s.reportTitle}>{isService ? 'Service Analytics & Performance Report' : 'Product Analytics & Performance Report'}</Text>
                    <Text style={s.reportMeta}>
                        Period: {data.dateRange?.preset?.replace(/-/g, ' ') || 'All Time'} · Generated{' '}
                        {new Date(data.generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            {/* ── KPI ROW */}
            <View style={s.kpiRow}>
                {[
                    { label: 'Total Revenue', value: `Rs ${s2.totalRevenue.toLocaleString()}`, badge: `${s2.totalOrders} orders`, variant: 'green' },
                    { label: 'Net Profit', value: `Rs ${s2.totalProfit.toLocaleString()}`, badge: `${s2.profitMargin}% margin`, variant: s2.totalProfit >= 0 ? 'green' : 'red' },
                    { label: 'Total Orders', value: String(s2.totalOrders), badge: `${delivered?.count ?? 0} delivered`, variant: 'green' },
                ].map((kpi, i) => {
                    const badgeStyle = kpi.variant === 'red' ? [s.kpiBadge, s.kpiBadgeRed] : kpi.variant === 'amber' ? [s.kpiBadge, s.kpiBadgeAmber] : s.kpiBadge;
                    const badgeTextStyle = kpi.variant === 'red' ? [s.kpiBadgeText, s.kpiBadgeRedText] : kpi.variant === 'amber' ? [s.kpiBadgeText, s.kpiBadgeAmberText] : s.kpiBadgeText;
                    return (
                        <View key={i} style={s.kpiCard}>
                            <Text style={s.kpiLabel}>{kpi.label}</Text>
                            <Text style={[s.kpiValue, kpi.variant === 'red' ? { color: RED } : {}]}>{kpi.value}</Text>
                            <View style={badgeStyle}><Text style={badgeTextStyle}>{kpi.badge}</Text></View>
                        </View>
                    );
                })}
            </View>

            {/* ── INSIGHTS */}
            <View style={s.spacer8} />
            <SectionTitle title="Key Insights" subtitle="Highlights for this period" />
            {data.insights?.slice(0, 3).map((insight: any, i: number) => (
                <View key={i} style={[s.insightBox, {
                    borderLeftColor: insight.type === 'growth' ? BRAND_GREEN : insight.type === 'warning' ? AMBER : BLUE,
                    backgroundColor: insight.type === 'growth' ? '#f0fdf4' : insight.type === 'warning' ? '#fffbeb' : '#eff6ff',
                }]}>
                    <Text style={[s.insightTitle, { color: insight.type === 'growth' ? BRAND_GREEN : insight.type === 'warning' ? AMBER : BLUE }]}>
                        {insight.title}{insight.metric ? `  ·  ${insight.metric}` : ''}
                    </Text>
                    <Text style={s.insightText}>{insight.message}</Text>
                </View>
            ))}
            {(!data.insights || data.insights.length === 0) && (
                <View style={s.infoBox}>
                    <Text style={s.infoText}>No key insights generated for this period.</Text>
                </View>
            )}
            <View style={s.spacer8} />

            {/* ── PROFIT WATERFALL */}
            <View style={s.card}>
                <View style={s.cardPad}>
                    <SectionTitle title="Profit Waterfall" subtitle="How revenue becomes profit" />
                    {[
                        { label: 'Gross Revenue', amount: s2.totalRevenue, pct: 100, color: BLUE, bold: true },
                        { label: isService ? '— Service Cost' : '— Product Cost', amount: -s2.totalCost, pct: (s2.totalCost / maxWidth) * 100, color: '#fca5a5', bold: false },
                        { label: '— Expenses', amount: -s2.totalExpenses, pct: (s2.totalExpenses / maxWidth) * 100, color: '#fca5a5', bold: false },
                        { label: '= Net Profit', amount: s2.totalProfit, pct: Math.max(0, (s2.totalProfit / maxWidth)) * 100, color: BRAND_GREEN, bold: true },
                    ].map((row, i) => (
                        <View key={i} style={s.wfRow}>
                            <Text style={[s.wfLabel, row.bold ? s.wfLabelBold : {}]}>{row.label}</Text>
                            <View style={s.wfBg}>
                                <View style={[s.wfFill, { width: `${Math.max(4, Math.min(100, row.pct))}%`, backgroundColor: row.color }]}>
                                    <Text style={[s.wfFillText, !row.bold ? { color: '#991b1b' } : {}]}>
                                        {row.amount < 0 ? `–Rs ${Math.abs(row.amount).toLocaleString()}` : `Rs ${row.amount.toLocaleString()}`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ── TWO-COL: FULFILLMENT + PAYMENT SPLIT */}
            <View style={s.row2}>
                <View style={[s.card, s.col2, { marginBottom: 0 }]}>
                    <View style={s.cardPad}>
                        <SectionTitle title="Fulfillment Rate" />
                        {[
                            { label: 'Delivered', count: delivered?.count ?? 0, pct: delivered?.percentage ?? 0, color: BRAND_GREEN },
                            { label: 'Pending', count: pending?.count ?? 0, pct: pending?.percentage ?? 0, color: AMBER },
                            { label: 'Returned', count: returned?.count ?? 0, pct: returned?.percentage ?? 0, color: RED },
                        ].map((row, i) => (
                            <View key={i} style={s.barRow}>
                                <Text style={s.barLabel}>{row.label}</Text>
                                <View style={s.barBg}>
                                    <View style={[s.barFill, { width: `${Math.max(0, row.pct)}%`, backgroundColor: row.color }]} />
                                </View>
                                <Text style={s.barValue}>{row.count} ({row.pct}%)</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[s.card, s.col2, { marginBottom: 0 }]}>
                    <View style={s.cardPad}>
                        <SectionTitle title="Cost Breakdown" />
                        {[
                            { label: isService ? 'Service costs (COGS)' : 'Product costs (COGS)', value: `Rs ${s2.totalCost.toLocaleString()}`, color: RED },
                            { label: 'Operating expenses', value: `Rs ${s2.totalExpenses.toLocaleString()}`, color: RED },
                            { label: 'Total costs', value: `Rs ${totalCosts.toLocaleString()}`, color: RED },
                        ].map((row, i) => (
                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={s.tableCell}>{row.label}</Text>
                                <Text style={[s.tableCell, { color: row.color, fontFamily: 'Helvetica-Bold' }]}>{row.value}</Text>
                            </View>
                        ))}
                        <View style={s.spacer4} />
                        <Text style={{ fontSize: 7, color: SLATE_400 }}>
                            {s2.totalRevenue > 0 ? Math.round((totalCosts / s2.totalRevenue) * 100) : 0}% of gross revenue
                        </Text>
                    </View>
                </View>
            </View>

            {/* FOOTER */}
            <View style={s.footer} fixed>
                <Text style={s.footerText}>ZipSellix Analytics — Confidential</Text>
                <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
        </Page>
    );
}

// ─── Page 2: Product/Service Matrix + Ledger ─────────────────
function Page2({ data, isPro, isService }: { data: ExtendedReportsData, isPro: boolean, isService: boolean }) {
    const products = data.topProducts || [];
    const ledger = data.ledger || [];

    return (
        <Page size="A4" style={s.page}>
            {/* HEADER */}
            <View style={s.header} fixed>
                {isPro && data.businessProfile?.logo ? (
                    <Image src={data.businessProfile.logo} style={s.logo} />
                ) : (
                    <Image src={getDefaultLogoUrl()} style={s.logo} />
                )}

                <View style={s.headerRight}>
                    <Text style={s.reportTitle}>{isService ? 'Service Performance & Ledger' : 'Product Performance & Ledger'}</Text>
                    <Text style={s.reportMeta}>
                        {new Date(data.generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            {/* ── PRODUCT / SERVICE MATRIX */}
            <SectionTitle title={isService ? 'Top Performing Services' : 'Top Performing Products'} subtitle="Revenue, cost, and margin breakdown" />
            <View style={s.card}>
                <View style={s.tableHeader}>
                    {[isService ? 'Service' : 'Product', 'Units Sold', 'Revenue', 'Cost', 'Net Profit', 'Margin', 'Verdict'].map((h, i) => (
                        <Text key={i} style={[s.tableHeaderCell, { flex: i === 0 ? 2 : 1 }]}>{h}</Text>
                    ))}
                </View>
                {products.length === 0 && (
                    <View style={[s.cardPad, { alignItems: 'center' }]}>
                        <Text style={{ fontSize: 8, color: SLATE_400 }}>{isService ? 'No service data available.' : 'No product data available.'}</Text>
                    </View>
                )}
                {products.map((p: any, i: number) => (
                    <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                        <Text style={[s.tableCell, s.tableCellBold, { flex: 2 }]}>{p.name}</Text>
                        <Text style={[s.tableCell, { flex: 1 }]}>{p.unitsSold}</Text>
                        <Text style={[s.tableCell, { flex: 1 }]}>Rs {p.revenue.toLocaleString()}</Text>
                        <Text style={[s.tableCell, { flex: 1, color: SLATE_400 }]}>Rs {p.cost.toLocaleString()}</Text>
                        <Text style={[s.tableCell, { flex: 1 }, p.profit >= 0 ? s.tableCellGreen : s.tableCellRed]}>
                            {p.profit >= 0 ? '+' : '–'}Rs {Math.abs(p.profit).toLocaleString()}
                        </Text>
                        <Text style={[s.tableCell, { flex: 1 }, p.margin >= 0 ? s.tableCellGreen : s.tableCellRed]}>
                            {p.margin}%
                        </Text>
                        <View style={{ flex: 1 }}>
                            <StatusPill status={p.profit >= 0 ? 'Keep selling' : 'Fix price'} />
                        </View>
                    </View>
                ))}
            </View>

            <View style={s.spacer8} />

            {/* ── LEDGER */}
            <SectionTitle title="Order Ledger" subtitle={`Last ${Math.min(ledger.length, 20)} entries`} />
            <View style={s.card}>
                <View style={s.tableHeader}>
                    {['ID', 'Date', 'Customer', isService ? 'Service' : 'Product', 'Revenue', 'Net Profit', 'Status', 'Payment'].map((h, i) => (
                        <Text key={i} style={[s.tableHeaderCell, { flex: i === 2 ? 1.5 : 1 }]}>{h}</Text>
                    ))}
                </View>
                {ledger.length === 0 && (
                    <View style={[s.cardPad, { alignItems: 'center' }]}>
                        <Text style={{ fontSize: 8, color: SLATE_400 }}>No ledger entries for this period.</Text>
                    </View>
                )}
                {ledger.slice(0, 20).map((row: any, i: number) => (
                    <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                        <Text style={[s.tableCell, s.tableCellBold, { flex: 1 }]}>{row.id}</Text>
                        <Text style={[s.tableCell, { flex: 1, color: SLATE_400 }]}>
                            {new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Text>
                        <Text style={[s.tableCell, { flex: 1.5 }]}>{row.customerName}</Text>
                        <Text style={[s.tableCell, { flex: 1, color: SLATE_400 }]}>{row.productName ?? '—'}</Text>
                        <Text style={[s.tableCell, { flex: 1 }]}>Rs {row.revenue.toLocaleString()}</Text>
                        <Text style={[s.tableCell, { flex: 1 }, row.profit >= 0 ? s.tableCellGreen : s.tableCellRed]}>
                            {row.profit >= 0 ? '+' : '–'}Rs {Math.abs(row.profit).toLocaleString()}
                        </Text>
                        <View style={{ flex: 1 }}>
                            <StatusPill status={row.status} />
                        </View>
                        <Text style={[s.tableCell, { flex: 1, color: SLATE_400 }]}>{row.paymentMethod}</Text>
                    </View>
                ))}
            </View>

            {/* FOOTER */}
            <View style={s.footer} fixed>
                <Text style={s.footerText}>ZipSellix Analytics — Confidential</Text>
                <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
        </Page>
    );
}

// ─── Page 3: RTO Analysis ─────────────────────────────────────
function Page3({ data, isPro, isService }: { data: ExtendedReportsData, isPro: boolean, isService: boolean }) {
    const rto = data.rto;

    return (
        <Page size="A4" style={s.page}>
            {/* HEADER */}
            <View style={s.header} fixed>
                {isPro && data.businessProfile?.logo ? (
                    <Image src={data.businessProfile.logo} style={s.logo} />
                ) : (
                    <Image src={getDefaultLogoUrl()} style={s.logo} />
                )}

                <View style={s.headerRight}>
                    <Text style={s.reportTitle}>RTO & Return Analysis</Text>
                    <Text style={s.reportMeta}>
                        {new Date(data.generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            {/* KPI ROW */}
            <View style={s.kpiRow}>
                {[
                    { label: 'Overall RTO Rate', value: `${rto.overallRate}%`, badge: `${rto.totalReturns} returns`, ok: rto.overallRate < 20 },
                    { label: 'COD Return Rate', value: `${rto.codReturnRate}%`, badge: rto.codReturnRate === 0 ? 'No COD returns' : 'COD orders', ok: rto.codReturnRate === 0 },
                    { label: 'Prepaid Return Rate', value: `${rto.prepaidReturnRate}%`, badge: 'Online orders', ok: rto.prepaidReturnRate < 20 },
                    { label: 'Total Returns', value: String(rto.totalReturns), badge: 'Returned orders', ok: rto.totalReturns === 0 },
                ].map((kpi, i) => (
                    <View key={i} style={s.kpiCard}>
                        <Text style={s.kpiLabel}>{kpi.label}</Text>
                        <Text style={[s.kpiValue, !kpi.ok ? { color: RED } : {}]}>{kpi.value}</Text>
                        <View style={[s.kpiBadge, !kpi.ok ? s.kpiBadgeRed : {}]}>
                            <Text style={[s.kpiBadgeText, !kpi.ok ? s.kpiBadgeRedText : {}]}>{kpi.badge}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* CITY TABLE */}
            <SectionTitle title="Return Rate by City" subtitle="Sorted by risk level" />
            <View style={s.card}>
                <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                    {(!rto.highRiskCities || rto.highRiskCities.length === 0) ? (
                        <Text style={{ fontSize: 8, color: SLATE_400, textAlign: 'center' }}>No city return data available.</Text>
                    ) : (
                        rto.highRiskCities.map((city: any, i: number) => {
                            const color = city.returnRate >= 75 ? RED : city.returnRate >= 30 ? AMBER : BRAND_GREEN;
                            return (
                                <View key={i} style={[s.cityRow, { marginBottom: 8 }]}>
                                    <Text style={s.cityName}>{city.city}</Text>
                                    <View style={s.cityBg}>
                                        <View style={[s.cityFill, { width: `${Math.max(0, Math.min(100, city.returnRate))}%`, backgroundColor: color }]} />
                                    </View>
                                    <Text style={[s.cityPct, { color }]}>{city.returnRate}%</Text>
                                    <Text style={[s.tableCell, { width: 60, textAlign: 'right', color: SLATE_400 }]}>
                                        {city.returnedOrders}/{city.totalOrders} orders
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </View>

            {/* RECOMMENDATIONS */}
            <View style={s.spacer8} />
            <SectionTitle title="Recommendations" />
            <View style={[s.insightBox, { backgroundColor: '#fffbeb', borderLeftColor: AMBER }]}>
                <Text style={[s.insightTitle, { color: AMBER }]}>Reduce COD Return Risk</Text>
                <Text style={s.insightText}>
                    • For cities with 100% return rate, call and confirm before dispatching{'\n'}
                    • Incentivize online prepaid with a small discount (Rs 20–50){'\n'}
                    • Place high-RTO cities on a verified-only COD watchlist
                </Text>
            </View>

            {/* FOOTER */}
            <View style={s.footer} fixed>
                <Text style={s.footerText}>ZipSellix Analytics — Confidential</Text>
                <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
        </Page>
    );
}

// ─── Root Document ────────────────────────────────────────────
export function ReportPDF({
    data,
    isPro = false,
    businessType = 'STOCK',
}: {
    data: ExtendedReportsData;
    isPro?: boolean;
    /** 'SERVICE' for service/digital businesses, defaults to 'STOCK' */
    businessType?: string;
}) {
    const isService = businessType?.toUpperCase() === 'SERVICE';
    return (
        <Document
            title={`ZipSellix Analytics Report — ${data.dateRange?.preset || 'Report'}`}
            author="ZipSellix"
            subject="Business Analytics Report"
            keywords="analytics, revenue, profit, orders, rto"
        >
            <Page1 data={data} isPro={isPro} isService={isService} />
            <Page2 data={data} isPro={isPro} isService={isService} />
            <Page3 data={data} isPro={isPro} isService={isService} />
        </Document>
    );
}