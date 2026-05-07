'use client';
// src/app/tools/shipping-label/components/TrackingUI.tsx

import React, { useState } from 'react';
import {
    Search, Package, Truck, CheckCircle2, MapPin,
    Clock, AlertCircle, Loader2, RefreshCw, ArrowRight,
    Navigation, Box, Home, FlaskConical, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
interface TrackingEvent {
    timestamp: string;
    status: string;
    location: string;
    description: string;
}

interface TrackingResult {
    trackingNumber: string;
    courierName: string;
    currentStatus: string;
    currentLocation: string;
    estimatedDelivery: string;
    events: TrackingEvent[];
    isMock?: boolean;
}

// ─── Status Config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; step: number }> = {
    'Booked': { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: <Box size={16} />, step: 1 },
    'Picked Up': { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: <Package size={16} />, step: 2 },
    'In Transit': { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <Truck size={16} />, step: 3 },
    'Out for Delivery': { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: <Navigation size={16} />, step: 4 },
    'Delivered': { color: 'text-[#20A46B]', bg: 'bg-[#20A46B]/10 border-[#20A46B]/20', icon: <CheckCircle2 size={16} />, step: 5 },
    'Failed': { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <AlertCircle size={16} />, step: 0 },
    'Returned': { color: 'text-red-500', bg: 'bg-red-50 border-red-100', icon: <Home size={16} />, step: 0 },
};

const getStatusConfig = (status: string) => {
    const key = Object.keys(STATUS_CONFIG).find(k =>
        status.toLowerCase().includes(k.toLowerCase())
    );
    return key ? STATUS_CONFIG[key] : { color: 'text-[#304250]', bg: 'bg-gray-100 border-gray-200', icon: <Clock size={16} />, step: 1 };
};

// ─── Progress Steps ───────────────────────────────────────────────────
const STEPS = [
    { label: 'Booked', icon: Box },
    { label: 'Picked Up', icon: Package },
    { label: 'In Transit', icon: Truck },
    { label: 'Out for\nDelivery', icon: Navigation },
    { label: 'Delivered', icon: CheckCircle2 },
];

