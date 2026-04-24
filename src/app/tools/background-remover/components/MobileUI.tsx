import React, { useState, useRef, useEffect } from 'react';
import { BackgroundRemoverLogicReturn, SOLID_COLORS, GRADIENT_PRESETS, STUDIO_TEMPLATES, CSS, makeGradientCSS } from '../useBackgroundRemoverLogic';
import {
    UploadCloud, Download, Loader2, RotateCcw, Sparkles,
    Image as ImageIcon, SlidersHorizontal, X, Check, Palette, LayoutGrid,
    Plus, Minus, RotateCw, Circle, ArrowRight, Trash2, ChevronDown
} from 'lucide-react';

export default function MobileUI({ logic }: { logic: BackgroundRemoverLogicReturn }) {
    const {
        state, setState,
        originalImage, setOriginalImage, processedImage, setProcessedImage, editedImage, setEditedImage, displayImage,
        error, setError, fileName,
        editTab, setEditTab,
        selectedBg, setSelectedBg,
        customColor, setCustomColor,
        applyingBg,
        gradStops, gradAngle, setGradAngle, gradType, setGradType,
        activeStopId, setActiveStopId, activeStop,
        canvasRef,
        applyBackground, applyPresetGradient, applyCustomGradient, applyTemplate,
        addStop, removeStop, updateStop,
        reset, download,
        getRootProps, getInputProps, isDragActive
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

    // 👇 100% FOOLPROOF TYPE FIX FOR TYPESCRIPT
    // Yeh line ensure karegi ke currentColor hamesha ek "string" hi ho, kabhi null na ho.
    const currentColor: string = typeof customColor === 'string' ? customColor : '#ffffff';

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#304250] pb-[100px]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <style>{CSS}</style>
            <canvas ref={canvasRef} className="hidden" />

            {/* Main Content Area */}
            <main className="flex-1 space-y-4 pt-4">

                {/* ═══════════════ STATE 1: IDLE ═══════════════ */}
                {state === 'idle' && (
                    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
                        <div
                            {...getRootProps()}
                            className={[
                                'w-full rounded-[32px] border-2 border-dashed p-8 text-center transition-all',
                                isDragActive ? 'border-[#20A46B] bg-[#20A46B]/5' : 'border-[#304250]/20 bg-white shadow-[0_8px_30px_rgba(48,66,80,0.04)]'
                            ].join(' ')}
                        >
                            <input {...getInputProps()} accept="image/jpeg, image/png, image/webp, image/avif" />
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#20A46B]/10 text-[#20A46B]">
                                <UploadCloud size={32} />
                            </div>
                            <h2 className="text-lg font-extrabold text-[#304250] mb-2">Upload Photo</h2>
                            <p className="text-sm text-[#304250]/60 mb-6 font-medium">Tap to select from library</p>
                            <button type="button" className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#20A46B] text-white font-bold shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-transform active:scale-95">
                                <Plus size={20} /> Select Images
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 w-full text-center flex items-center justify-center gap-2">
                                <X size={14} /> {error}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════ STATE 2: PROCESSING ═══════════════ */}
                {state === 'processing' && originalImage && (
                    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="relative w-64 h-64 rounded-[32px] overflow-hidden border border-[#304250]/10 bg-white shadow-[0_8px_30px_rgba(48,66,80,0.08)]">
                            <img src={originalImage} alt="Uploaded" className="w-full h-full object-contain opacity-50 grayscale" />
                            <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#20A46B] to-transparent scan-line z-10" />
                        </div>
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <Loader2 size={28} className="text-[#20A46B] animate-spin" />
                            <h3 className="text-lg font-extrabold text-[#304250]">Removing Background</h3>
                            <p className="text-sm text-[#304250]/60 font-medium text-center">Refining details & edges...</p>
                        </div>
                    </div>
                )}

                {/* ═══════════════ STATE 3: SUCCESS ═══════════════ */}
                {state === 'success' && originalImage && processedImage && (
                    <div className="flex flex-col gap-4 p-4">
                        <div className="relative w-full aspect-square max-h-[300px] rounded-3xl overflow-hidden flex items-center justify-center bg-gray-50 bg-checker border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)]">
                            <img src={displayImage} alt="Result" className="max-w-full max-h-full object-contain drop-shadow-xl" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setState('editing')} className="flex flex-col items-center justify-center gap-2 bg-white border border-[#304250]/10 p-4 rounded-2xl shadow-sm text-[#304250] font-bold hover:bg-gray-50 transition-colors">
                                <Palette size={24} className="text-[#20A46B]" />
                                Add Studio Canvas
                            </button>
                            <button onClick={reset} className="flex flex-col items-center justify-center gap-2 bg-white border border-[#304250]/10 p-4 rounded-2xl shadow-sm text-[#304250] font-bold hover:bg-gray-50 transition-colors">
                                <RotateCcw size={24} className="text-[#304250]/40" />
                                Start Fresh
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ STATE 4: EDITING ═══════════════ */}
                {state === 'editing' && processedImage && (
                    <div className="flex flex-col space-y-2">

                        {/* Preview Area */}
                        <div className="px-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-extrabold text-[#304250]">Edit Background</h3>
                                <button onClick={() => setState('success')} className="text-xs font-bold text-[#304250]/60 bg-[#304250]/5 hover:bg-[#304250]/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                    <X size={14} /> Cancel
                                </button>
                            </div>

                            <div className={[
                                'relative w-full aspect-square max-h-[300px] rounded-3xl overflow-hidden flex items-center justify-center transition-colors duration-300 border border-[#304250]/10 shadow-sm',
                                !editedImage ? 'bg-checker bg-gray-50' : 'bg-white'
                            ].join(' ')}>
                                <img src={displayImage} alt="Preview" className="max-w-[80vw] max-h-full object-contain drop-shadow-2xl transition-transform" />
                                {applyingBg && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-[#304250]/10 flex-shrink-0">
                                        <Loader2 size={14} className="text-[#20A46B] animate-spin" />
                                        <span className="text-[10px] font-bold text-[#304250]/60 uppercase">Rendering</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Editor Tabs */}
                            <div className="flex bg-gray-100/80 p-1.5 rounded-xl">
                                {([
                                    { key: 'colors' as const, label: 'Color', Icon: Palette },
                                    { key: 'gradients' as const, label: 'Gradient', Icon: Circle },
                                    { key: 'templates' as const, label: 'Studio', Icon: LayoutGrid },
                                ]).map(t => (
                                    <button key={t.key} onClick={() => setEditTab(t.key)}
                                        className={[
                                            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-[11px] font-bold transition-all shadow-sm',
                                            editTab === t.key ? 'bg-white text-[#20A46B] ring-1 ring-[#20A46B]/20 shadow-md' : 'text-[#304250]/60 hover:bg-white/50',
                                        ].join(' ')}>
                                        <t.Icon size={18} className={editTab === t.key ? "text-[#20A46B]" : "text-[#304250]/40"} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* ═══ TAB 1: COLORS ═══ */}
                            {editTab === 'colors' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {SOLID_COLORS.map(c => (
                                            <button key={c} onClick={() => applyBackground(c)} title={c}
                                                className={[
                                                    'w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-[3px] transition-all',
                                                    selectedBg === c ? 'border-[#20A46B] shadow-md scale-110' : 'border-white shadow-sm ring-1 ring-[#304250]/10',
                                                ].join(' ')}
                                                style={{ backgroundColor: c }} />
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-[#304250]/10 space-y-3">
                                        <span className="text-[11px] font-extrabold text-[#304250]/40 uppercase tracking-wider block">Custom Color</span>
                                        <div className="flex gap-3">
                                            {/* 👇 Using the strict string variable */}
                                            <input type="color" value={currentColor} onChange={e => setCustomColor(e.target.value)}
                                                className="w-14 h-14 rounded-xl border border-[#304250]/10 cursor-pointer p-0" />
                                            <button onClick={() => applyBackground(currentColor)} className="flex-1 bg-[#20A46B] text-white rounded-xl font-bold shadow-[0_4px_14px_rgba(32,164,107,0.3)]">
                                                Apply Color
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#304250]/10">
                                        <button onClick={() => { setEditedImage(null); setSelectedBg(null); }} className="w-full py-4 bg-white border border-[#304250]/20 text-[#304250] rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50">
                                            <X size={18} /> Make Transparent
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ═══ TAB 2: GRADIENTS ═══ */}
                            {editTab === 'gradients' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {/* Presets Grid */}
                                    <div className="grid grid-cols-4 gap-3">
                                        {GRADIENT_PRESETS.map(g => (
                                            <button key={g.label} onClick={() => applyPresetGradient(g.from, g.to)}
                                                className={[
                                                    'w-14 h-14 mx-auto rounded-2xl border-[3px] transition-all',
                                                    selectedBg === `${g.from}-${g.to}` ? 'border-[#20A46B] shadow-md scale-110' : 'border-white shadow-sm ring-1 ring-[#304250]/10',
                                                ].join(' ')}
                                                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                                            />
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-[#304250]/10 space-y-4">
                                        <span className="text-[11px] font-extrabold text-[#304250]/40 uppercase tracking-wider block">Advanced Gradient</span>

                                        <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-[#304250]/10 shadow-inner w-fit mx-auto mb-2">
                                            <button onClick={() => setGradType('linear')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${gradType === 'linear' ? 'bg-white text-[#20A46B] shadow-sm' : 'text-[#304250]/60 hover:text-[#304250]'}`}>
                                                Linear
                                            </button>
                                            <button onClick={() => setGradType('radial')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${gradType === 'radial' ? 'bg-white text-[#20A46B] shadow-sm' : 'text-[#304250]/60 hover:text-[#304250]'}`}>
                                                Radial
                                            </button>
                                        </div>

                                        <div className="gradient-bar h-10 shadow-inner rounded-xl border border-[#304250]/10" style={{ background: makeGradientCSS(gradStops, gradAngle, gradType) }}>
                                            {gradStops.map(stop => (
                                                <div key={stop.id}
                                                    className={`gradient-stop-marker ${activeStopId === stop.id ? 'active !border-[#20A46B] !shadow-lg scale-110' : ''}`}
                                                    style={{ left: `${stop.position}%`, backgroundColor: stop.color, width: '16px', height: '48px', top: '-4px' }}
                                                    onClick={(e) => { e.stopPropagation(); setActiveStopId(stop.id); }}
                                                />
                                            ))}
                                        </div>

                                        {activeStop && (
                                            <div className="bg-white p-4 rounded-xl border border-[#304250]/10 shadow-sm space-y-4">
                                                <div className="flex items-center gap-3 border-b border-[#304250]/5 pb-4">
                                                    <input type="color" value={activeStop.color}
                                                        onChange={e => updateStop(activeStop.id, { color: e.target.value })}
                                                        className="w-12 h-12 rounded-lg p-0 border border-[#304250]/10" />
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-extrabold text-[#304250]/50 block mb-1 uppercase tracking-wide">Color HEX</span>
                                                        <input type="text" value={activeStop.color}
                                                            onChange={e => updateStop(activeStop.id, { color: e.target.value })}
                                                            className="w-full bg-gray-50 border border-[#304250]/10 rounded-md px-3 py-1.5 text-sm font-mono font-bold text-[#304250] uppercase outline-none focus:border-[#20A46B]" maxLength={7} />
                                                    </div>
                                                    <button onClick={() => { if (!activeStopId) return; removeStop(activeStopId); }} disabled={gradStops.length <= 2}
                                                        className="p-3 rounded-lg border border-[#304250]/10 text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors shadow-sm">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-bold text-[#304250]/70">Position</span>
                                                        <span className="text-xs font-bold font-mono text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded">{activeStop.position}%</span>
                                                    </div>
                                                    <input type="range" min={0} max={100} value={activeStop.position}
                                                        onChange={e => updateStop(activeStop.id, { position: parseInt(e.target.value) })}
                                                        className="green-slider w-full h-2" />
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={applyCustomGradient} disabled={applyingBg}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#20A46B] text-white font-bold transition-colors disabled:opacity-50 shadow-[0_4px_14px_rgba(32,164,107,0.3)]">
                                            {applyingBg && <Loader2 size={18} className="animate-spin" />}
                                            Apply Gradient
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ═══ TAB 3: STUDIO TEMPLATES ═══ */}
                            {editTab === 'templates' && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4">
                                    {STUDIO_TEMPLATES.map(t => (
                                        <button key={t.id} onClick={() => applyTemplate(t.id)}
                                            className={[
                                                'flex flex-col text-left rounded-xl border-[2px] transition-all overflow-hidden bg-white',
                                                selectedBg === t.id ? 'border-[#20A46B] shadow-md ring-2 ring-[#20A46B]/20' : 'border-[#304250]/10 hover:border-[#304250]/30',
                                            ].join(' ')}>
                                            <div className="w-full h-24 flex items-center justify-center text-3xl sm:text-4xl relative" style={{ background: t.gradient }}>
                                                {t.icon}
                                                {applyingBg && selectedBg === t.id && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                                        <Loader2 size={24} className="text-[#20A46B] animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 w-full border-t border-[#304250]/5">
                                                <span className="text-sm font-bold text-[#304250] block mb-0.5">{t.label}</span>
                                                <span className="text-[10px] sm:text-[11px] font-medium text-[#304250]/50 line-clamp-1">{t.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Floating Action Button (Only on Success/Editing) */}
            {(state === 'success' || state === 'editing') && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#304250]/10 z-30 pb-safe shadow-[0_-10px_40px_rgba(48,66,80,0.05)]">
                    <button onClick={download} className="w-full flex items-center justify-center gap-2 min-h-[56px] bg-[#20A46B] hover:bg-[#20A46B]/90 text-white rounded-[16px] font-bold text-lg shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-[0.98] transition-transform">
                        <Download size={24} /> Download Ultra HD
                    </button>
                </div>
            )}

            <style jsx global>{`
                .green-slider::-webkit-slider-thumb { background: #20A46B; }
                .green-slider::-moz-range-thumb { background: #20A46B; }
            `}</style>
        </div>
    );
}