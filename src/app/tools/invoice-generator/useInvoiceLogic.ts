import { useState, useRef, useCallback, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useExportDocument } from '@/hooks/useExportDocument';
import { useBusinessStore } from '@/store/business-store';
import { API_URL, safeFetch } from '@/lib/api-client';

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

export interface InvoiceState {
    invoiceNo: string;
    date: string;
    dueDate: string;
    sellerName: string;
    sellerEmail: string;
    sellerAddress: string;
    sellerPhone: string;
    logo: string | null;
    signature: string | null;
    signName: string;
    signatureName: string;
    qrCode: string;
    billToName: string;
    billToEmail: string;
    billToAddress: string;
    shipToName: string;
    shipToAddress: string;
    items: LineItem[];
    currency: string;
    tax: number;
    discount: number;
    shipping: number;
    notes: string;
    paymentMethod: 'bank' | 'cod';
    bankName: string;
    accountName: string;
    accountNumber: string;
    paymentInfo: string;
    showAdvance: boolean;
    advanceAmount: number;
    showShippingAddress: boolean;

    isPro: boolean; // Branding Hide/Show ke liye
}

export function useInvoiceLogic(isProStatus: boolean = false) {
    const printRef = useRef<HTMLDivElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(1);
    const [isPreview, setIsPreview] = useState(false);

    const [data, setData] = useState<InvoiceState>({
        invoiceNo: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        sellerName: '',
        sellerEmail: '',
        sellerAddress: '',
        sellerPhone: '',
        logo: null,
        signature: null,
        signName: '',
        signatureName: '',
        qrCode: '',
        billToName: '',
        billToEmail: '',
        billToAddress: '',
        shipToName: '',
        shipToAddress: '',
        items: [],
        currency: 'Rs',
        tax: 0,
        discount: 0,
        shipping: 0,
        notes: '',
        paymentMethod: 'bank',
        bankName: '',
        accountName: '',
        accountNumber: '',
        paymentInfo: '',
        showAdvance: false,
        advanceAmount: 0,
        showShippingAddress: false,
        isPro: isProStatus,
    });

    const update = (field: string, value: any) => setData({ ...data, [field]: value });

    useEffect(() => {
        const store = useBusinessStore.getState();
        const info = store.businessInfo;

        let addressBlock = info.address || '';
        if (info.city && !addressBlock.toLowerCase().includes(info.city.toLowerCase())) {
            addressBlock += addressBlock ? `, ${info.city}` : info.city;
        }
        if (info.province && !addressBlock.toLowerCase().includes(info.province.toLowerCase())) {
            addressBlock += addressBlock ? `, ${info.province}` : info.province;
        }

        if (info.businessName || info.phone || info.logo) {
            setData(prev => ({
                ...prev,
                sellerName: info.businessName || prev.sellerName,
                sellerPhone: info.phone || prev.sellerPhone,
                sellerAddress: addressBlock || prev.sellerAddress,
                sellerEmail: store.account?.email || prev.sellerEmail,
                logo: info.logo || prev.logo,
            }));
        }
    }, []);

    const handleUploads = {
        logo: (e: any) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onloadend = () => update('logo', r.result); r.readAsDataURL(file); }
        },
        signature: (e: any) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onloadend = () => update('signature', r.result); r.readAsDataURL(file); }
        }
    };

    const calculations = {
        subtotal: data.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0),
        get total() { return this.subtotal + ((this.subtotal * data.tax) / 100) + data.shipping - data.discount },
        addItem: () => setData({ ...data, items: [...data.items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0 }] }),
        removeItem: (id: string) => setData({ ...data, items: data.items.filter(i => i.id !== id) }),
        updateItem: (id: string, field: string, value: any) => setData({ ...data, items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) })
    };

    const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `Invoice-${data.invoiceNo}` }) as () => void;

    const previewStateRef = useRef(false);
    const onBeforeCapture = useCallback(async () => {
        previewStateRef.current = isPreview;
        if (!isPreview) setIsPreview(true);
    }, [isPreview]);
    const onAfterCapture = useCallback(async () => {
        if (!previewStateRef.current) setIsPreview(false);
    }, []);

    const exportDocs = useExportDocument({
        ref: printRef,
        filename: `Invoice-${data.invoiceNo || 'Draft'}`,
        pageDimensions: { widthMM: 210, heightMM: 297 },
        onBeforeCapture,
        onAfterCapture,
        onDocumentGenerated: async (format, dataUrl) => {
            try {
                await safeFetch(`${API_URL}/api/documents/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'Invoice',
                        ref: data.invoiceNo || 'Draft',
                        format,
                        fileData: dataUrl
                    })
                });
            } catch (err) {
                console.error("Failed to save document history", err);
            }
        }
    });

    return {
        data,
        update,
        handleUploads,
        calculations,
        printRef,
        handlePrint,
        selectedTemplate,
        setSelectedTemplate,
        isPreview,
        setIsPreview,
        handleDownloadPDF: exportDocs.handleDownloadPDF,
        handleDownloadPNG: exportDocs.handleDownloadPNG,
        isDownloading: exportDocs.isDownloading,
        downloadFormat: exportDocs.downloadFormat
    };
}

export type InvoiceLogicReturn = ReturnType<typeof useInvoiceLogic>;