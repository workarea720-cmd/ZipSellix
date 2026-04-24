import React, { useRef } from 'react';
import { BackgroundRemoverLogicReturn, SOLID_COLORS, GRADIENT_PRESETS, STUDIO_TEMPLATES, CSS, makeGradientCSS } from '../useBackgroundRemoverLogic';
import {
    UploadCloud, Download, Loader2, RotateCcw,
    Image as ImageIcon, X, Check, Palette, LayoutGrid,
    Plus, RotateCw, Circle, Trash2, Blend
} from 'lucide-react';

export default function DesktopUI({ logic }: { logic: BackgroundRemoverLogicReturn }) {
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

    // Custom CSS for Checkerboard background (Transparency indicator)
    const checkerBgCSS = `
        .bg-checker {
            background-color: #f1f5f9;
            background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
                              linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
                              linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
            background-size: 16px 16px;
            background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
    `;

    return (
        <div className="bg-[#f8fafc] px-4 md:px-8 py-4 pb-10 min-h-screen font-sans text-[#304250] selection:bg-[#20A46B]/20 selection:text-[#20A46B]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <style>{CSS}</style>
            <style>{checkerBgCSS}</style>
            <canvas ref={canvasRef} className="hidden" />

            <div className="max-w-[1200px] mx-auto relative bg-white rounded-[32px] shadow-[0_8px_30px_rgba(48,66,80,0.04)] border border-[#304250]/10 overflow-hidden">

                {/* ═══════════════ STATE 1: IDLE ═══════════════ */}
                {state === 'idle' && (
                    <div className="px-12 py-16">
                        <div
                            {...getRootProps()}
                            className={[
                                'relative mx-auto max-w-2xl rounded-[32px] border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300',
                                isDragActive
                                    ? 'border-[#20A46B] bg-[#20A46B]/5 scale-[1.01] shadow-lg shadow-[#20A46B]/10'
                                    : 'border-[#304250]/20 bg-gray-50/50 hover:border-[#20A46B] hover:bg-[#20A46B]/5 hover:shadow-sm',
                            ].join(' ')}
                        >
                            <input {...getInputProps()} />
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#20A46B]/10 text-[#20A46B] shadow-inner border border-[#20A46B]/20">
                                <UploadCloud size={38} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#304250] mb-2">
                                {isDragActive ? 'Drop image here' : 'Drag & drop image here'}
                            </h2>
                            <p className="text-[#304250]/60 mb-8 font-medium">Best for product photos, portraits, and objects</p>

                            {/* Signature Green Primary Action Button */}
                            <button type="button" className="inline-flex justify-center items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#20A46B] hover:bg-[#20A46B]/90 text-white text-[15px] font-bold shadow-[0_4px_14px_rgba(32,164,107,0.3)] transition-all hover:-translate-y-0.5 active:scale-95">
                                <Plus size={18} /> Select Image
                            </button>
                        </div>
                        <p className="text-center text-[13px] font-bold text-[#304250]/40 mt-8 flex items-center justify-center gap-2 uppercase tracking-wide">
                            <span>Supports JPG, PNG, WEBP</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#304250]/20" />
                            <span>Max 5 MB</span>
                        </p>
                        {error && (
                            <div className="mx-auto max-w-xl mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-600 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                                <X size={16} /> {error}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════ STATE 2: PROCESSING ═══════════════ */}
                {state === 'processing' && originalImage && (
                    <div className="px-12 py-20">
                        <div className="mx-auto max-w-md text-center">
                            <div className="relative mx-auto w-80 h-80 rounded-[32px] overflow-hidden border border-[#304250]/10 bg-white shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] flex items-center justify-center p-3">
                                <img src={originalImage} alt="Uploaded" className="w-full h-full object-contain opacity-40 grayscale blur-[1px]" />
                                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#20A46B] to-transparent scan-line z-10 shadow-[0_0_15px_rgba(32,164,107,0.5)]" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-[#20A46B]/10 to-white/0 animate-pulse" />
                            </div>
                            <div className="mt-10 flex flex-col items-center gap-3">
                                <span className="p-3.5 bg-[#20A46B]/10 text-[#20A46B] rounded-full border border-[#20A46B]/20">
                                    <Loader2 size={24} className="animate-spin" />
                                </span>
                                <h3 className="text-lg font-extrabold text-[#304250] tracking-tight">Removing Background...</h3>
                                <p className="text-sm font-medium text-[#304250]/60">Detecting subject and refining edges</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════ STATE 3: SUCCESS ═══════════════ */}
                {state === 'success' && originalImage && processedImage && (
                    <div className="p-8 overflow-hidden">
                        <div className="grid grid-cols-5 gap-6">
                            {/* Original */}
                            <div className="col-span-2 rounded-2xl border border-[#304250]/10 overflow-hidden bg-gray-50/50 flex flex-col shadow-sm">
                                <div className="px-4 py-3 border-b border-[#304250]/10 bg-white flex items-center gap-2">
                                    <ImageIcon size={16} className="text-[#304250]/40" />
                                    <span className="text-[11px] font-extrabold text-[#304250]/70 uppercase tracking-wider">Original image</span>
                                    <span className="ml-auto text-[11px] font-bold text-[#304250]/40 truncate max-w-[150px]">{fileName}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
                                    <img src={originalImage} alt="Original" className="max-w-full max-h-[400px] object-contain rounded-lg drop-shadow-sm border border-[#304250]/10" />
                                </div>
                            </div>
                            {/* Result */}
                            <div className="col-span-3 rounded-2xl border border-[#304250]/10 overflow-hidden flex flex-col shadow-sm">
                                <div className="px-4 py-3 border-b border-[#304250]/10 bg-white flex items-center justify-end">
                                    <span className="bg-[#20A46B]/10 text-[#20A46B] px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border border-[#20A46B]/20 shadow-inner">Transparent PNG</span>
                                </div>
                                <div className="flex-1 bg-checker flex items-center justify-center p-6 min-h-[400px] relative">
                                    <img src={displayImage} alt="Result" className="max-w-full max-h-[500px] object-contain drop-shadow-2xl z-10 transition-transform duration-300" />
                                </div>
                            </div>
                        </div>
                        {/* Action bar */}
                        <div className="mt-8 flex items-center gap-3.5 bg-gray-50/50 p-4 rounded-2xl border border-[#304250]/10 shadow-inner">
                            <button onClick={download} className="inline-flex justify-center items-center gap-2 px-7 py-3 rounded-xl bg-[#20A46B] text-white text-[15px] font-bold hover:bg-[#20A46B]/90 transition-colors shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95">
                                <Download size={20} /> Download HD
                            </button>
                            <button onClick={() => setState('editing')} className="inline-flex justify-center items-center gap-2 px-7 py-3 rounded-xl border-2 border-[#304250]/20 text-[#304250] text-[15px] font-bold bg-white hover:border-[#20A46B] hover:text-[#20A46B] hover:bg-[#20A46B]/5 transition-colors shadow-sm active:scale-95">
                                <Palette size={20} className="text-[#20A46B]" /> Studio Canvas
                            </button>
                            <div className="w-px h-10 bg-[#304250]/10 mx-1" />
                            <button onClick={reset} className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-[#304250]/60 text-[15px] font-bold hover:text-red-600 hover:bg-red-50 transition-colors ml-auto active:scale-95">
                                <RotateCcw size={19} /> Upload Another
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ STATE 4: EDITING ═══════════════ */}
                {state === 'editing' && processedImage && (
                    <div className="p-8 pt-8">

                        <div className="grid grid-cols-12 gap-8 items-start">

                            {/* ── Left: Controls (Col 5) ── */}
                            <div className="col-span-5 space-y-6 pb-6">

                                {/* Tab bar */}
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-[#304250]/10 shadow-inner overflow-hidden">
                                    {([
                                        { key: 'colors' as const, label: 'Colors', Icon: Palette },
                                        { key: 'gradients' as const, label: 'Gradients', Icon: Circle },
                                        { key: 'templates' as const, label: 'Studio', Icon: LayoutGrid },
                                    ]).map(t => (
                                        <button key={t.key} onClick={() => setEditTab(t.key)}
                                            className={[
                                                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all',
                                                editTab === t.key
                                                    ? 'bg-white text-[#20A46B] shadow-sm ring-1 ring-[#20A46B]/20'
                                                    : 'text-[#304250]/60 hover:text-[#304250] hover:bg-white/50',
                                            ].join(' ')}>
                                            <t.Icon size={16} className={editTab === t.key ? 'text-[#20A46B]' : 'text-[#304250]/40'} />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* ═══ TAB 1: SOLID COLORS ═══ */}
                                {editTab === 'colors' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-white rounded-2xl border border-[#304250]/10 p-5 shadow-[0_4px_20px_rgba(48,66,80,0.03)]">
                                            <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-wider block mb-4">Preset Colors</span>
                                            <div className="flex flex-wrap gap-2.5">
                                                {SOLID_COLORS.map(c => (
                                                    <button key={c} onClick={() => applyBackground(c)} title={c}
                                                        className={[
                                                            'w-10 h-10 rounded-full border-[3px] transition-all hover:scale-110 active:scale-95',
                                                            selectedBg === c ? 'border-[#20A46B] shadow-md ring-4 ring-[#20A46B]/20' : 'border-white shadow-sm ring-1 ring-[#304250]/10',
                                                        ].join(' ')}
                                                        style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Select Color UI */}
                                        <div className="bg-white rounded-2xl border border-[#304250]/10 p-5 shadow-[0_4px_20px_rgba(48,66,80,0.03)] space-y-4">
                                            <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-wider block">Select Color</span>

                                            <div className="flex gap-3 items-center bg-gray-50 border border-[#304250]/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#20A46B]/20 focus-within:border-[#20A46B] transition-all">
                                                <div className="relative shrink-0">
                                                    <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
                                                        className="w-10 h-10 rounded-lg opacity-0 cursor-pointer absolute inset-0 z-10" />
                                                    <div style={{ backgroundColor: customColor }} className="w-10 h-10 rounded-lg border-2 border-white ring-1 ring-[#304250]/10 shadow-sm" />
                                                </div>
                                                <input type="text" value={customColor} onChange={e => setCustomColor(e.target.value)}
                                                    className="flex-1 bg-transparent px-2 py-2 text-[15px] font-mono font-bold text-[#304250] uppercase outline-none" maxLength={7} />
                                            </div>

                                            <button onClick={() => applyBackground(customColor)}
                                                className="w-full py-3.5 rounded-xl bg-[#20A46B] text-white font-bold hover:bg-[#20A46B]/90 transition-colors shadow-[0_4px_14px_rgba(32,164,107,0.3)] active:scale-95">
                                                Apply Color
                                            </button>
                                        </div>

                                        <button
                                            title="Make Transparent"
                                            onClick={() => { setEditedImage(null); setSelectedBg(null); }}
                                            className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-white border border-[#304250]/20 font-bold text-[13px] text-[#304250]/70 hover:text-[#304250] hover:bg-gray-50 transition-colors shadow-sm hover:shadow active:scale-95"
                                        >
                                            <Blend size={16} className="text-[#304250]/40" /> Make Transparent
                                        </button>
                                    </div>
                                )}

                                {/* ═══ TAB 2: GRADIENTS ═══ */}
                                {editTab === 'gradients' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-white rounded-2xl border border-[#304250]/10 p-5 shadow-[0_4px_20px_rgba(48,66,80,0.03)]">
                                            <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-wider block mb-4">Preset Gradients</span>
                                            <div className="flex flex-wrap gap-2.5">
                                                {GRADIENT_PRESETS.map(g => (
                                                    <button key={g.label} onClick={() => applyPresetGradient(g.from, g.to)}
                                                        title={g.label}
                                                        className={[
                                                            'w-12 h-12 rounded-xl border-[3px] transition-all hover:scale-110 active:scale-95',
                                                            selectedBg === `${g.from}-${g.to}` ? 'border-[#20A46B] shadow-md ring-4 ring-[#20A46B]/20' : 'border-white shadow-sm ring-1 ring-[#304250]/10',
                                                        ].join(' ')}
                                                        style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-[#304250]/10 p-5 shadow-[0_4px_20px_rgba(48,66,80,0.03)] space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-wider">Gradient Builder</span>
                                                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-[#304250]/10 shadow-inner">
                                                    <button onClick={() => setGradType('linear')}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${gradType === 'linear' ? 'bg-white text-[#20A46B] shadow-sm' : 'text-[#304250]/60 hover:text-[#304250]'}`}>
                                                        Linear
                                                    </button>
                                                    <button onClick={() => setGradType('radial')}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${gradType === 'radial' ? 'bg-white text-[#20A46B] shadow-sm' : 'text-[#304250]/60 hover:text-[#304250]'}`}>
                                                        Radial
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="gradient-bar h-10 shadow-inner rounded-xl border border-[#304250]/10" style={{ background: makeGradientCSS(gradStops, gradAngle, gradType) }}>
                                                {gradStops.map(stop => (
                                                    <div key={stop.id}
                                                        className={`gradient-stop-marker ${activeStopId === stop.id ? 'active !border-[#20A46B] scale-110' : ''}`}
                                                        style={{ left: `${stop.position}%`, backgroundColor: stop.color, width: '16px', height: '48px', top: '-4px' }}
                                                        onClick={(e) => { e.stopPropagation(); setActiveStopId(stop.id); }}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border border-[#304250]/10 bg-gray-50 rounded-xl p-2.5 shadow-inner">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={addStop} disabled={gradStops.length >= 6}
                                                        className="p-2 rounded-lg bg-white border border-[#304250]/10 text-[#304250]/60 hover:bg-[#20A46B]/10 hover:text-[#20A46B] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#304250]/60 transition-colors active:scale-95 shadow-sm">
                                                        <Plus size={16} />
                                                    </button>
                                                    {activeStopId && gradStops.length > 2 && (
                                                        <button onClick={() => removeStop(activeStopId)}
                                                            className="p-2 rounded-lg bg-white border border-[#304250]/10 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors active:scale-95 shadow-sm">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-xs font-extrabold text-[#304250]/40 uppercase tracking-wide">{gradStops.length} / 6 Colors</span>
                                            </div>

                                            {activeStop && (
                                                <div className="p-4 bg-gray-50 rounded-2xl space-y-4 border border-[#304250]/10 shadow-inner animate-in fade-in zoom-in-95">
                                                    <div className="flex gap-3 items-center bg-white border border-[#304250]/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#20A46B]/20 focus-within:border-[#20A46B] transition-all">
                                                        <div className="relative shrink-0">
                                                            <input type="color" value={activeStop.color} onChange={e => updateStop(activeStop.id, { color: e.target.value })}
                                                                className="w-10 h-10 rounded-lg opacity-0 cursor-pointer absolute inset-0 z-10" />
                                                            <div style={{ backgroundColor: activeStop.color }} className="w-10 h-10 rounded-lg border-2 border-white ring-1 ring-[#304250]/10 shadow-sm" />
                                                        </div>
                                                        <input type="text" value={activeStop.color} onChange={e => updateStop(activeStop.id, { color: e.target.value })}
                                                            className="flex-1 bg-transparent px-2 py-2 text-[15px] font-mono font-bold text-[#304250] uppercase outline-none" maxLength={7} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="flex justify-between mb-1.5">
                                                                <span className="text-xs font-bold text-[#304250]/70">Position</span>
                                                                <span className="text-xs font-mono font-bold text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded">{activeStop.position}%</span>
                                                            </div>
                                                            <input type="range" min={0} max={100} value={activeStop.position}
                                                                onChange={e => updateStop(activeStop.id, { position: parseInt(e.target.value) })}
                                                                className="green-slider w-full" />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between mb-1.5">
                                                                <span className="text-xs font-bold text-[#304250]/70">Opacity</span>
                                                                <span className="text-xs font-mono font-bold text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded">{Math.round(activeStop.opacity * 100)}%</span>
                                                            </div>
                                                            <input type="range" min={0} max={100} value={Math.round(activeStop.opacity * 100)}
                                                                onChange={e => updateStop(activeStop.id, { opacity: parseInt(e.target.value) / 100 })}
                                                                className="green-slider w-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {gradType === 'linear' && (
                                                <div className="bg-gray-50 p-4 rounded-xl border border-[#304250]/10 shadow-inner">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-bold text-[#304250]/70 flex items-center gap-1"><RotateCw size={14} /> Rotation Angle</span>
                                                        <span className="text-xs font-mono font-bold text-[#20A46B] bg-[#20A46B]/10 px-2 py-0.5 rounded">{gradAngle}°</span>
                                                    </div>
                                                    <input type="range" min={0} max={360} value={gradAngle}
                                                        onChange={e => setGradAngle(parseInt(e.target.value))}
                                                        className="green-slider w-full" />
                                                </div>
                                            )}

                                            <button onClick={applyCustomGradient} disabled={applyingBg}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold transition-colors disabled:opacity-50 active:scale-95 shadow-[0_4px_14px_rgba(32,164,107,0.3)]">
                                                {applyingBg && <Loader2 size={18} className="animate-spin" />}
                                                Apply Gradient
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ═══ TAB 3: STUDIO TEMPLATES ═══ */}
                                {editTab === 'templates' && (
                                    <div className="bg-white rounded-2xl border border-[#304250]/10 p-5 shadow-[0_4px_20px_rgba(48,66,80,0.03)] animate-in fade-in slide-in-from-right-4">
                                        <span className="text-[11px] font-extrabold text-[#304250]/50 uppercase tracking-wider block mb-4">Pro Scenery & Lighting</span>
                                        <div className="grid grid-cols-2 gap-3.5">
                                            {STUDIO_TEMPLATES.map(t => (
                                                <button key={t.id} onClick={() => applyTemplate(t.id)}
                                                    className={[
                                                        'flex flex-col text-left rounded-xl border-2 transition-all overflow-hidden bg-white',
                                                        selectedBg === t.id
                                                            ? 'border-[#20A46B] shadow-[0_4px_14px_rgba(32,164,107,0.15)] ring-2 ring-[#20A46B]/20'
                                                            : 'border-[#304250]/10 hover:border-[#304250]/30 hover:shadow-sm',
                                                    ].join(' ')}>
                                                    <div className="w-full h-20 flex items-center justify-center relative border-b border-[#304250]/5" style={{ background: t.gradient }}>
                                                        {selectedBg === t.id && !applyingBg && (
                                                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#20A46B] rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                                                                <Check size={14} className="text-white" />
                                                            </div>
                                                        )}
                                                        {applyingBg && selectedBg === t.id && (
                                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                                                <Loader2 size={20} className="text-[#20A46B] animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3 w-full">
                                                        <span className="text-sm font-bold text-[#304250] block truncate mb-0.5">{t.label}</span>
                                                        <span className="text-[11px] font-medium text-[#304250]/50 line-clamp-1">{t.desc}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Right: Preview (Col 7) ── */}
                            <div className="col-span-7 sticky top-6 h-fit">
                                <div className="rounded-[32px] border border-[#304250]/10 overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(48,66,80,0.04)] bg-gray-50/50 bg-checker h-[calc(100vh-100px)] min-h-[500px]">

                                    {/* Live Preview Header with Action Buttons on Right */}
                                    <div className="px-5 py-3 border-b border-[#304250]/10 bg-white flex items-center justify-between z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon size={18} className="text-[#304250]/40" />
                                                <span className="text-xs font-extrabold text-[#304250]/60 uppercase tracking-wide">Live Preview</span>
                                            </div>
                                            {applyingBg && (
                                                <div className="flex items-center gap-2 text-[#20A46B] bg-[#20A46B]/10 px-3 py-1 rounded-md border border-[#20A46B]/20 shadow-inner animate-in fade-in">
                                                    <Loader2 size={13} className="animate-spin" />
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Rendering</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Icons only Action Buttons in Preview Header */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                title="Cancel & Go Back"
                                                onClick={() => setState('success')}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#304250]/20 text-[#304250]/60 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors active:scale-95 shadow-sm"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                title="Download Selection"
                                                onClick={download}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#20A46B] text-white hover:bg-[#20A46B]/90 transition-colors shadow-md active:scale-95"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                                        <img src={displayImage} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-2xl z-10 transition-transform duration-500 ease-out" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .green-slider::-webkit-slider-thumb { background: #20A46B; }
                .green-slider::-moz-range-thumb { background: #20A46B; }
            `}</style>
        </div>
    );
}