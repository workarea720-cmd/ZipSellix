import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Copy, ExternalLink, MapPin, Loader2, CheckCircle2, Phone, User, Send, ArrowRight, AlertOctagon, Info, Building2, MessageCircle } from 'lucide-react';
import { WhatsAppManagerLogicReturn, waLink } from '../useWhatsAppManagerLogic';

export default function DesktopUI({ logic }: { logic: WhatsAppManagerLogicReturn }) {
    const {
        form, setField, loading, result, localResult,
        copied, setCopied, activeTemplate, setActiveTemplate,
        canSubmit, handleVerify, copy, templates, risk, rCfg
    } = logic;

    return (
        <div className="space-y-5 max-w-7xl mx-auto p-6 bg-[#f8fafc] text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* ── Split panels ── */}
            <div className="grid lg:grid-cols-2 gap-5">

                {/* ──────────── LEFT PANEL: INPUT FORM ──────────── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[24px] border border-[#304250]/10 overflow-hidden shadow-[0_8px_30px_rgba(48,66,80,0.04)]">
                        <div className="px-5 py-4 border-b border-[#304250]/5 bg-gray-50/60">
                            <h2 className="text-sm font-extrabold text-[#304250] flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-[#20A46B]/10 flex items-center justify-center shadow-sm border border-[#20A46B]/20">
                                    <MessageCircle size={15} className="text-[#20A46B]" />
                                </div>
                                Customer Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-extrabold text-[#304250]/60 mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                                    <User size={13} className="text-[#304250]/40" /> Customer Name <span className="text-red-400">*</span>
                                </label>
                                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Ahmad Hassan"
                                    className="w-full px-4 py-3 text-sm border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 outline-none transition-all placeholder:text-[#304250]/30 placeholder:font-medium font-bold text-[#304250] shadow-sm" />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[11px] font-extrabold text-[#304250]/60 mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                                    <Phone size={13} className="text-[#304250]/40" /> Phone Number <span className="text-red-400">*</span>
                                </label>
                                <input type="text" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="03XX-XXXXXXX"
                                    className="w-full px-4 py-3 text-sm border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 outline-none transition-all font-mono font-bold placeholder:font-medium placeholder:text-[#304250]/30 text-[#304250] shadow-sm" />
                            </div>

                            {/* City */}
                            <div>
                                <label className="text-[11px] font-extrabold text-[#304250]/60 mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                                    <Building2 size={13} className="text-[#304250]/40" /> City
                                </label>
                                <input type="text" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Lahore"
                                    className="w-full px-4 py-3 text-sm border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 outline-none transition-all placeholder:text-[#304250]/30 placeholder:font-medium font-bold text-[#304250] shadow-sm" />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-[11px] font-extrabold text-[#304250]/60 mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                                    <MapPin size={13} className="text-[#304250]/40" /> Complete Address
                                </label>
                                <textarea rows={3} value={form.address} onChange={e => setField('address', e.target.value)}
                                    placeholder="House 12, Street 5, Model Town, Lahore"
                                    className="w-full px-4 py-3 text-sm border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-2 focus:ring-[#20A46B]/20 outline-none transition-all resize-none placeholder:text-[#304250]/30 placeholder:font-medium font-bold text-[#304250] shadow-sm custom-scrollbar" />
                            </div>

                            {/* FIX: Brand Green applied here based on your screenshot */}
                            <button onClick={handleVerify} disabled={loading || !canSubmit}
                                className="w-full bg-[#20A46B] hover:bg-[#20A46B]/90 disabled:bg-gray-100 disabled:text-[#304250]/30 disabled:border-transparent text-white py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:shadow-none border border-transparent active:scale-[0.98]">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                                {loading ? 'Verifying...' : 'Run Verification'}
                            </button>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2.5 px-5 py-4 bg-gray-50/50 border border-[#304250]/10 rounded-2xl shadow-sm">
                        <Info size={16} className="text-[#20A46B] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-[#304250]/70 leading-relaxed font-medium uppercase tracking-wider"><strong>Format Validation Only.</strong> Phone validation is format-based (PK numbers). Real-time carrier checking is reserved for PRO tier.</p>
                    </div>
                </div>

                {/* ──────────── RIGHT PANEL: RESULT ──────────── */}
                <div>
                    {risk && rCfg ? (
                        <div className="bg-white rounded-[24px] border border-[#304250]/10 overflow-hidden shadow-[0_8px_30px_rgba(48,66,80,0.04)] animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                            {/* Score header */}
                            {/* FIX: Using rCfg for dynamic colors, but defaulting positive to brand green */}
                            <div className="flex items-center justify-between px-6 py-5" style={{ background: rCfg.bg, borderBottom: `1px solid ${rCfg.border}` }}>
                                <div className="flex items-center gap-3">
                                    {/* Risk Badge */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold ring-1 ${risk.level === 'Low' ? 'bg-[#20A46B]/10 text-[#20A46B] ring-[#20A46B]/30' : rCfg.badge}`}>
                                        <rCfg.Icon size={16} /> {risk.level} Risk
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-widest block leading-none mb-1">Risk Score</span>
                                    {/* Override text color to brand green if it's low risk */}
                                    <span className="text-3xl font-black leading-none tracking-tight" style={{ color: risk.level === 'Low' ? '#20A46B' : rCfg.text }}>{risk.score}%</span>
                                </div>
                            </div>

                            {/* Flags */}
                            <div className="px-6 py-5 border-b border-[#304250]/5 bg-gray-50/30">
                                <span className="text-[10px] text-[#304250]/50 font-extrabold uppercase tracking-widest block mb-3">Verification Flags</span>
                                <div className="space-y-2.5">
                                    {risk.flags.map((f, i) => (
                                        <div key={i} className="flex items-start gap-2.5 text-sm">
                                            {/* Fix: Medium flag uses Yellow Accent */}
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${f.severity === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : f.severity === 'Medium' ? 'bg-[#EEBE1C]' : 'bg-[#20A46B]'}`} />
                                            <span className={`${f.severity === 'High' ? 'text-red-700 font-bold' : f.severity === 'Medium' ? 'text-[#EEBE1C] font-bold' : 'text-[#20A46B] font-bold'}`}>{f.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Customer data grid */}
                            <div className="grid grid-cols-2 gap-px bg-[#304250]/5 flex-1">
                                {[
                                    { icon: User, label: 'Name', value: form.name || '—' },
                                    { icon: Phone, label: 'Phone', value: form.phone || '—' },
                                    { icon: Building2, label: 'City', value: form.city || '—' },
                                    { icon: MapPin, label: 'Address', value: form.address || '—' },
                                ].map((d, i) => (
                                    <div key={i} className="bg-white p-5 hover:bg-gray-50 transition-colors">
                                        <span className="text-[10px] text-[#304250]/40 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2"><d.icon size={12} className="text-[#304250]/30" /> {d.label}</span>
                                        <p className={`text-sm text-[#304250] font-bold ${d.label === 'Phone' ? 'font-mono tracking-wide' : ''}`}>{d.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Duplicate info from backend */}
                            {result && result.duplicateInfo.totalPrevious > 0 && (
                                <div className={`mx-6 my-5 px-4 py-3.5 rounded-xl text-sm border flex items-center justify-between shadow-sm ${result.duplicateInfo.cancelled > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#20A46B]/5 border-[#20A46B]/20 text-[#20A46B]'}`}>
                                    <strong className="flex items-center gap-2 font-extrabold">
                                        {result.duplicateInfo.cancelled > 0 ? <><AlertOctagon size={16} className="text-red-600" /> Risky Duplicate</> : <><Info size={16} className="text-[#20A46B]" /> Returning Customer</>}
                                    </strong>
                                    <span className={`font-bold px-2.5 py-1 rounded-md ${result.duplicateInfo.cancelled > 0 ? 'bg-red-100/50' : 'bg-white/60 border border-[#20A46B]/10'}`}>Previous: {result.duplicateInfo.totalPrevious} | ✅ {result.duplicateInfo.confirmed} | ❌ {result.duplicateInfo.cancelled}</span>
                                </div>
                            )}

                            {/* Quick actions - Made Open via WhatsApp full width */}
                            <div className="px-6 py-5 border-t border-[#304250]/5 bg-gray-50 mt-auto">
                                {form.phone ? (
                                    // FIX: Changed from native WA color to Brand Green (#20A46B) to match your Run Verification Button screenshot
                                    <a href={waLink(form.phone, '')} target="_blank" rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-[#20A46B] text-white px-5 py-3.5 rounded-xl text-sm font-extrabold hover:bg-[#20A46B]/90 hover:shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-all active:scale-95">
                                        <ExternalLink size={16} /> Open via WhatsApp
                                    </a>
                                ) : (
                                    <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-[#304250]/30 px-5 py-3.5 rounded-xl text-sm font-extrabold border border-transparent cursor-not-allowed">
                                        <ExternalLink size={16} /> Open via WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.02)] p-12 text-center h-full min-h-[500px]">
                            <div className="w-20 h-20 rounded-full bg-gray-50 border border-[#304250]/5 shadow-sm flex items-center justify-center mb-6">
                                <ShieldCheck size={32} className="text-[#304250]/20" />
                            </div>
                            <h3 className="font-extrabold text-[#304250]/40 text-xl mb-2">Awaiting Verification</h3>
                            <p className="text-sm text-[#304250]/60 max-w-[280px] leading-relaxed font-medium">Enter the customer details on the left and run verification to see the risk score, flags, and actionable insights.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ──────────── BOTTOM PANEL: ACTION CENTER ──────────── */}
            {risk && (
                <div className="bg-white rounded-[24px] border border-[#304250]/10 overflow-hidden shadow-[0_8px_30px_rgba(48,66,80,0.04)] animate-in fade-in slide-in-from-bottom-4 mt-5">
                    <div className="px-6 py-5 border-b border-[#304250]/5 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#304250] flex items-center gap-2.5 uppercase tracking-wider">
                            <div className="w-8 h-8 bg-[#304250]/5 text-[#304250] rounded-lg flex items-center justify-center border border-[#304250]/10 shadow-sm"><Send size={14} /></div>
                            Communication Templates
                        </h3>
                    </div>

                    {/* Template tabs */}
                    <div className="flex border-b border-[#304250]/5 bg-white overflow-x-auto no-scrollbar">
                        {[
                            { key: 'confirmation' as const, label: 'Order Confirmation', icon: CheckCircle2 },
                            { key: 'recheck' as const, label: 'Address Recheck', icon: MapPin },
                            { key: 'codReminder' as const, label: 'COD Reminder', icon: AlertTriangle },
                        ].map(t => (
                            <button key={t.key} onClick={() => setActiveTemplate(t.key)}
                                /* FIX: Active Tab now uses Yellow Accent bottom border instead of colored backgrounds */
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all whitespace-nowrap outline-none
                                ${activeTemplate === t.key ? 'border-[#EEBE1C] text-[#304250]' : 'border-transparent text-[#304250]/50 hover:text-[#304250] hover:bg-gray-50'}`}>
                                <t.icon size={16} className={activeTemplate === t.key ? "text-[#EEBE1C]" : ""} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Template content */}
                    <div className="p-6 flex flex-col md:flex-row gap-6 items-start bg-white">
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-[#304250]/10 p-6 shadow-inner w-full">
                            <pre className="text-sm text-[#304250] whitespace-pre-wrap font-sans leading-relaxed font-bold">{templates[activeTemplate]}</pre>
                        </div>
                        <div className="w-full md:w-72 flex flex-col gap-3 shrink-0">
                            {/* FIX: Copy Button uses Yellow Accent (#EEBE1C) */}
                            <button onClick={() => copy(templates[activeTemplate], activeTemplate)}
                                className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-extrabold transition-all border outline-none active:scale-95
                                ${copied === activeTemplate ? 'bg-[#EEBE1C] text-[#304250] border-[#EEBE1C] shadow-sm' : 'bg-white text-[#304250] border-[#304250]/10 hover:bg-gray-50 hover:border-[#304250]/30 shadow-sm'}`}>
                                <Copy size={16} className={copied === activeTemplate ? "text-[#304250]" : "text-[#304250]/40"} />
                                {copied === activeTemplate ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                            </button>

                            {form.phone ? (
                                /* FIX: Used Brand Green (#20A46B) here for Send via WhatsApp instead of WA default green */
                                <a href={waLink(form.phone, templates[activeTemplate])} target="_blank" rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-extrabold bg-[#20A46B] text-white hover:bg-[#20A46B]/90 transition-colors shadow-md shadow-[#20A46B]/20">
                                    <ExternalLink size={16} /> Send via WhatsApp
                                </a>
                            ) : (
                                <button disabled className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-extrabold bg-gray-100 text-[#304250]/30 border border-transparent cursor-not-allowed outline-none">
                                    <ExternalLink size={16} /> Send via WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}