import { useState, useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PageDimensions {
    widthMM: number;
    heightMM: number;
    orientation?: 'p' | 'l';
}

interface ExportOptions {
    ref: RefObject<HTMLDivElement | null>;
    filename: string;
    pageDimensions: PageDimensions;
    onBeforeCapture?: () => Promise<void> | void;
    onAfterCapture?: () => Promise<void> | void;
    onDocumentGenerated?: (format: 'pdf' | 'png', dataUrl: string) => void;
}

export function useExportDocument({ ref, filename, pageDimensions, onBeforeCapture, onAfterCapture, onDocumentGenerated }: ExportOptions) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'png' | null>(null);

    const captureImage = useCallback(async (): Promise<string | null> => {
        const element = ref.current;
        if (!element) return null;

        // 🔥 FIX: Koi extra math calculation nahi, sirf simple 3x resolution 
        // Ta'ke exact screen design capture ho aur phatay (blur) bhi nahi
        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 3,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
                transform: 'scale(1)', // Layout stretch hone se bachane ke liye
                transformOrigin: 'top left',
            },
            filter: (node: HTMLElement) => {
                if (node.classList?.contains('print:hidden')) return false;
                return true;
            },
        });

        return dataUrl;
    }, []);

    const handleDownloadPDF = useCallback(async () => {
        if (!ref.current) return;
        setIsDownloading(true);
        setDownloadFormat('pdf');

        try {
            if (onBeforeCapture) await onBeforeCapture();
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for DOM

            const dataUrl = await captureImage();
            if (!dataUrl) throw new Error('Failed to capture image');

            const orient = pageDimensions.orientation || 'p';
            const pdf = new jsPDF(orient, 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Image ko dynamically A4 size par fit karna
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            // Agar invoice items bohat zyada hain tabhi agla page banega
            while (heightLeft > 1) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            pdf.save(`${filename}.pdf`);

            if (onDocumentGenerated) {
                onDocumentGenerated('pdf', dataUrl);
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
        } finally {
            if (onAfterCapture) await onAfterCapture();
            setIsDownloading(false);
            setDownloadFormat(null);
        }
    }, [ref, filename, pageDimensions, captureImage, onBeforeCapture, onAfterCapture, onDocumentGenerated]);

    const handleDownloadPNG = useCallback(async () => {
        if (!ref.current) return;
        setIsDownloading(true);
        setDownloadFormat('png');

        try {
            if (onBeforeCapture) await onBeforeCapture();
            await new Promise(resolve => setTimeout(resolve, 300));

            const dataUrl = await captureImage();
            if (!dataUrl) throw new Error('Failed to capture image');

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();

            if (onDocumentGenerated) {
                onDocumentGenerated('png', dataUrl);
            }
        } catch (error) {
            console.error('PNG Generation Error:', error);
        } finally {
            if (onAfterCapture) await onAfterCapture();
            setIsDownloading(false);
            setDownloadFormat(null);
        }
    }, [ref, filename, captureImage, onBeforeCapture, onAfterCapture, onDocumentGenerated]);

    return {
        isDownloading,
        downloadFormat,
        handleDownloadPDF,
        handleDownloadPNG,
    };
}