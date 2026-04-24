import React from 'react';
import { SeoGeneratorLogicReturn, CSS } from '../useSeoGeneratorLogic';
import {
    Search, Copy, Check, Rocket, Globe, MapPin,
    BarChart, Loader2, Sparkles, Link as LinkIcon,
    Image as ImageIcon, ExternalLink, ArrowRightCircle, FileText
} from 'lucide-react';

export default function MobileUI({ logic }: { logic: SeoGeneratorLogicReturn }) {
    const {
        productName, setProductName,
        features, setFeatures,
        brandName, setBrandName,
        result,
        loading,
        copiedField,
        handleGenerate,
        copyToClipboard
    } = logic;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] pb-[100px] flex flex-col pt-4 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            <style>{CSS}</style>

            <main className="flex-1 p-4 space-y-4">

                {/* --- 1. INPUT AREA --- */}
                <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 space-y-5">
                    <div className="flex items-center gap-2 border-b border-[#304250]/10 pb-3">
                        <Search size={18} className="text-[#20A46B]" />
                        <h2 className="font-extrabold text-[#304250] text-base">Product Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full p-3.5 bg-gray-50 border border-[#304250]/10 rounded-xl focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 focus:bg-white outline-none transition-all text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 shadow-sm"
                                placeholder="e.g. Neon Gaming Keyboard"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Brand Name</label>
                            <input
                                type="text"
                                className="w-full p-3.5 bg-gray-50 border border-[#304250]/10 rounded-xl focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 focus:bg-white outline-none transition-all text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 shadow-sm"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Key Features <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full h-24 p-3.5 bg-gray-50 border border-[#304250]/10 rounded-xl focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 focus:bg-white outline-none resize-none transition-all text-sm font-bold text-[#304250] placeholder:font-medium placeholder:text-[#304250]/30 custom-scrollbar shadow-sm"
                                placeholder="e.g. RGB lights, Wireless..."
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- 2. OUTPUT RESULTS --- */}
                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">

                        {/* Title & Metadata Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest">SEO Title</span>
                                    {/* YELLOW BRAND COLOR USED HERE */}
                                    <button onClick={() => copyToClipboard(result.seo_title, 'title')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-colors shadow-[0_2px_8px_rgba(238,190,28,0.3)]">
                                        {copiedField === 'title' ? <Check size={12} /> : <Copy size={12} />} Copy
                                    </button>
                                </div>
                                <div className="p-3 bg-[#20A46B]/5 border border-[#20A46B]/20 rounded-xl text-[#20A46B] font-extrabold text-sm leading-snug shadow-inner">
                                    {result.seo_title}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 flex flex-col justify-center shadow-sm">
                                    <span className="text-[9px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-0.5">Keyword</span>
                                    <span className="font-black text-[#304250] text-[13px] leading-tight">{result.focus_keyword}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 overflow-hidden flex flex-col justify-center shadow-sm">
                                    <span className="text-[9px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-0.5">Slug</span>
                                    <span className="font-mono font-bold text-[#304250]/60 text-[11px] truncate block">{result.slug}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] font-extrabold text-[#304250]/50 uppercase tracking-widest block mb-1.5">Meta Description</span>
                                <p className="text-xs text-[#304250]/70 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-[#304250]/5 shadow-sm">
                                    {result.meta_description}
                                </p>
                            </div>
                        </div>

                        {/* Strategy Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-4">
                            <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[#304250]/10 pb-2.5 text-[#304250]">
                                <LinkIcon className="text-[#20A46B]" size={16} /> Smart Strategy
                            </h3>

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 shadow-sm">
                                    <h4 className="font-extrabold text-[9px] uppercase text-[#304250]/60 tracking-wider mb-2 flex items-center gap-1.5">
                                        <ArrowRightCircle size={12} className="text-[#20A46B]" /> Internal Links
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {result.internal_links?.map((link: string, i: number) => (
                                            <li key={i} className="text-[11px] font-bold text-[#304250] bg-white px-2.5 py-1.5 rounded-lg border border-[#304250]/5 shadow-sm leading-tight truncate">
                                                🔗 {link}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 shadow-sm">
                                    <h4 className="font-extrabold text-[9px] uppercase text-[#304250]/60 tracking-wider mb-2 flex items-center gap-1.5">
                                        <ExternalLink size={12} className="text-blue-500" /> Outbound Link
                                    </h4>
                                    <div className="bg-white p-2.5 rounded-lg border border-[#304250]/5 shadow-sm text-[11px] font-bold text-blue-600 break-all leading-tight">
                                        {result.outbound_link}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 shadow-sm">
                                    <h4 className="font-extrabold text-[9px] uppercase text-[#304250]/60 tracking-wider mb-2 flex items-center gap-1.5">
                                        <Globe size={12} className="text-[#20A46B]" /> Additional Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.secondary_keywords?.map((kw: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-white text-[#304250]/70 rounded-md text-[10px] font-bold border border-[#304250]/5 shadow-sm">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Media Container */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-3">
                            <div className="flex justify-between items-center mb-2 border-b border-[#304250]/10 pb-2.5">
                                <h4 className="font-extrabold text-sm text-[#304250] flex items-center gap-2">
                                    <ImageIcon size={16} className="text-[#20A46B]" /> Image Alt Text
                                </h4>
                                {/* YELLOW BRAND COLOR USED HERE */}
                                <button onClick={() => copyToClipboard(result.image_alt_text, 'alt')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-colors shadow-[0_2px_8px_rgba(238,190,28,0.3)]">
                                    {copiedField === 'alt' ? <Check size={12} /> : <Copy size={12} />} Copy
                                </button>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 text-xs text-[#304250] font-mono font-bold shadow-sm">
                                {result.image_alt_text}
                            </div>
                        </div>

                        {/* HTML Description */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#304250]/10 pb-2.5">
                                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[#304250]">
                                    <FileText size={16} className="text-[#20A46B]" /> HTML Output
                                </h3>
                                {/* YELLOW BRAND COLOR USED HERE */}
                                <button onClick={() => copyToClipboard(result.product_description, 'desc')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-2.5 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition-transform shadow-[0_2px_8px_rgba(238,190,28,0.3)]">
                                    {copiedField === 'desc' ? <Check size={12} /> : <Copy size={12} />} Copy Code
                                </button>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-[#304250]/5 overflow-x-auto max-h-[300px] custom-scrollbar shadow-inner">
                                <div
                                    className={`prose prose-xs max-w-none 
                                    prose-headings:font-extrabold prose-h2:text-[#304250] prose-h2:text-sm prose-h3:text-[#304250]
                                    prose-p:text-[#304250]/80 prose-p:text-[11px] prose-p:leading-relaxed prose-p:font-medium
                                    prose-strong:text-[#304250] prose-strong:font-extrabold
                                    prose-table:w-full prose-table:border prose-table:border-[#304250]/10 prose-table:rounded-lg prose-table:overflow-hidden 
                                    prose-th:bg-white prose-th:p-1.5 prose-th:text-[10px] prose-th:text-left prose-th:text-[#304250] prose-th:font-extrabold
                                    prose-td:p-1.5 prose-td:text-[10px] prose-td:border-t prose-td:border-[#304250]/10 prose-td:text-[#304250]/80 prose-td:font-medium
                                    prose-ul:text-[#304250]/80 prose-li:font-medium`}
                                    dangerouslySetInnerHTML={{ __html: result.product_description }}
                                />
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#304250]/10 space-y-3">
                            <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[#304250]/10 pb-2.5 text-[#304250]">
                                <MapPin size={16} className="text-[#20A46B]" /> Generated FAQs
                            </h3>
                            <div className="space-y-2.5">
                                {result.faq_section?.map((faq: any, i: number) => (
                                    <details key={i} className="group bg-gray-50 border border-[#304250]/5 rounded-xl p-3 hover:border-[#20A46B]/20 transition-all shadow-sm cursor-pointer">
                                        <summary className="font-extrabold text-xs text-[#304250] list-none flex justify-between items-center pr-1 select-none">
                                            <span className="pr-3 leading-snug">{faq.question}</span>
                                            <span className="text-[#20A46B] font-black group-open:rotate-45 transition-transform text-base shrink-0">+</span>
                                        </summary>
                                        <p className="text-[#304250]/70 mt-2 text-[11px] font-medium leading-relaxed pt-2 border-t border-[#304250]/5">{faq.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- 3. EXECUTION BUTTON STICKY BOTTOM --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#304250]/10 z-30 pb-safe shadow-[0_-10px_40px_rgba(48,66,80,0.05)]">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !productName}
                    className={[
                        'w-full flex items-center justify-center gap-2 min-h-[56px] rounded-[16px] font-bold text-lg active:scale-[0.98] transition-all',
                        (loading || !productName) ? 'bg-gray-200 text-[#304250]/40 cursor-not-allowed' : 'bg-[#20A46B] text-white shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90'
                    ].join(' ')}
                >
                    {loading ? <><Loader2 size={24} className="animate-spin" /> Generating...</> : "Generate"}
                </button>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div>
    );
}