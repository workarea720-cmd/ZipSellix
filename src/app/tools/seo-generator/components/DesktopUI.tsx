import React from 'react';
import { motion } from 'framer-motion';
import { SeoGeneratorLogicReturn, CSS } from '../useSeoGeneratorLogic';
import {
    Search, Copy, Check, Rocket, Globe, MapPin,
    BarChart, Loader2, Sparkles, Link as LinkIcon,
    Image as ImageIcon, ExternalLink, ArrowRightCircle, FileText
} from 'lucide-react';

export default function DesktopUI({ logic }: { logic: SeoGeneratorLogicReturn }) {
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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="min-h-screen bg-[#f8fafc] font-sans text-[#304250] p-8 selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            <style>{CSS}</style>
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* --- TOP BAR: INPUT AREA --- */}
                <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-[#304250]/10">
                        <h2 className="font-extrabold text-[#304250] flex items-center gap-2 text-xl tracking-tight">
                            <Search size={22} className="text-[#20A46B]" /> Input Details
                        </h2>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !productName}
                            className="flex bg-[#20A46B] hover:bg-[#20A46B]/90 text-white w-auto px-8 py-3.5 rounded-xl font-bold text-sm items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Generate"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full p-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 outline-none transition-all text-sm font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium shadow-sm"
                                placeholder="e.g. Neon Gaming Keyboard"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Brand Name</label>
                            <input
                                type="text"
                                className="w-full p-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 outline-none transition-all text-sm font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium shadow-sm"
                                placeholder="e.g. ZipSellix"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest flex items-center gap-1 mb-1.5">Key Features <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full h-24 p-3.5 border border-[#304250]/10 rounded-xl bg-gray-50 focus:bg-white focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B]/20 outline-none resize-none transition-all text-sm font-bold text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium custom-scrollbar shadow-sm"
                                placeholder="e.g. RGB lights, Wireless, Mechanical keys, Ergonomic design..."
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM AREA: OUTPUT RESULTS --- */}
                <div>
                    {!result ? (
                        <div className="flex flex-col items-center justify-center bg-white rounded-[32px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.02)] p-12 text-center min-h-[400px]">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-[#304250]/5">
                                <BarChart size={32} className="text-[#304250]/20" />
                            </div>
                            <h3 className="font-extrabold text-xl text-[#304250]/40 mb-2">Awaiting Instructions</h3>
                            <p className="text-sm text-[#304250]/60 max-w-sm mx-auto font-medium">
                                Enter your product details in the top bar, and I'll generate perfectly optimized titles, descriptions, and linking strategies below.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">

                            {/* 1. METADATA */}
                            <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 grid gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest">Perfect SEO Title</span>
                                        {/* YELLOW BRAND COLOR USED HERE */}
                                        <button onClick={() => copyToClipboard(result.seo_title, 'title')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-[0_2px_8px_rgba(238,190,28,0.3)]">
                                            {copiedField === 'title' ? <Check size={14} /> : <Copy size={14} />} Copy
                                        </button>
                                    </div>
                                    <div className="p-4 bg-[#20A46B]/5 border border-[#20A46B]/20 rounded-xl text-[#20A46B] font-extrabold text-xl shadow-inner">
                                        {result.seo_title}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-[#304250]/5 shadow-sm flex flex-col justify-center">
                                        <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-widest mb-1">Focus Keyword</span>
                                        <div className="font-extrabold text-[#304250] text-lg leading-tight">{result.focus_keyword}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-[#304250]/5 overflow-hidden shadow-sm flex flex-col justify-center">
                                        <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-widest mb-1">URL Slug</span>
                                        <div className="font-mono font-bold text-[#304250]/70 truncate">{result.slug}</div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-widest block mb-1.5">Meta Description</span>
                                    <p className="text-sm text-[#304250]/70 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-[#304250]/5 mt-2 shadow-sm">
                                        {result.meta_description}
                                    </p>
                                </div>
                            </div>

                            {/* 2. LINKING STRATEGY & MEDIA GRID */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Linking Strategy */}
                                <div className="bg-white p-8 rounded-[32px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] h-full">
                                    <h3 className="font-extrabold text-lg text-[#304250] mb-5 flex items-center gap-2">
                                        <LinkIcon className="text-[#20A46B]" size={20} /> Smart Linking Strategy
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-5 rounded-2xl border border-[#304250]/5 shadow-sm">
                                            <h4 className="font-extrabold text-xs uppercase text-[#304250] mb-3 flex items-center gap-2 tracking-wide">
                                                <ArrowRightCircle size={16} className="text-[#20A46B]" /> Internal Links
                                            </h4>
                                            <ul className="space-y-2.5">
                                                {result.internal_links?.map((link: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-[#304250] font-bold bg-white px-3.5 py-3 rounded-xl border border-[#304250]/10 shadow-sm leading-tight">
                                                        🔗 {link}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-2xl border border-[#304250]/5 shadow-sm">
                                            <h4 className="font-extrabold text-xs uppercase text-[#304250] mb-3 flex items-center gap-2 tracking-wide">
                                                <ExternalLink size={16} className="text-blue-500" /> Outbound Link
                                            </h4>
                                            <div className="bg-white p-4 rounded-xl border border-[#304250]/10 shadow-sm text-sm text-[#304250] font-bold break-all leading-relaxed">
                                                {result.outbound_link}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Media & LSI Container */}
                                <div className="space-y-6 flex flex-col h-full">
                                    {/* Media */}
                                    <div className="bg-white p-8 rounded-[32px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-extrabold text-lg text-[#304250] flex items-center gap-2">
                                                <ImageIcon size={20} className="text-[#20A46B]" /> Image Alt Text
                                            </h4>
                                            {/* YELLOW BRAND COLOR USED HERE */}
                                            <button onClick={() => copyToClipboard(result.image_alt_text, 'alt')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-[0_2px_8px_rgba(238,190,28,0.3)]">
                                                {copiedField === 'alt' ? <Check size={14} /> : <Copy size={14} />} Copy
                                            </button>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-[#304250]/5 text-sm text-[#304250] font-mono font-bold shadow-sm">
                                            {result.image_alt_text}
                                        </div>
                                    </div>

                                    {/* LSI Keywords */}
                                    <div className="bg-white p-8 rounded-[32px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] flex-1">
                                        <h4 className="font-extrabold text-lg text-[#304250] mb-5 flex items-center gap-2">
                                            <Globe size={20} className="text-[#20A46B]" /> LSI Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2.5">
                                            {result.secondary_keywords?.map((kw: string, i: number) => (
                                                <span key={i} className="px-3.5 py-1.5 bg-gray-50 text-[#304250]/70 rounded-xl text-xs font-bold border border-[#304250]/10 shadow-sm cursor-default">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. HTML DESCRIPTION (Full Width) */}
                            <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10">
                                <div className="flex flex-row items-center justify-between mb-6 pb-5 border-b border-[#304250]/10">
                                    <h3 className="font-extrabold text-xl text-[#304250] flex items-center gap-2">
                                        <FileText size={20} className="text-[#20A46B]" /> Full HTML Description
                                    </h3>
                                    {/* YELLOW BRAND COLOR USED HERE */}
                                    <button onClick={() => copyToClipboard(result.product_description, 'desc')} className="text-[#304250] bg-[#EEBE1C] hover:bg-[#d9ab18] px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_2px_8px_rgba(238,190,28,0.3)] hover:-translate-y-0.5">
                                        {copiedField === 'desc' ? <Check size={16} /> : <Copy size={16} />} Copy HTML Code
                                    </button>
                                </div>

                                <div
                                    className={`prose prose-slate max-w-none 
                                    prose-headings:font-extrabold prose-h2:text-[#304250] prose-h2:text-xl prose-h3:text-[#304250]
                                    prose-p:text-[#304250]/80 prose-p:font-medium prose-p:leading-relaxed 
                                    prose-strong:text-[#304250] prose-strong:font-extrabold
                                    prose-table:w-full prose-table:border prose-table:border-[#304250]/10 prose-table:rounded-xl prose-table:overflow-hidden 
                                    prose-th:bg-gray-50 prose-th:p-4 prose-th:text-left prose-th:text-[#304250] prose-th:font-extrabold
                                    prose-td:p-4 prose-td:border-t prose-td:border-[#304250]/10 prose-td:text-[#304250]/80 prose-td:font-medium
                                    prose-ul:text-[#304250]/80 prose-li:font-medium`}
                                    dangerouslySetInnerHTML={{ __html: result.product_description }}
                                />
                            </div>

                            {/* 4. FAQs (Full Width) */}
                            <div className="bg-white p-8 rounded-[32px] border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)]">
                                <h4 className="font-extrabold text-xl text-[#304250] mb-6 flex items-center gap-2">
                                    <MapPin size={22} className="text-[#20A46B]" /> Detailed FAQs
                                </h4>
                                <div className="space-y-4">
                                    {result.faq_section?.map((faq: any, i: number) => (
                                        <details key={i} className="group bg-gray-50 border border-[#304250]/10 rounded-2xl p-5 hover:border-[#20A46B]/30 hover:shadow-sm transition-all cursor-pointer">
                                            <summary className="font-extrabold text-[#304250] list-none flex justify-between items-center min-h-0 py-1 select-none">
                                                <span className="pr-4 leading-tight">{faq.question}</span>
                                                <span className="text-[#20A46B] font-extrabold group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                                            </summary>
                                            <p className="text-[#304250]/70 mt-4 text-sm font-medium leading-relaxed border-t border-[#304250]/10 pt-4">{faq.answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}