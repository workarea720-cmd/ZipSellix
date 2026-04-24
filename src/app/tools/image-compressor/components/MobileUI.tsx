import React, { useState, useRef, useEffect } from 'react';
import { ImageCompressorLogicReturn, CSS, RESIZE_MODES } from '../useImageCompressorLogic';
import {
    UploadCloud, Download, Settings2, Trash2,
    FileArchive, ArrowRight, Loader2, Plus, Image as ImageIcon,
    CheckCircle2, ChevronDown
} from 'lucide-react';

export default function MobileUI({ logic }: { logic: ImageCompressorLogicReturn }) {
    const {
        images, setImages,
        isCompressing,
        settings, setSettings,
        getRootProps, getInputProps, isDragActive, onDrop,
        processImages,
        downloadSingle, downloadAllZip,
        formatBytes,
        hasDone, hasPending, totalSaved, savingsPercent
    } = logic;

    // Custom Dropdown State for Format
    const [isFormatOpen, setIsFormatOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFormatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    // All Format Options
    const FORMAT_OPTIONS = [
        { val: 'original', label: 'Keep Original Format' },
        { val: 'jpeg', label: 'Convert to JPG' },
        { val: 'png', label: 'Convert to PNG' },
        { val: 'webp', label: 'Convert to WebP' },
        { val: 'avif', label: 'Convert to AVIF' }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-[100px] text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            <style>{CSS}</style>

            <main className="flex-1 space-y-4 p-4 pt-6">

                {/* 1. Main Action / Dropzone */}
                <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 overflow-hidden">
                    {images.length === 0 ? (
                        <div
                            {...getRootProps()}
                            className={[
                                'w-full p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[250px]',
                                isDragActive ? 'bg-[#20A46B]/5 border-2 border-dashed border-[#20A46B]' : 'bg-gray-50/50 hover:bg-gray-50 border-2 border-dashed border-[#304250]/20'
                            ].join(' ')}
                        >
                            {/* Added AVIF support to input */}
                            <input {...getInputProps()} accept="image/jpeg, image/png, image/webp, image/avif" />
                            <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm border border-[#304250]/10 flex items-center justify-center">
                                <UploadCloud size={32} className={isDragActive ? 'text-[#20A46B]' : 'text-[#304250]/40'} />
                            </div>
                            <h2 className="text-lg font-extrabold tracking-tight mb-2 text-[#304250]">Upload Photos</h2>
                            <p className="text-sm text-[#304250]/60 font-medium mb-6">Max 5MB per image</p>
                            <button type="button" className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-transform active:scale-95">
                                <Plus size={20} /> Select Images
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Images Header */}
                            <div className="px-4 py-4 border-b border-[#304250]/10 flex items-center justify-between bg-gray-50/30">
                                <h2 className="text-sm font-extrabold flex items-center gap-2 text-[#304250] uppercase tracking-wide">
                                    <ImageIcon size={18} className="text-[#304250]/50" />
                                    {images.length} Image{images.length !== 1 && 's'}
                                </h2>
                                <div className="flex gap-2">
                                    <div>
                                        <input
                                            type="file" multiple accept="image/jpeg, image/png, image/webp, image/avif"
                                            className="hidden" id="add-more-mobile"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    onDrop(Array.from(e.target.files));
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <label htmlFor="add-more-mobile" className="cursor-pointer text-xs font-bold text-[#304250]/60 hover:text-[#20A46B] bg-transparent px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all hover:bg-[#20A46B]/5">
                                            <Plus size={14} /> Add
                                        </label>
                                    </div>
                                    <div className="w-px h-6 bg-[#304250]/10 self-center" />
                                    <button onClick={() => setImages([])} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Image List */}
                            <div className="divide-y divide-[#304250]/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {images.map((img) => (
                                    <div key={img.id} className="p-3 flex items-center gap-3 bg-white hover:bg-gray-50/50 transition-colors">
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-[#304250]/10 relative">
                                            <img src={img.preview} className="w-full h-full object-cover" alt="" />
                                            {img.status === 'processing' && (
                                                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Loader2 size={16} className="text-[#20A46B] animate-spin" />
                                                </div>
                                            )}
                                            {img.status === 'done' && (
                                                <div className="absolute inset-0 bg-[#20A46B]/20 flex items-center justify-center">
                                                    <CheckCircle2 size={18} className="text-[#20A46B] bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[#304250] truncate mb-1">{img.originalFile.name}</p>
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                                {img.status === 'done' && img.compressedSize !== undefined ? (
                                                    <>
                                                        <span className="text-[#304250]/40 line-through decoration-[#304250]/30">{formatBytes(img.originalSize)}</span>
                                                        <ArrowRight size={10} className="text-[#304250]/30" />
                                                        <span className="text-[#20A46B] font-extrabold">{formatBytes(img.compressedSize)}</span>
                                                        <span className="text-[#20A46B] font-bold bg-[#20A46B]/10 px-1.5 py-0.5 rounded-md ml-1">
                                                            -{Math.round(((img.originalSize - img.compressedSize) / img.originalSize) * 100)}%
                                                        </span>
                                                    </>
                                                ) : img.status === 'processing' ? (
                                                    <span className="text-[#20A46B] font-bold">Processing...</span>
                                                ) : img.status === 'error' ? (
                                                    <span className="text-red-500 font-bold">Failed</span>
                                                ) : (
                                                    <span className="text-[#304250]/60 font-medium">{formatBytes(img.originalSize)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="shrink-0 flex items-center gap-2 pl-1">
                                            {img.status === 'done' ? (
                                                <button onClick={() => downloadSingle(img)} className="w-8 h-8 rounded-full bg-[#20A46B]/10 text-[#20A46B] flex items-center justify-center active:scale-95 transition-colors">
                                                    <Download size={14} />
                                                </button>
                                            ) : img.status !== 'processing' ? (
                                                <button onClick={() => setImages(images.filter(i => i.id !== img.id))} className="w-8 h-8 rounded-full hover:bg-red-50 text-[#304250]/40 hover:text-red-500 flex items-center justify-center active:scale-95 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Settings */}
                <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 p-5 space-y-6">
                    <div className="flex items-center gap-2 text-[#304250]">
                        <Settings2 size={18} className="text-[#304250]" />
                        <h3 className="font-extrabold uppercase tracking-tight text-[15px]">Settings</h3>
                    </div>

                    {/* Quality */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider">Quality</label>
                            <span className="text-sm font-black text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded-md">{settings.quality}%</span>
                        </div>
                        <input
                            type="range" min="10" max="100"
                            value={settings.quality}
                            onChange={(e) => setSettings({ ...settings, quality: Number(e.target.value) })}
                            className="slider-premium w-full"
                        />
                        <style jsx>{`
                            .slider-premium {
                                -webkit-appearance: none;
                                width: 100%;
                                height: 6px;
                                border-radius: 4px;
                                background: #e2e8f0;
                                outline: none;
                            }
                            .slider-premium::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                appearance: none;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: #20A46B;
                                cursor: pointer;
                                box-shadow: 0 2px 6px rgba(32, 164, 107, 0.4);
                                border: 2px solid white;
                            }
                            .slider-premium::-moz-range-thumb {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: #20A46B;
                                cursor: pointer;
                                box-shadow: 0 2px 6px rgba(32, 164, 107, 0.4);
                                border: 2px solid white;
                            }
                        `}</style>
                    </div>

                    {/* Resize */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider block mb-3">Resize Output</label>
                        <div className="grid grid-cols-2 gap-2">
                            {RESIZE_MODES.map(mode => (
                                <button
                                    key={mode.key}
                                    onClick={() => setSettings({ ...settings, resizeMode: mode.key })}
                                    className={[
                                        'px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-bold transition-all text-center border shrink-0',
                                        settings.resizeMode === mode.key ? 'bg-[#304250] border-[#304250] text-white shadow-md' : 'bg-white border-[#304250]/10 text-[#304250]/70 hover:bg-gray-50 hover:border-[#304250]/30'
                                    ].join(' ')}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        {settings.resizeMode === 'custom' && (
                            <div className="flex items-center gap-2 mt-2 animate-in fade-in zoom-in-95">
                                <input
                                    type="number" placeholder="Width"
                                    value={settings.width} onChange={(e) => setSettings({ ...settings, width: e.target.value })}
                                    className="w-full px-3 py-3 bg-white border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] text-center focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B] outline-none transition-colors shadow-sm"
                                />
                                <span className="text-[#304250]/40 font-bold text-xs">×</span>
                                <input
                                    type="number" placeholder="Height"
                                    value={settings.height} onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                    className="w-full px-3 py-3 bg-white border border-[#304250]/10 rounded-xl text-sm font-bold text-[#304250] text-center focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B] outline-none transition-colors shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Format (CUSTOM DROPDOWN FIXED FOR MOBILE) */}
                    <div className="space-y-3 relative z-20" ref={dropdownRef}>
                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider block">Format</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsFormatOpen(!isFormatOpen)}
                                className="w-full bg-white border border-[#304250]/10 text-[#304250] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-between gap-2 shadow-sm hover:bg-gray-50 transition outline-none focus:ring-2 ring-[#20A46B]/20"
                            >
                                <span>
                                    {FORMAT_OPTIONS.find(opt => opt.val === settings.format)?.label || 'Keep Original Format'}
                                </span>
                                <ChevronDown size={18} className={`text-[#304250]/50 transition-transform duration-200 ${isFormatOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isFormatOpen && (
                                /* Mobile pe Dropdown oopar ki taraf khulega (bottom-full) */
                                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#304250]/10 rounded-xl shadow-[0_10px_40px_rgba(48,66,80,0.08)] overflow-hidden py-1 origin-bottom animate-in fade-in slide-in-from-bottom-2">
                                    {FORMAT_OPTIONS.map(opt => (
                                        <div
                                            key={opt.val}
                                            onClick={() => {
                                                setSettings({ ...settings, format: opt.val });
                                                setIsFormatOpen(false);
                                            }}
                                            className={`px-4 py-3.5 text-sm font-bold cursor-pointer transition mx-1 rounded-lg
                                                ${settings.format === opt.val
                                                    ? 'bg-[#20A46B]/10 text-[#20A46B]'
                                                    : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'}`}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section (only if done) */}
                {hasDone && (
                    <div className="bg-[#20A46B]/5 rounded-3xl border border-[#20A46B]/10 p-6 flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#20A46B]/10 rounded-full blur-[50px]" />
                        <span className="text-xs font-extrabold text-[#304250]/60 uppercase tracking-wider">Total Saved Space</span>
                        <span className="text-3xl font-black text-[#20A46B]">{formatBytes(totalSaved)}</span>
                        <span className="text-xs font-bold text-[#20A46B] bg-[#20A46B]/10 px-2 py-1 rounded-md">{savingsPercent}% Reduction</span>
                    </div>
                )}
            </main>

            {/* 3. Execution / Download Buttons Sticky Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#304250]/10 space-y-3 shadow-[0_-10px_40px_rgba(48,66,80,0.05)] z-30 pb-safe">
                {hasPending ? (
                    <button
                        onClick={processImages}
                        disabled={isCompressing}
                        className={[
                            'w-full flex items-center justify-center gap-2 min-h-[56px] rounded-[16px] font-bold text-lg active:scale-[0.98] transition-transform',
                            isCompressing ? 'bg-[#20A46B] text-white shadow-lg shadow-[#20A46B]/20' : 'bg-[#20A46B] text-white shadow-[0_4px_14px_rgba(32,164,107,0.3)] hover:bg-[#20A46B]/90'
                        ].join(' ')}
                    >
                        {isCompressing ? <><Loader2 size={24} className="animate-spin" /> Compressing...</> : <>Compress Now</>}
                    </button>
                ) : hasDone ? (
                    <div className="flex gap-3">
                        <button
                            onClick={downloadAllZip}
                            className="flex-1 flex items-center justify-center gap-2 min-h-[56px] rounded-[16px] font-bold text-base bg-[#304250] text-white shadow-[0_4px_14px_rgba(48,66,80,0.3)] active:scale-[0.98] transition-transform hover:bg-[#304250]/90"
                        >
                            <FileArchive size={20} /> Zip Download
                        </button>
                    </div>
                ) : (
                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 min-h-[56px] rounded-[16px] font-bold text-lg bg-gray-200 text-[#304250]/40 cursor-not-allowed"
                    >
                        Compress Now
                    </button>
                )}
            </div>
        </div>
    );
}