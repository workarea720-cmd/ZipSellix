import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';

/* ═══════════════════════════ TYPES ════════════════════════════════════ */
export interface CompressedImage {
    id: string;
    originalFile: File;
    preview: string;
    result?: string;        // ── Stores a URL (/uploads/temp/...) not base64
    originalSize: number;
    compressedSize?: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    error?: string;
}

export const RESIZE_MODES = [
    { key: 'original', label: 'Original' },
    { key: 'daraz', label: 'Daraz' },
    { key: 'shopify', label: 'Shopify' },
    { key: 'custom', label: 'Custom' },
];

/* ═══════════════════════════ INLINE CSS ═══════════════════════════════ */
export const CSS = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shimmer 1.5s infinite;
}
.slider-premium {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
}
.slider-premium::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.4);
  transition: transform 0.1s ease;
}
.slider-premium::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
`;

export function useImageCompressorLogic() {
    const [images, setImages] = useState<CompressedImage[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);

    const [settings, setSettings] = useState({
        quality: 80,
        format: 'original',
        resizeMode: 'original',
        width: '',
        height: '',
    });

    /* ── Dropzone ── */
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            originalFile: file,
            preview: URL.createObjectURL(file),
            originalSize: file.size,
            status: 'pending' as const,
        }));
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        noClick: images.length > 0,
        noKeyboard: images.length > 0,
    });

    /* ── Process ── */
    const processImages = async () => {
        const pendingImages = images.filter(img => img.status === 'pending');
        if (pendingImages.length === 0) return;

        setIsCompressing(true);
        setImages(prev => prev.map(img =>
            img.status === 'pending' ? { ...img, status: 'processing' } : img
        ));

        for (const img of pendingImages) {
            const formData = new FormData();
            formData.append('file', img.originalFile);
            formData.append('settings', JSON.stringify(settings));
            // isPro is NOT sent — backend reads it from session (secure)

            try {
                const res = await fetch('/api/compress', { method: 'POST', body: formData });
                const data = await res.json();

                if (res.status === 403 && data.limitReached) {
                    // Free tier limit reached — stop processing remaining images
                    setImages(prev => prev.map(p =>
                        p.id === img.id
                            ? { ...p, status: 'error', error: data.error || 'Daily limit reached. Upgrade to Pro!' }
                            : p
                    ));
                    break;
                }

                if (data.success) {
                    setImages(prev => prev.map(p => p.id === img.id ? {
                        ...p,
                        status: 'done',
                        result: data.data.url,
                        compressedSize: data.data.compressedSize,
                    } : p));
                } else {
                    throw new Error(data.error);
                }
            } catch {
                setImages(prev => prev.map(p =>
                    p.id === img.id ? { ...p, status: 'error', error: 'Failed' } : p
                ));
            }
        }

        setIsCompressing(false);
    };

    /* ── Single download ── */
    const downloadSingle = (img: CompressedImage) => {
        if (!img.result) return;
        const link = document.createElement('a');
        link.href = img.result;
        const ext = settings.format === 'original'
            ? img.originalFile.name.split('.').pop()
            : settings.format;
        link.download = `optimized-${img.originalFile.name.split('.')[0]}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ── Bulk ZIP download ── */
    const downloadAllZip = async () => {
        const zip = new JSZip();
        const doneImages = images.filter(i => i.status === 'done' && i.result);

        await Promise.all(doneImages.map(async (img) => {
            if (!img.result) return;
            try {
                const response = await fetch(img.result);
                const arrayBuf = await response.arrayBuffer();
                const ext = settings.format === 'original'
                    ? img.originalFile.name.split('.').pop()
                    : settings.format;
                zip.file(
                    `optimized-${img.originalFile.name.split('.')[0]}.${ext}`,
                    arrayBuf
                );
            } catch {
                console.warn(`Could not fetch ${img.result} for zip`);
            }
        }));

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'compressed-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ── Helpers ── */
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const doneImages = images.filter(i => i.status === 'done');
    const hasDone = doneImages.length > 0;
    const hasPending = images.some(i => i.status === 'pending');
    const totalSaved = doneImages.reduce((acc, i) => acc + (i.originalSize - (i.compressedSize || i.originalSize)), 0);
    const totalOriginal = doneImages.reduce((acc, i) => acc + i.originalSize, 0);
    const savingsPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

    return {
        images, setImages,
        isCompressing,
        settings, setSettings,
        getRootProps, getInputProps, isDragActive, onDrop,
        processImages,
        downloadSingle, downloadAllZip,
        formatBytes,
        doneImages, hasDone, hasPending, totalSaved, totalOriginal, savingsPercent,
    };
}

export type ImageCompressorLogicReturn = ReturnType<typeof useImageCompressorLogic>;