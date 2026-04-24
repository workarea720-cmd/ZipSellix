"use client";
import React, { useState, useEffect } from 'react';
import {
    MessageSquare, ShieldCheck, ShieldAlert, AlertTriangle,
    Copy, Crown, ExternalLink, Wand2, Smartphone, MapPin, Loader2
} from 'lucide-react';

export default function WhatsAppManager() {
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rawInput, setRawInput] = useState('');
    const [result, setResult] = useState<any>(null);

    // Auto-Analyze on Paste logic (Optional, keeping manual for now)
    const handleAnalyze = async () => {
        if (!rawInput.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText: rawInput, isPro })
            });
            const data = await res.json();
            if (data.success) setResult(data.data);
        } catch (err) {
            alert("Error processing");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    };

    return (
        <div className="min-h-screen bg-bg-subtle font-sans text-brand-heading pb-20">

            {/* HEADER */}
            <div className="bg-card-bg border-b border-card-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-primary text-white p-1.5 rounded-lg"><MessageSquare size={20} /></div>
                        <h1 className="font-bold text-lg">WhatsApp Manager <span className="text-text-muted-light font-normal text-sm">All-in-One</span></h1>
                    </div>
                    <button onClick={() => setIsPro(!isPro)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-2 ${isPro ? 'bg-brand-secondary text-white border-slate-900' : 'bg-card-bg text-text-muted hover:bg-bg-subtle'}`}>
                        {isPro ? <><Crown size={14} className="text-yellow-400" /> Pro Active</> : 'Switch to Pro Mode'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8">

                {/* LEFT: INPUT AREA */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border">
                        <h2 className="font-bold text-text-main mb-4 flex items-center gap-2">
                            <Wand2 size={18} className="text-brand-primary" /> Input Data
                        </h2>
                        <textarea
                            className="w-full h-48 p-4 border rounded-xl bg-bg-subtle focus:border-brand-primary outline-none resize-none font-mono text-sm"
                            placeholder="Paste Order OR Phone Number here...&#10;&#10;e.g. Ali 03001234567 Lahore&#10;OR just 03001234567 to verify"
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full mt-4 bg-brand-secondary hover:bg-brand-secondary-hover text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Process & Verify"}
                        </button>
                    </div>
                </div>

                {/* RIGHT: RESULTS CENTER */}
                <div className="lg:col-span-7 space-y-6">
                    {result ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

                            {/* 1. VERIFICATION CARD */}
                            <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border relative overflow-hidden">
                                {/* Risk Bar */}
                                <div className={`absolute top-0 left-0 w-2 h-full ${result.verification.riskLevel === 'High' ? 'bg-red-500' : result.verification.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-brand-primary-light0'}`}></div>

                                <div className="flex justify-between items-start mb-6 pl-4">
                                    <div>
                                        <h3 className="font-bold text-text-main text-lg">Verification Report</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${result.verification.phoneStatus.includes('Valid') ? 'bg-brand-primary-light text-brand-primary' : 'bg-red-100 text-red-700'}`}>
                                                {result.verification.phoneStatus}
                                            </span>
                                            {isPro && (
                                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Smartphone size={10} /> {result.verification.waActivity.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-text-muted-light font-bold uppercase">Risk Score</span>
                                        <div className={`text-2xl font-black ${result.verification.riskLevel === 'High' ? 'text-red-500' : result.verification.riskLevel === 'Medium' ? 'text-orange-500' : 'text-brand-primary'}`}>
                                            {result.verification.totalRisk}%
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Details Parsed */}
                                <div className="grid grid-cols-2 gap-4 pl-4">
                                    <div className="p-3 bg-bg-subtle rounded-lg border border-card-border-subtle">
                                        <span className="text-[10px] text-text-muted-light font-bold uppercase">Name</span>
                                        <p className="font-medium text-text-main truncate">{result.customer.name}</p>
                                    </div>
                                    <div className="p-3 bg-bg-subtle rounded-lg border border-card-border-subtle">
                                        <span className="text-[10px] text-text-muted-light font-bold uppercase">Phone</span>
                                        <p className="font-medium text-text-main font-mono">{result.customer.phone || 'Missing'}</p>
                                    </div>
                                    <div className="p-3 bg-bg-subtle rounded-lg border border-card-border-subtle col-span-2">
                                        <span className="text-[10px] text-text-muted-light font-bold uppercase">Address</span>
                                        <p className="font-medium text-text-main flex items-center gap-2">
                                            <MapPin size={14} className="text-text-muted-light" />
                                            {result.customer.address}, {result.customer.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 pl-4 flex gap-3">
                                    {result.customer.phone && (
                                        <a href={result.links.waLink} target="_blank" className="flex-1 bg-brand-primary-light0 hover:bg-brand-primary text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition">
                                            <ExternalLink size={16} /> Open Chat
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* 2. MESSAGE GENERATOR */}
                            <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border">
                                <h3 className="font-bold text-text-main mb-4">Generated Message</h3>

                                {result.verification.riskLevel === 'High' ? (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-sm text-red-800 mb-2 font-medium">⚠️ High Risk Order detected. Send this verification request instead:</p>
                                        <div className="bg-card-bg p-3 rounded border border-red-200 text-sm text-text-muted font-mono whitespace-pre-wrap">
                                            {result.messages.fake}
                                        </div>
                                        <button onClick={() => copyToClipboard(result.messages.fake)} className="mt-2 text-xs font-bold text-red-600 hover:underline">Copy Warning Message</button>
                                    </div>
                                ) : (
                                    <div className="bg-bg-subtle p-4 rounded-xl border border-card-border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-text-muted uppercase">Confirmation Text</span>
                                            <button onClick={() => copyToClipboard(result.messages.confirm)} className="text-brand-primary hover:text-brand-primary"><Copy size={16} /></button>
                                        </div>
                                        <div className="text-sm text-text-main font-sans whitespace-pre-wrap">
                                            {result.messages.confirm}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-bg-subtle rounded-2xl border-2 border-dashed border-card-border p-10 text-center opacity-50">
                            <ShieldCheck size={48} className="mb-4 text-slate-300" />
                            <h3 className="font-bold text-lg text-text-muted-light">Ready to Manage</h3>
                            <p className="text-sm text-text-muted-light">Paste an order or number to verify & format.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}