function ProgressBar({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center w-full">
            {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-1.5 z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-[#20A46B] border-[#20A46B] text-white shadow-[0_4px_12px_rgba(32,164,107,0.3)]'
                                : isActive ? 'bg-white border-[#20A46B] text-[#20A46B] shadow-[0_4px_12px_rgba(32,164,107,0.2)]'
                                    : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                <Icon size={16} strokeWidth={isActive || isCompleted ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold text-center leading-tight whitespace-pre-line ${isActive ? 'text-[#20A46B]' : isCompleted ? 'text-[#304250]' : 'text-[#304250]/30'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className="flex-1 h-1.5 mx-1 rounded-full bg-gray-100 overflow-hidden relative -mt-5">
                                <div
                                    className="absolute left-0 top-0 h-full bg-[#20A46B] transition-all duration-700 rounded-full"
                                    style={{ width: isCompleted ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Event Timeline ───────────────────────────────────────────────────
function EventTimeline({ events }: { events: TrackingEvent[] }) {
    return (
        <div className="space-y-0">
            {events.map((event, idx) => {
                const isLatest = idx === 0;
                const date = new Date(event.timestamp);
                const dateStr = date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

                return (
                    <div key={idx} className="flex gap-4 group">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0 transition-all ${isLatest
                                ? 'border-[#20A46B] bg-[#20A46B] shadow-[0_0_0_4px_rgba(32,164,107,0.15)]'
                                : 'border-gray-300 bg-white'
                                }`} />
                            {idx < events.length - 1 && (
                                <div className="w-0.5 flex-1 bg-gray-100 my-1" />
                            )}
                        </div>

                        {/* Event content */}
                        <div className={`pb-6 flex-1 ${idx === events.length - 1 ? 'pb-0' : ''}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className={`text-sm font-bold leading-snug ${isLatest ? 'text-[#304250]' : 'text-[#304250]/60'}`}>
                                        {event.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <MapPin size={12} className="text-[#304250]/30 flex-shrink-0" />
                                        <span className="text-[11px] text-[#304250]/50 font-bold uppercase tracking-wider">{event.location}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-xs font-black ${isLatest ? 'text-[#20A46B]' : 'text-[#304250]/50'}`}>{timeStr}</p>
                                    <p className="text-[10px] font-bold text-[#304250]/40 uppercase tracking-widest mt-0.5">{dateStr}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function TrackingUI() {
    const [cn, setCn] = useState('');
    const [courier, setCourier] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [error, setError] = useState('');

    const handleTrack = async () => {
        if (!cn.trim()) { setError('Please enter a tracking number'); return; }
        setError('');
        setLoading(true);
        setResult(null);

        try {
            const params = new URLSearchParams({ cn: cn.trim() });
            if (courier) params.append('courier', courier);

            const res = await fetch(`/api/courier/track?${params}`);
            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error || 'Tracking failed. Please try again.');
            } else {
                setResult(data);
            }
        } catch {
            setError('Network error. Could not reach tracking service.');
        } finally {
            setLoading(false);
        }
    };

    const cfg = result ? getStatusConfig(result.currentStatus) : null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">

            {/* ── Header ── */}
            <div className="mb-6 md:mb-8 text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-[#304250] tracking-tight">Track Shipment</h2>
                <p className="text-xs sm:text-sm text-[#304250]/60 font-bold uppercase tracking-widest mt-1.5">
                    Enter your tracking number to get real-time updates
                </p>
            </div>

            {/* ── Search Card ── */}
            <div className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] p-4 sm:p-6 mb-6">
                {/* 👇 FIX: Applied flex-col on mobile so inputs stack neatly without overflowing 👇 */}
                <div className="flex flex-col md:flex-row gap-3">

                    {/* Courier Select */}
                    <div className="relative w-full md:w-48 shrink-0">
                        <select
                            value={courier}
                            onChange={e => setCourier(e.target.value)}
                            className="w-full h-[52px] px-4 rounded-xl border border-[#304250]/15 text-sm font-bold text-[#304250] bg-gray-50 focus:bg-white focus:outline-none focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Couriers</option>
                            <option value="PostEx">PostEx</option>
                            <option value="Leopards">Leopards</option>
                            <option value="TCS">TCS</option>
                            <option value="Trax">Trax</option>
                            <option value="CallCourier">CallCourier</option>
                            <option value="M&P">M&P</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#304250]/40 pointer-events-none" />
                    </div>

                    {/* CN Input & Button container */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={cn}
                                onChange={e => { setCn(e.target.value); setError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                                placeholder="Enter tracking number (e.g. PX1234567890)"
                                className="w-full h-[52px] pl-11 pr-4 rounded-xl border border-[#304250]/15 text-sm font-bold text-[#304250] placeholder:text-[#304250]/40 placeholder:font-medium bg-gray-50 focus:bg-white focus:outline-none focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#304250]/30 w-5 h-5" />
                        </div>

                        {/* Button is now full width on mobile, auto width on SM screens */}
                        <button
                            onClick={handleTrack}
                            disabled={loading || !cn.trim()}
                            className="w-full sm:w-auto h-[52px] px-8 bg-[#20A46B] hover:bg-[#20A46B]/90 active:scale-[0.98] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                            {loading ? 'Tracking...' : 'Track'}
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* ── Loading State ── */}
            {loading && (
                <div className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] p-12 text-center animate-in fade-in">
                    <div className="w-16 h-16 bg-[#20A46B]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#20A46B]/20">
                        <Loader2 size={32} className="animate-spin text-[#20A46B]" />
                    </div>
                    <p className="font-black text-[#304250] text-lg">Fetching tracking info...</p>
                    <p className="text-xs font-bold text-[#304250]/50 uppercase tracking-widest mt-1.5">Contacting courier system</p>
                </div>
            )}

            {/* ── Result View ── */}
            {result && !loading && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Test Mode Badge */}
                    {result.isMock && (
                        <div className="flex items-center gap-2 bg-[#EEBE1C]/10 border border-[#EEBE1C]/30 text-[#c2410c] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
                            <FlaskConical size={16} />
                            Test Mode — Showing sample data for testing.
                        </div>
                    )}

                    {/* Status Header Card */}
                    <div className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] p-5 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                            <div>
                                <p className="text-[11px] font-black text-[#304250]/40 uppercase tracking-widest mb-1.5 bg-gray-100 w-fit px-2 py-0.5 rounded">
                                    {result.courierName}
                                </p>
                                <p className="text-2xl sm:text-3xl font-black text-[#304250] tracking-tight font-mono">
                                    {result.trackingNumber}
                                </p>
                            </div>
                            <div className={`flex items-center w-fit gap-2 px-4 py-2 rounded-xl border shadow-sm text-sm font-black uppercase tracking-wider ${cfg?.bg} ${cfg?.color}`}>
                                {cfg?.icon}
                                {result.currentStatus}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8 px-2 sm:px-6">
                            <ProgressBar currentStep={cfg?.step || 1} />
                        </div>

                        {/* Meta Info Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-[#304250]/5">
                                <p className="text-[10px] font-black text-[#304250]/40 uppercase tracking-[0.15em] mb-2">Current Location</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#20A46B]/10 flex items-center justify-center shrink-0">
                                        <MapPin size={16} className="text-[#20A46B]" />
                                    </div>
                                    <p className="text-sm font-bold text-[#304250]">{result.currentLocation || '—'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-[#304250]/5">
                                <p className="text-[10px] font-black text-[#304250]/40 uppercase tracking-[0.15em] mb-2">Est. Delivery</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#EEBE1C]/20 flex items-center justify-center shrink-0">
                                        <Clock size={16} className="text-[#c2410c]" />
                                    </div>
                                    <p className="text-sm font-bold text-[#304250]">{result.estimatedDelivery || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    {result.events.length > 0 && (
                        <div className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] p-5 sm:p-8">
                            <div className="flex items-center justify-between mb-8 border-b border-[#304250]/5 pb-4">
                                <h3 className="font-black text-[#304250] text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} className="text-[#20A46B]" />
                                    Shipment Timeline
                                </h3>
                                <button
                                    onClick={handleTrack}
                                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-[#20A46B] hover:text-white hover:bg-[#20A46B] px-3 py-1.5 rounded-lg border border-[#20A46B]/20 transition-all active:scale-95"
                                >
                                    <RefreshCw size={12} />
                                    Refresh
                                </button>
                            </div>
                            <EventTimeline events={result.events} />
                        </div>
                    )}

                    {/* Track Another */}
                    <button
                        onClick={() => { setResult(null); setCn(''); setCourier(''); }}
                        className="w-full flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-black text-[#304250]/50 hover:text-[#304250] bg-white border border-[#304250]/10 hover:bg-gray-50 rounded-2xl transition-all shadow-sm active:scale-[0.98]"
                    >
                        Track another shipment <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* ── Empty State ── */}
            {!result && !loading && !error && (
                <div className="text-center py-16 bg-white rounded-[24px] border border-[#304250]/5 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#304250]/5">
                        <Truck size={36} className="text-[#304250]/20" />
                    </div>
                    <p className="font-black text-[#304250] text-lg tracking-tight">Ready to Track</p>
                    <p className="text-xs font-bold text-[#304250]/50 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
                        Enter your tracking number above. Supports PostEx, Leopards, TCS, Trax, M&P
                    </p>
                </div>
            )}
        </div>
    );
}