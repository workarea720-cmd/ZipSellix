'use client';
// src/app/tools/shipping-label/components/BulkShipment.tsx
// PRO ONLY — CSV bulk upload

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Upload, Lock, CheckCircle2, AlertCircle,
    Download, Loader2, FileText, Zap, ArrowRight
} from 'lucide-react';

const CSV_TEMPLATE = `name,phone,address,city,province,weight,cod,contents,order_ref
Ahmed Ali,03001234567,House 5 Block A Johar Town,Lahore,Punjab,0.5,1500,Shirt,ORD-001
Sara Khan,03211234567,Flat 3 Clifton,Karachi,Sindh,1.0,2500,Shoes,ORD-002`;

export default function BulkShipment() {
    const { data: session } = useSession();
    const isPro = (session?.user as any)?.planType?.toUpperCase() === 'PRO';

    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [courier, setCourier] = useState('PostEx');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'bulk-shipment-template.csv';
        a.click();
    };

    const handleUpload = async () => {
        if (!csvFile) return;
        setUploading(true);
        setResult(null);

        try {
            const senderInfo = (session?.user as any);
            const fd = new FormData();
            fd.append('csv', csvFile);
            fd.append('courier', courier);
            fd.append('senderName', senderInfo?.name || '');

            const res = await fetch('/api/courier/bulk', { method: 'POST', body: fd });
            const data = await res.json();

            if (res.status === 403 && data.requiresUpgrade) {
                setResult({ error: true, message: data.error });
            } else {
                setResult(data);
            }
        } catch (e) {
            setResult({ error: true, message: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    // ─── Locked UI for free users ─────────────────────────────────────
    if (!isPro) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl border border-[#304250]/10 shadow-sm p-10 text-center">
                    <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={28} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[#304250] mb-2">Bulk Shipment</h2>
                    <p className="text-[#304250]/60 font-medium mb-6 max-w-sm mx-auto">
                        Upload a CSV and book up to 200 shipments at once. Available on Pro plan.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: '📦', text: 'Up to 200 shipments per batch' },
                            { icon: '🏷️', text: 'Auto-generate all tracking IDs' },
                            { icon: '📄', text: 'Bulk label download as ZIP' },
                        ].map((f, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-[#304250]/8">
                                <div className="text-2xl mb-2">{f.icon}</div>
                                <p className="text-xs font-bold text-[#304250]/70">{f.text}</p>
                            </div>
                        ))}
                    </div>
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-[#20A46B] hover:bg-[#1a8f5c] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-all active:scale-95"
                    >
                        Upgrade to Pro <ArrowRight size={16} />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-[#304250]">Bulk Shipment</h2>
                    <span className="bg-[#20A46B] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">Pro</span>
                </div>
                <p className="text-sm text-[#304250]/60 font-medium">Upload CSV to book multiple shipments at once.</p>
            </div>

            {/* Template Download */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-amber-800">Download CSV Template</p>
                    <p className="text-xs text-amber-600">Required columns: name, phone, address, city, weight, cod</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 bg-white border border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors shrink-0"
                >
                    <Download size={13} /> Template
                </button>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-2xl border border-[#304250]/10 shadow-sm p-6 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest mb-1.5 block">Select Courier</label>
                        <select
                            value={courier}
                            onChange={e => setCourier(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#304250]/15 text-sm font-bold text-[#304250] focus:outline-none focus:border-[#20A46B]"
                        >
                            {['PostEx', 'Leopards', 'TCS', 'Trax', 'CallCourier', 'M&P'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (f && f.name.endsWith('.csv')) setCsvFile(f);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver
                            ? 'border-[#20A46B] bg-[#20A46B]/5'
                            : csvFile
                                ? 'border-[#20A46B] bg-[#20A46B]/5'
                                : 'border-[#304250]/20 hover:border-[#20A46B]/40 hover:bg-gray-50'
                        }`}
                >
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                    {csvFile ? (
                        <>
                            <FileText size={32} className="text-[#20A46B] mx-auto mb-3" />
                            <p className="font-bold text-[#304250]">{csvFile.name}</p>
                            <p className="text-xs text-[#304250]/50 mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload size={32} className="text-[#304250]/30 mx-auto mb-3" />
                            <p className="font-bold text-[#304250]">Drop CSV file here or click to browse</p>
                            <p className="text-xs text-[#304250]/50 mt-1">Max 200 rows · .csv only</p>
                        </>
                    )}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!csvFile || uploading}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#20A46B] hover:bg-[#1a8f5c] disabled:opacity-50 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-all active:scale-95"
                >
                    {uploading ? <><Loader2 size={16} className="animate-spin" /> Booking shipments...</> : <><Zap size={16} /> Book All Shipments</>}
                </button>
            </div>

            {/* Results */}
            {result && !result.error && (
                <div className="bg-white rounded-2xl border border-[#304250]/10 shadow-sm p-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-5">
                        <CheckCircle2 size={24} className="text-[#20A46B]" />
                        <div>
                            <h3 className="font-black text-[#304250]">Booking Complete</h3>
                            <p className="text-xs text-[#304250]/60">{result.successful} successful · {result.failed} failed out of {result.total} rows</p>
                        </div>
                    </div>

                    {result.results?.length > 0 && (
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-[#304250]/10">
                                        <th className="text-left py-2 px-2 font-extrabold text-[#304250]/50 uppercase tracking-widest">Row</th>
                                        <th className="text-left py-2 px-2 font-extrabold text-[#304250]/50 uppercase tracking-widest">Receiver</th>
                                        <th className="text-left py-2 px-2 font-extrabold text-[#304250]/50 uppercase tracking-widest">Tracking #</th>
                                        <th className="text-left py-2 px-2 font-extrabold text-[#304250]/50 uppercase tracking-widest">City</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.results.map((r: any) => (
                                        <tr key={r.row} className="border-b border-[#304250]/5">
                                            <td className="py-2 px-2 text-[#304250]/50">#{r.row}</td>
                                            <td className="py-2 px-2 font-bold text-[#304250]">{r.receiverName}</td>
                                            <td className="py-2 px-2 font-mono font-bold text-[#20A46B]">{r.trackingNumber}</td>
                                            <td className="py-2 px-2 text-[#304250]/60">{r.city}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {result.errors?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <AlertCircle size={12} /> {result.errors.length} rows failed
                            </p>
                            {result.errors.map((e: any) => (
                                <p key={e.row} className="text-xs text-red-500">Row {e.row}: {e.errors.join(', ')}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {result?.error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm font-bold text-red-600">{result.message}</p>
                </div>
            )}
        </div>
    );
}