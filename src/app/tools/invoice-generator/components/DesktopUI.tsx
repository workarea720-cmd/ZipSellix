import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Eye, Edit3, Download, Share2, Loader2, Image } from 'lucide-react';
import { InvoiceLogicReturn } from '../useInvoiceLogic';
import {
    TemplateMinimal, TemplateCorporate, TemplateModern,
    TemplateElegant, TemplateTech, TemplateCompact,
    TemplateSimple, TemplateClassic
} from './SharedTemplates';

export default function DesktopUI({ logic }: { logic: InvoiceLogicReturn }) {
    const {
        data, update, handleUploads, calculations, printRef, handlePrint,
        selectedTemplate, setSelectedTemplate, isPreview, setIsPreview,
        handleDownloadPDF, handleDownloadPNG, isDownloading, downloadFormat
    } = logic;

    const [isSharing, setIsSharing] = useState(false);

    const templates: any = {
        1: TemplateMinimal, 2: TemplateCorporate, 3: TemplateModern,
        4: TemplateElegant, 5: TemplateTech, 6: TemplateCompact,
        7: TemplateSimple, 8: TemplateClassic
    };

    const ActiveTemplate = templates[selectedTemplate];

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Invoice Details',
                    text: `Invoice for ${data.billToName || 'Customer'}`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.log('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="min-h-screen bg-[#f8fafc] py-8 px-4 font-sans text-[#304250]">

            {/* TOP BAR - FIXED: Aligned Center to match Template Selector length */}
            <div className="max-w-[210mm] mx-auto mb-4 flex justify-center items-center bg-transparent px-1">
                <div className="flex gap-2 justify-center items-center w-full">

                    {/* View Controls */}
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex justify-center items-center gap-2 border px-4 h-10 rounded-full text-[13px] font-bold transition-all shadow-sm active:scale-95 bg-white border-[#304250]/10 text-[#304250] hover:bg-gray-50 whitespace-nowrap"
                    >
                        {isPreview ? <><Edit3 size={14} /> Edit Mode</> : <><Eye size={14} /> Preview</>}
                    </button>

                    <button
                        onClick={() => update('showAdvance', !data.showAdvance)}
                        className="flex justify-center items-center gap-2 border px-4 h-10 rounded-full text-[13px] font-bold transition-all shadow-sm active:scale-95 bg-white border-[#304250]/10 text-[#304250] hover:bg-gray-50 whitespace-nowrap"
                    >
                        {data.showAdvance ? 'Hide Advance' : 'Show Advance'}
                    </button>

                    <button
                        onClick={() => update('showShippingAddress', !data.showShippingAddress)}
                        className="flex justify-center items-center gap-2 border px-4 h-10 rounded-full text-[13px] font-bold transition-all shadow-sm active:scale-95 bg-white border-[#304250]/10 text-[#304250] hover:bg-gray-50 whitespace-nowrap"
                    >
                        {data.showShippingAddress ? 'Hide ShipTo' : 'Show ShipTo'}
                    </button>

                    <div className="w-px h-6 bg-[#304250]/10 mx-1" />

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="bg-[#20A46B] text-white px-4 h-10 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-[#20A46B]/90 shadow-md disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                    >
                        {isDownloading && downloadFormat === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                    </button>

                    <button
                        onClick={handleDownloadPNG}
                        disabled={isDownloading}
                        className="bg-[#20A46B] text-white px-4 h-10 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-[#20A46B]/90 shadow-md disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                    >
                        {isDownloading && downloadFormat === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />} PNG
                    </button>

                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bg-[#EEBE1C] text-[#304250] px-4 h-10 rounded-full text-[13px] font-extrabold flex items-center gap-2 hover:bg-[#d9ab18] shadow-md disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                    >
                        {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Share
                    </button>

                    <button onClick={handlePrint} className="bg-[#304250] text-white px-4 h-10 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-[#304250]/90 shadow-md transition-all active:scale-95 whitespace-nowrap">
                        <Printer size={14} /> Print
                    </button>
                </div>
            </div>

            {/* TEMPLATE SELECTOR RIBBON */}
            {!isPreview && (
                <div className="max-w-[210mm] mx-auto mb-6 bg-white p-3 rounded-2xl shadow-sm border border-[#304250]/10 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <div className="flex gap-3">
                        {[
                            { id: 1, name: 'Minimal' }, { id: 2, name: 'Corporate' }, { id: 3, name: 'Modern' },
                            { id: 4, name: 'Elegant' }, { id: 5, name: 'Tech' }, { id: 6, name: 'Compact' }, { id: 7, name: 'Simple' },
                            { id: 8, name: 'Classic' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`shrink-0 flex flex-col items-center justify-center gap-2 min-w-[84px] p-2.5 rounded-xl transition-all ${selectedTemplate === t.id ? 'bg-[#20A46B]/5 border-2 border-[#20A46B]' : 'hover:bg-gray-50 border-2 border-transparent'}`}
                            >
                                <div className={`w-full h-10 rounded-lg border ${selectedTemplate === t.id ? 'bg-[#20A46B]/10 border-[#20A46B]/30' : 'bg-gray-100 border-[#304250]/10'}`}></div>
                                <span className={`text-[10px] font-extrabold tracking-wider uppercase ${selectedTemplate === t.id ? 'text-[#20A46B]' : 'text-[#304250]/50'}`}>{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* CANVAS (A4) */}
            <div className="w-full overflow-x-auto pb-8 no-scrollbar whitespace-nowrap">
                <div className={`min-w-[210mm] max-w-[210mm] mx-auto bg-white shadow-[0_20px_60px_rgba(48,66,80,0.08)] min-h-[297mm] rounded-md overflow-hidden relative transition-all duration-300 ${isPreview ? 'scale-105 my-8' : ''}`}>
                    <div ref={printRef} className="h-full">
                        <ActiveTemplate
                            data={data}
                            update={update}
                            handleUploads={handleUploads}
                            calculations={calculations}
                            isPreview={isPreview}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}