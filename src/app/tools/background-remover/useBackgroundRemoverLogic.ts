import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

/* ═══════════════════════════ TYPES ════════════════════════════════════ */
export type AppState = 'idle' | 'processing' | 'success' | 'editing';
export type EditTab = 'colors' | 'gradients' | 'templates';

export interface GradientStop {
    id: string;
    color: string;
    position: number;
    opacity: number;
}

/* ═══════════════════════════ DATA ═════════════════════════════════════ */
export const SOLID_COLORS = [
    '#FFFFFF', '#000000', '#F5F5F5', '#1E293B',
    '#16A34A', '#059669', '#0284C7', '#2563EB',
    '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
    '#D97706', '#65A30D', '#0891B2', '#4F46E5',
];

export const GRADIENT_PRESETS = [
    { label: 'Sunset', from: '#f97316', to: '#ec4899' },
    { label: 'Ocean', from: '#06b6d4', to: '#3b82f6' },
    { label: 'Forest', from: '#16a34a', to: '#065f46' },
    { label: 'Royal', from: '#7c3aed', to: '#2563eb' },
    { label: 'Blush', from: '#f9a8d4', to: '#f472b6' },
    { label: 'Slate', from: '#334155', to: '#0f172a' },
    { label: 'Mint', from: '#6ee7b7', to: '#34d399' },
    { label: 'Fire', from: '#ef4444', to: '#f97316' },
];

export const STUDIO_TEMPLATES = [
    { id: 'studio-spotlight', label: 'Studio Spotlight', desc: 'Dark dramatic lighting', gradient: 'linear-gradient(180deg, #1a1a2e, #16213e)', icon: '🔦' },
    { id: 'studio-surface', label: 'Surface Reflection', desc: 'Reflective surface effect', gradient: 'linear-gradient(180deg, #f0f0f0, #d4d4d4)', icon: '🪞' },
    { id: 'studio-gradient-warm', label: 'Warm Gradient', desc: 'Warm amber tones', gradient: 'linear-gradient(180deg, #fef3c7, #f59e0b)', icon: '🌅' },
    { id: 'studio-gradient-cool', label: 'Cool Gradient', desc: 'Cool blue tones', gradient: 'linear-gradient(180deg, #e0f2fe, #3b82f6)', icon: '❄️' },
    { id: 'studio-minimalist', label: 'Minimalist White', desc: 'Clean white studio', gradient: 'linear-gradient(180deg, #ffffff, #f5f5f5)', icon: '⬜' },
    { id: 'studio-luxury', label: 'Luxury Dark', desc: 'Premium dark with reflection', gradient: 'linear-gradient(180deg, #1f2937, #111827)', icon: '✨' },
    { id: 'studio-pastel', label: 'Pastel Dream', desc: 'Soft pastel blend', gradient: 'linear-gradient(180deg, #fce7f3, #ddd6fe)', icon: '🌸' },
    { id: 'studio-nature', label: 'Natural Light', desc: 'Warm natural lighting', gradient: 'linear-gradient(180deg, #fffbeb, #fef3c7)', icon: '☀️' },
];

/* ═══════════════════════════ CSS ══════════════════════════════════════ */
export const CSS = `
.bg-checker {
  background-image:
    linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
@keyframes scan {
  0%   { top: 0; }
  50%  { top: calc(100% - 3px); }
  100% { top: 0; }
}
.scan-line { animation: scan 2.4s ease-in-out infinite; }
.gradient-bar {
  position: relative;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
}
.gradient-stop-marker {
  position: absolute;
  top: -4px;
  width: 14px;
  height: 40px;
  transform: translateX(-50%);
  cursor: grab;
  border: 2px solid white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: box-shadow 0.15s;
}
.gradient-stop-marker:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.gradient-stop-marker.active {
  box-shadow: 0 0 0 2px #16a34a, 0 2px 8px rgba(0,0,0,0.3);
}
input[type="range"].green-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
}
input[type="range"].green-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
`;

