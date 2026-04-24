import React, { useState, useRef, useEffect } from 'react';
import { ImageCompressorLogicReturn, CSS, RESIZE_MODES } from '../useImageCompressorLogic';
import {
    UploadCloud, Download, Settings2, Trash2,
    FileArchive, ArrowRight, Loader2, Plus, Image as ImageIcon,
    CheckCircle2, ChevronDown
} from 'lucide-react';

export default function DesktopUI({ logic }: { logic: ImageCompressorLogicReturn }) {
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
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFormatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <div className="bg-[#f8fafc] font-sans selection:bg-[#20A46B]/20 selection:text-[#20A46B] pb-10 min-h-screen">
            <style>{CSS}</style>

            <div className="max-w-[1200px] mx-auto w-full">
                {/* Main Application Container */}
                <div className="flex flex-row bg-white rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 overflow-hidden min-h-[500px]">

                    {/* ────────────────────────────────────────────────────────
                        LEFT PANE — WORKSPACE (DROPZONE / FILE LIST)
                    ──────────────────────────────────────────────────────── */}
                    <div className="flex-1 flex flex-col relative bg-white">

                        {/* Empty State Dropzone */}
                        {images.length === 0 && (
                            <div
                                {...getRootProps()}
                                className={[
                                    'absolute inset-0 m-6 rounded-[24px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer',
                                    isDragActive
                                        ? 'border-[#20A46B] bg-[#20A46B]/5 scale-[0.99] shadow-inner'
                                        : 'border-[#304250]/20 bg-gray-50/50 hover:bg-gray-50 hover:border-[#20A46B]/50'
                                ].join(' ')}
                            >
                                <input {...getInputProps()} />
                                <div className="w-16 h-16 mb-5 rounded-full bg-white shadow-sm border border-[#304250]/10 flex items-center justify-center">
                                    <UploadCloud size={26} className={isDragActive ? 'text-[#20A46B]' : 'text-[#304250]/40'} />
                                </div>
                                <h3 className="text-lg font-extrabold text-[#304250] tracking-tight mb-2">
                                    {isDragActive ? 'Drop images to compress' : 'Click or drag images here'}
                                </h3>
                                <p className="text-[13px] text-[#304250]/60 font-medium">Supports JPG, PNG, WebP and AVIF</p>
                            </div>
                        )}

                        {/* Filled State File List */}
                        {images.length > 0 && (
                            <div className="flex flex-col h-[500px]">
                                {/* Workspace Header */}
                                <div className="px-6 py-4 flex items-center justify-between border-b border-[#304250]/10 shrink-0 bg-gray-50/30">
                                    <h2 className="text-sm font-extrabold text-[#304250] flex items-center gap-2 tracking-wide uppercase">
                                        <ImageIcon size={16} className="text-[#304250]/50" />
                                        Files ({images.length})
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/jpeg, image/png, image/webp, image/avif"
                                                className="hidden"
                                                id="add-more-files-desktop"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        onDrop(Array.from(e.target.files));
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <label htmlFor="add-more-files-desktop" className="cursor-pointer text-[13px] font-bold text-[#304250]/60 hover:text-[#20A46B] px-3 py-2 rounded-lg hover:bg-[#20A46B]/5 transition-colors flex items-center gap-1.5">
                                                <Plus size={16} /> Add more
                                            </label>
                                        </div>
                                        <div className="w-px h-4 bg-[#304250]/10" />
                                        <button
                                            onClick={() => setImages([])}
                                            className="text-[13px] font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {/* List Content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="group relative bg-white border border-[#304250]/10 rounded-xl p-3 flex items-center gap-4 hover:shadow-md hover:border-[#304250]/30 transition-all"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-[#304250]/5 relative">
                                                <img src={img.preview} className="w-full h-full object-cover" alt="" />
                                                {img.status === 'processing' && (
                                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
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
                                                <p className="text-[13px] font-bold text-[#304250] truncate mb-1">
                                                    {img.originalFile.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-[12px]">
                                                    {img.status === 'done' && img.compressedSize !== undefined ? (
                                                        <>
                                                            <span className="text-[#304250]/40 font-medium line-through decoration-[#304250]/30">{formatBytes(img.originalSize)}</span>
                                                            <ArrowRight size={10} className="text-[#304250]/30" />
                                                            <span className="font-extrabold text-[#20A46B]">{formatBytes(img.compressedSize)}</span>
                                                            <span className="text-[10px] font-bold text-[#20A46B] bg-[#20A46B]/10 px-1.5 py-0.5 rounded-md ml-1">
                                                                -{Math.round(((img.originalSize - img.compressedSize) / img.originalSize) * 100)}%
                                                            </span>
                                                        </>
                                                    ) : img.status === 'processing' ? (
                                                        <span className="text-[#20A46B] font-bold">Compressing...</span>
                                                    ) : img.status === 'error' ? (
                                                        <span className="text-red-500 font-bold">Compression Failed</span>
                                                    ) : (
                                                        <span className="text-[#304250]/60 font-medium">{formatBytes(img.originalSize)}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="shrink-0 flex items-center gap-2 pl-2">
                                                {img.status === 'done' ? (
                                                    <button
                                                        onClick={() => downloadSingle(img)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#20A46B]/10 text-[#20A46B] hover:bg-[#20A46B]/20 transition-colors"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                ) : img.status !== 'processing' && (
                                                    <button
                                                        onClick={() => setImages(images.filter(i => i.id !== img.id))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#304250]/40 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Results Footer for Desktop */}
                                {hasDone && (
                                    <div className="flex px-6 py-4 border-t border-[#304250]/10 bg-[#20A46B]/5 flex-row items-center justify-between shrink-0">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[11px] text-[#304250]/60 font-extrabold uppercase tracking-wider">Total Saved</span>
                                            <span className="text-sm font-black text-[#20A46B]">{formatBytes(totalSaved)} ({savingsPercent}%)</span>
                                        </div>
                                        <button
                                            onClick={downloadAllZip}
                                            className="px-5 py-2.5 rounded-xl bg-[#304250] text-white text-[13px] font-bold hover:bg-[#304250]/90 transition-all shadow-[0_4px_14px_rgba(48,66,80,0.3)] flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <FileArchive size={14} />
                                            Download All
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ────────────────────────────────────────────────────────
                        RIGHT PANE — SETTINGS
                    ──────────────────────────────────────────────────────── */}
                    <div className="w-[320px] xl:w-[360px] border-l border-[#304250]/10 bg-gray-50/50 flex flex-col shrink-0">
                        <div className="p-6 md:p-8 flex flex-col h-[500px]">

                            <div className="flex items-center gap-2 mb-8">
                                <Settings2 size={18} className="text-[#304250]" />
                                <h3 className="text-[15px] font-extrabold tracking-tight text-[#304250] uppercase">Settings</h3>
                            </div>

                            <div className="space-y-6 flex-1 relative">

                                {/* Quality */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-[11px] font-extrabold tracking-wider uppercase text-[#304250]/60">Quality</label>
                                        <span className="text-[14px] font-black text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded-md">{settings.quality}%</span>
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

                                {/* Resize Preset */}
                                <div>
                                    <label className="text-[11px] font-extrabold tracking-wider uppercase text-[#304250]/60 mb-3 block">Resize Output</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {RESIZE_MODES.map(mode => (
                                            <button
                                                key={mode.key}
                                                onClick={() => setSettings({ ...settings, resizeMode: mode.key })}
                                                className={[
                                                    'px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-bold transition-all text-center border shrink-0',
                                                    settings.resizeMode === mode.key
                                                        ? 'bg-[#304250] text-white border-[#304250] shadow-md'
                                                        : 'bg-white text-[#304250]/70 border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50'
                                                ].join(' ')}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Size Fields */}
                                    {settings.resizeMode === 'custom' && (
                                        <div className="flex items-center gap-2 mt-3 animate-in fade-in zoom-in-95">
                                            <input
                                                type="number" placeholder="W (px)"
                                                value={settings.width} onChange={(e) => setSettings({ ...settings, width: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-[#304250]/10 rounded-xl text-sm text-[#304250] font-bold text-center outline-none focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B] transition-all shadow-sm"
                                            />
                                            <span className="text-[#304250]/40 text-xs font-bold">×</span>
                                            <input
                                                type="number" placeholder="H (px)"
                                                value={settings.height} onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-[#304250]/10 rounded-xl text-sm text-[#304250] font-bold text-center outline-none focus:border-[#20A46B] focus:ring-1 focus:ring-[#20A46B] transition-all shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Format Settings (CUSTOM DROPDOWN FIXED) */}
                                <div className="relative z-20" ref={dropdownRef}>
                                    <label className="text-[11px] font-extrabold tracking-wider uppercase text-[#304250]/60 mb-3 block">Format</label>
                                    <button
                                        onClick={() => setIsFormatOpen(!isFormatOpen)}
                                        className="w-full bg-white border border-[#304250]/10 text-[#304250] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-between gap-2 shadow-sm hover:bg-gray-50 transition outline-none focus:ring-2 ring-[#20A46B]/20"
                                    >
                                        <span>
                                            {FORMAT_OPTIONS.find(opt => opt.val === settings.format)?.label || 'Keep Original Format'}
                                        </span>
                                        <ChevronDown size={16} className={`text-[#304250]/50 transition-transform duration-200 ${isFormatOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isFormatOpen && (
                                        /* Dropdown ab neechay ki bajaye OOPAR (bottom-full) khulega taake cut na ho! */
                                        <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#304250]/10 rounded-xl shadow-[0_10px_40px_rgba(48,66,80,0.08)] overflow-hidden py-1 origin-bottom animate-in fade-in slide-in-from-bottom-2">
                                            {FORMAT_OPTIONS.map(opt => (
                                                <div
                                                    key={opt.val}
                                                    onClick={() => {
                                                        setSettings({ ...settings, format: opt.val });
                                                        setIsFormatOpen(false);
                                                    }}
                                                    className={`px-4 py-3 text-sm font-bold cursor-pointer transition mx-1 rounded-lg
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

                            {/* Action Button at Bottom */}
                            <div className="mt-6 pt-6 border-t border-[#304250]/10 shrink-0 relative z-10">
                                <button
                                    onClick={processImages}
                                    disabled={!hasPending || isCompressing}
                                    className={[
                                        'w-full py-3.5 min-h-[48px] rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 overflow-hidden relative',
                                        hasPending && !isCompressing
                                            ? 'bg-[#20A46B] text-white hover:bg-[#20A46B]/90 shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98]'
                                            : 'bg-gray-200 text-[#304250]/40 cursor-not-allowed shadow-none'
                                    ].join(' ')}
                                >
                                    {isCompressing ? (
                                        <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <>Compress Images</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}