import React, { useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Copy, ExternalLink, MapPin, Loader2, CheckCircle2, Phone, User, Send, ArrowRight, AlertOctagon, Info, Building2, MessageCircle } from 'lucide-react';
import { WhatsAppManagerLogicReturn, waLink } from '../useWhatsAppManagerLogic';

// Custom Original WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
);

export default function MobileUI({ logic }: { logic: WhatsAppManagerLogicReturn }) {
    const {
        form, setField, loading, result, localResult,
        copied, setCopied, activeTemplate, setActiveTemplate,
        canSubmit, handleVerify, copy, templates, risk, rCfg
    } = logic;

    // Automatically scroll to result when risk object changes and is not null
    useEffect(() => {
        if (risk) {
            const el = document.getElementById('mobile-verification-result');
            if (el) {
                // slight delay to let render finish
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [risk]);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-28 text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <main className="p-4 space-y-6 flex-1 mt-4">

                {/* ──────────── INPUT FORM ──────────── */}
                <div className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] overflow-hidden">
                    <div className="p-5 border-b border-[#304250]/5 flex items-center justify-between">
                        <h2 className="font-extrabold text-sm text-[#304250] flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#20A46B]/10 flex items-center justify-center border border-[#20A46B]/20">
                                <MessageCircle size={16} className="text-[#20A46B]" />
                            </div>
                            Customer Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-6 text-sm font-medium">
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-[#304250]/40" /> Customer Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Ahmad Hassan"
                                className="w-full bg-gray-50 border border-[#304250]/10 px-4 py-3.5 rounded-xl outline-none focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 transition-all font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={14} className="text-[#304250]/40" /> Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="03XX-XXXXXXX"
                                className="w-full bg-gray-50 border border-[#304250]/10 px-4 py-3.5 rounded-xl outline-none focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 transition-all font-mono font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-sans placeholder:font-medium shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={14} className="text-[#304250]/40" /> City
                            </label>
                            <input type="text" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Lahore"
                                className="w-full bg-gray-50 border border-[#304250]/10 px-4 py-3.5 rounded-xl outline-none focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 transition-all font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium shadow-sm" />
                        </div>
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-[#304250]/40" /> Complete Address
                            </label>
                            <textarea rows={3} value={form.address} onChange={e => setField('address', e.target.value)}
                                placeholder="House 12, Street 5, Model Town, Lahore"
                                className="w-full bg-gray-50 border border-[#304250]/10 px-4 py-3.5 rounded-xl outline-none focus:border-[#20A46B] focus:bg-white focus:ring-2 focus:ring-[#20A46B]/20 transition-all resize-none font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium shadow-sm custom-scrollbar" />
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2.5 px-5 py-4 bg-gray-50/50 border border-[#304250]/10 rounded-2xl shadow-sm">
                    <Info size={16} className="text-[#20A46B] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-[#304250]/70 leading-relaxed font-medium uppercase tracking-wider"><strong>Format Validation Only.</strong> Phone validation is format-based (PK numbers). Real-time carrier checking is reserved for PRO tier.</p>
                </div>

                {/* ──────────── RESULTS & FLAGS ──────────── */}
                {risk && rCfg && (
                    <div id="mobile-verification-result" className="bg-white rounded-[24px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Score Header */}
                        <div className="p-6 flex items-center justify-between border-b border-[#304250]/5" style={{ background: risk.level === 'Low' ? '#f0fdf4' : rCfg.bg }}>
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border shadow-sm ${risk.level === 'Low' ? 'bg-[#dcfce7] text-[#20A46B] border-[#bbf7d0]' : rCfg.badge}`}>
                                    <rCfg.Icon size={16} /> {risk.level} Risk
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-50 mb-0.5" style={{ color: risk.level === 'Low' ? '#304250' : rCfg.text }}>Risk Score</span>
                                <span className="text-4xl font-black leading-none tracking-tighter" style={{ color: risk.level === 'Low' ? '#20A46B' : rCfg.text }}>{risk.score}%</span>
                            </div>
                        </div>

                        {/* Flags List */}
                        <div className="p-6 border-b border-[#304250]/5">
                            <span className="text-[10px] text-[#304250]/40 font-extrabold uppercase tracking-widest block mb-4">Verification Flags</span>
                            <div className="space-y-3">
                                {risk.flags.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 shadow-sm ${f.severity === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : f.severity === 'Medium' ? 'bg-[#EEBE1C]' : 'bg-[#20A46B]'}`} />
                                        <span className={`${f.severity === 'High' ? 'text-red-700 font-bold' : f.severity === 'Medium' ? 'text-[#c2410c] font-bold' : 'text-[#20A46B] font-bold'}`}>{f.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Summary Cards */}
                        <div className="grid grid-cols-2 gap-px bg-[#304250]/5 border-b border-[#304250]/5">
                            {[
                                { icon: User, label: 'Name', value: form.name || '—' },
                                { icon: Phone, label: 'Phone', value: form.phone || '—' },
                                { icon: Building2, label: 'City', value: form.city || '—' },
                                { icon: MapPin, label: 'Address', value: form.address || '—' },
                            ].map((d, i) => (
                                <div key={i} className={`bg-white p-5 hover:bg-gray-50 transition-colors ${(d.label === 'Address' || d.label === 'City') ? 'col-span-2' : ''}`}>
                                    <span className="text-[10px] text-[#304250]/40 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2"><d.icon size={12} className="opacity-70" /> {d.label}</span>
                                    <p className={`text-sm text-[#304250] font-bold ${d.label === 'Phone' ? 'font-mono' : ''}`}>{d.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Duplicates */}
                        {result && result.duplicateInfo.totalPrevious > 0 && (
                            <div className={`p-5 border-b ${result.duplicateInfo.cancelled > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-[#304250]/5'}`}>
                                <h4 className={`text-xs font-extrabold flex items-center gap-2 mb-3 ${result.duplicateInfo.cancelled > 0 ? 'text-red-800' : 'text-[#304250]'}`}>
                                    {result.duplicateInfo.cancelled > 0 ? <><AlertOctagon size={16} /> High Risk Duplicate</> : <><Info size={16} className="text-[#20A46B]" /> Returning Customer</>}
                                </h4>
                                <div className="flex gap-2">
                                    <span className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm border border-[#304250]/10 whitespace-nowrap text-[#304250]">Total: {result.duplicateInfo.totalPrevious}</span>
                                    <span className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm border border-[#304250]/10 text-[#20A46B] whitespace-nowrap">✅ Confirmed: {result.duplicateInfo.confirmed}</span>
                                    {result.duplicateInfo.cancelled > 0 && <span className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm border border-red-100 text-red-600 whitespace-nowrap">❌ Cancelled: {result.duplicateInfo.cancelled}</span>}
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="px-6 py-5 bg-white mt-auto">
                            {form.phone ? (
                                <a href={waLink(form.phone, '')} target="_blank" rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-[#20A46B] text-white px-5 py-4 rounded-xl text-sm font-extrabold active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90">
                                    <ExternalLink size={18} /> Open via WhatsApp
                                </a>
                            ) : (
                                <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-[#304250]/30 px-5 py-4 rounded-xl text-sm font-extrabold border border-transparent cursor-not-allowed">
                                    <ExternalLink size={18} /> Open via WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ──────────── TEMPLATES & ACTION CENTER ──────────── */}
                {risk && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
                        <div className="bg-white rounded-[24px] border border-[#304250]/10 overflow-hidden shadow-[0_8px_30px_rgba(48,66,80,0.04)]">
                            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#304250]/5 bg-gray-50/50">
                                <div className="w-8 h-8 bg-[#304250]/5 text-[#304250] rounded-lg flex items-center justify-center border border-[#304250]/10 shadow-sm"><Send size={14} /></div>
                                <h3 className="font-extrabold text-[#304250] text-sm uppercase tracking-wider">Communication Templates</h3>
                            </div>

                            {/* Template tabs - FIXED: Removed horizontal scroll, used flex-wrap to make them wrap naturally */}
                            <div className="flex flex-wrap gap-2 p-4 border-b border-[#304250]/5 bg-white">
                                {[
                                    { key: 'confirmation' as const, label: 'Order Confirm', icon: CheckCircle2 },
                                    { key: 'recheck' as const, label: 'Address Recheck', icon: MapPin },
                                    { key: 'codReminder' as const, label: 'COD Reminder', icon: AlertTriangle },
                                ].map(t => (
                                    <button key={t.key} onClick={() => setActiveTemplate(t.key)}
                                        className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-4 py-3 text-[10px] uppercase tracking-wider font-extrabold rounded-xl transition-all outline-none border shadow-sm active:scale-95
                                        ${activeTemplate === t.key ? 'border-[#EEBE1C] text-[#304250] bg-[#EEBE1C]/10' : 'border-[#304250]/10 text-[#304250]/50 hover:text-[#304250] hover:bg-gray-50'}`}>
                                        <t.icon size={14} className={activeTemplate === t.key ? "text-[#EEBE1C]" : ""} /> {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Template content */}
                            <div className="p-5 space-y-5 bg-white">
                                <div className="bg-gray-50 rounded-2xl border border-[#304250]/10 p-5 shadow-inner">
                                    <pre className="text-sm text-[#304250] whitespace-pre-wrap font-sans leading-relaxed font-bold">{templates[activeTemplate]}</pre>
                                </div>

                                {/* FIXED: Actions Buttons Stacked Vertically (Upar Neechay) */}
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => copy(templates[activeTemplate], activeTemplate)}
                                        className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-extrabold transition-all border outline-none active:scale-95
                                        ${copied === activeTemplate ? 'bg-[#EEBE1C] text-[#304250] border-[#EEBE1C] shadow-sm' : 'bg-white text-[#304250] border-[#304250]/10 hover:bg-gray-50 hover:border-[#304250]/30 shadow-sm'}`}>
                                        <Copy size={16} className={copied === activeTemplate ? "text-[#304250]" : "text-[#304250]/40"} />
                                        {copied === activeTemplate ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                                    </button>

                                    {form.phone ? (
                                        <a href={waLink(form.phone, templates[activeTemplate])} target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-extrabold bg-[#20A46B] text-white hover:bg-[#20A46B]/90 transition-colors shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98] outline-none">
                                            <Send size={16} /> Send via WhatsApp
                                        </a>
                                    ) : (
                                        <button disabled className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-extrabold bg-gray-100 text-[#304250]/30 border border-transparent cursor-not-allowed outline-none">
                                            <Send size={16} /> Send via WhatsApp
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM EXECUTE BUTTON */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#304250]/10 z-40 pb-safe shadow-[0_-10px_40px_rgba(48,66,80,0.05)]">
                <button
                    onClick={handleVerify}
                    disabled={loading || !canSubmit}
                    className="w-full bg-[#20A46B] text-white disabled:bg-gray-200 disabled:text-[#304250]/40 disabled:border-transparent min-h-[56px] rounded-[16px] font-bold text-lg flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:shadow-none active:scale-[0.98] transition-all hover:bg-[#20A46B]/90"
                >
                    {loading ? <Loader2 className="animate-spin" size={22} /> : <ShieldCheck size={22} className={canSubmit ? "text-white" : ""} />}
                    {loading ? 'Analyzing Risk...' : 'Run Verification'}
                </button>
            </div>
        </div>
    );
}