/* ════════════════════════ HELPERS ═════════════════════════════════════ */
export function makeGradientCSS(stops: GradientStop[], angle: number, type: 'linear' | 'radial') {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const colorStops = sorted.map(s => {
        const r = parseInt(s.color.slice(1, 3), 16);
        const g = parseInt(s.color.slice(3, 5), 16);
        const b = parseInt(s.color.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${s.opacity}) ${s.position}%`;
    }).join(', ');
    if (type === 'radial') return `radial-gradient(circle, ${colorStops})`;
    return `linear-gradient(${angle}deg, ${colorStops})`;
}

let _stopId = 0;
export function newStop(color: string, position: number, opacity = 1): GradientStop {
    return { id: `s${++_stopId}`, color, position, opacity };
}

/* ════════════════════════ HOOK ════════════════════════════════════════ */
export function useBackgroundRemoverLogic() {
    const [state, setState] = useState<AppState>('idle');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [editTab, setEditTab] = useState<EditTab>('colors');
    const [selectedBg, setSelectedBg] = useState<string | null>(null);
    const [customColor, setCustomColor] = useState('#16A34A');
    const [applyingBg, setApplyingBg] = useState(false);

    /* Gradient builder state */
    const [gradStops, setGradStops] = useState<GradientStop[]>([
        newStop('#16A34A', 0), newStop('#065F46', 100),
    ]);
    const [gradAngle, setGradAngle] = useState(135);
    const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
    const [activeStopId, setActiveStopId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    /* ── Remove background ── */
    const processImage = async (imageFile: File) => {
        setState('processing');
        setError(null);
        setEditedImage(null);
        setSelectedBg(null);
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const res = await fetch('http://localhost:8000/remove-bg', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Backend processing failed');
            const blob = await res.blob();
            setProcessedBlob(blob);
            setProcessedImage(URL.createObjectURL(blob));
            setState('success');
        } catch {
            setError('Failed to process. Ensure the Python backend is running.');
            setState('idle');
        }
    };

    /* ── Apply solid background color via backend ── */
    const applyBackground = async (hexColor: string) => {
        if (!processedBlob) return;
        setApplyingBg(true);
        setSelectedBg(hexColor);
        try {
            const fd = new FormData();
            fd.append('file', processedBlob, 'fg.png');
            fd.append('bg_color', hexColor);

            const res = await fetch('http://localhost:8000/apply-background', {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) throw new Error('Apply failed');
            const blob = await res.blob();
            setEditedImage(URL.createObjectURL(blob));
        } catch {
            setError('Failed to apply background.');
        } finally { setApplyingBg(false); }
    };

    /* ── Apply preset gradient (client-side via canvas) ── */
    const applyPresetGradient = async (from: string, to: string) => {
        if (!processedImage) return;
        setApplyingBg(true);
        setSelectedBg(`${from}-${to}`);
        try {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = processedImage;
            await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, from);
            grad.addColorStop(1, to);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) setEditedImage(URL.createObjectURL(blob));
            }, 'image/png');
        } catch {
            setError('Failed to apply gradient.');
        } finally { setApplyingBg(false); }
    };

    /* ── Apply custom gradient via backend ── */
    const applyCustomGradient = async () => {
        if (!processedBlob) return;
        setApplyingBg(true);
        setSelectedBg('custom-gradient');
        try {
            const fd = new FormData();
            fd.append('file', processedBlob, 'fg.png');
            fd.append('gradient_config', JSON.stringify({
                stops: gradStops.map(s => ({ color: s.color, position: s.position, opacity: s.opacity })),
                angle: gradAngle,
                type: gradType,
            }));

            const res = await fetch('http://localhost:8000/apply-gradient', {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) throw new Error('Gradient apply failed');
            const blob = await res.blob();
            setEditedImage(URL.createObjectURL(blob));
        } catch {
            setError('Failed to apply custom gradient.');
        } finally { setApplyingBg(false); }
    };

    /* ── Apply studio template via backend ── */
    const applyTemplate = async (templateId: string) => {
        if (!processedBlob) return;
        setApplyingBg(true);
        setSelectedBg(templateId);
        try {
            const fd = new FormData();
            fd.append('file', processedBlob, 'fg.png');
            fd.append('template_id', templateId);

            const res = await fetch('http://localhost:8000/apply-template', {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) throw new Error('Template apply failed');
            const blob = await res.blob();
            setEditedImage(URL.createObjectURL(blob));
        } catch {
            setError('Failed to apply template.');
        } finally { setApplyingBg(false); }
    };

    /* ── Gradient stop helpers ── */
    const addStop = () => {
        if (gradStops.length >= 6) return;
        const sorted = [...gradStops].sort((a, b) => a.position - b.position);
        let pos = 50;
        if (sorted.length >= 2) {
            let maxGap = 0, bestPos = 50;
            for (let i = 0; i < sorted.length - 1; i++) {
                const gap = sorted[i + 1].position - sorted[i].position;
                if (gap > maxGap) { maxGap = gap; bestPos = (sorted[i].position + sorted[i + 1].position) / 2; }
            }
            pos = bestPos;
        }
        const ns = newStop('#3b82f6', Math.round(pos));
        setGradStops(prev => [...prev, ns]);
        setActiveStopId(ns.id);
    };

    const removeStop = (id: string) => {
        if (gradStops.length <= 2) return;
        setGradStops(prev => prev.filter(s => s.id !== id));
        if (activeStopId === id) setActiveStopId(null);
    };

    const updateStop = (id: string, updates: Partial<GradientStop>) => {
        setGradStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const activeStop = gradStops.find(s => s.id === activeStopId) || null;

    /* ── Dropzone ── */
    const onDrop = useCallback((accepted: File[]) => {
        const f = accepted[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError('File size exceeds 5 MB limit.'); return; }
        setFileName(f.name);
        setOriginalImage(URL.createObjectURL(f));
        setProcessedImage(null);
        setEditedImage(null);
        setError(null);
        processImage(f);
    }, []);

    const dropzoneOptions = {
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        disabled: state === 'processing',
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

    const reset = () => {
        setState('idle');
        setOriginalImage(null);
        setProcessedImage(null);
        setEditedImage(null);
        setProcessedBlob(null);
        setError(null);
        setFileName('');
        setSelectedBg(null);
    };

    const download = () => {
        const src = editedImage || processedImage;
        if (!src) return;
        const a = document.createElement('a');
        a.href = src;
        a.download = `edited-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const displayImage = editedImage ?? processedImage ?? undefined;

    return {
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
    };
}

export type BackgroundRemoverLogicReturn = ReturnType<typeof useBackgroundRemoverLogic>;
