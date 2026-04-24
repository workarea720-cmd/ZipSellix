import React, { useRef, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { useExportDocument } from '@/hooks/useExportDocument';
import { useBusinessStore } from '@/store/business-store';
import { usePackingSlipStore } from '@/store/packing-slip-store';
import { PackingSlipData, TemplateType } from '@/types/packing-slip';
import { API_URL, safeFetch } from '@/lib/api-client';

export function usePackingSlipLogic() {
    const { data, template, setTemplate, updateData, fetchOrderData } = usePackingSlipStore();
    const [isFetching, setIsFetching] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { register, control, watch, reset, getValues, setValue } = useForm<PackingSlipData>({ defaultValues: data });
    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    useEffect(() => {
        const subscription = watch((value) => updateData(value as Partial<PackingSlipData>));
        return () => subscription.unsubscribe();
    }, [watch, updateData]);

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
            updateData({
                senderName: info.businessName || data.senderName,
                senderPhone: info.phone || data.senderPhone,
                senderAddress: addressBlock || data.senderAddress,
                logoUrl: info.logo || data.logoUrl
            });
            if (info.businessName) setValue('senderName', info.businessName);
            if (info.phone) setValue('senderPhone', info.phone);
            if (addressBlock) setValue('senderAddress', addressBlock);
            if (info.logo) setValue('logoUrl', info.logo);
        }
    }, []);

    const handleFetchOrder = async () => {
        const id = getValues('orderId');
        if (!id) return alert("Enter Order ID");

        setIsFetching(true);
        await fetchOrderData(id);
        const freshData = usePackingSlipStore.getState().data;
        reset(freshData);
        setIsFetching(false);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                updateData({ logoUrl: result });
                setValue('logoUrl', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Packing-Slip-${data.orderId}`,
        pageStyle: template === 'thermal' ? `@page { size: 4in 6in; margin: 0; }` : `@page { size: A4; margin: 0; }`
    }) as () => void;

    // Dynamic page sizes based on template for 300 DPI export
    const getPageDimensions = () => {
        if (template === 'thermal') return { widthMM: 101.6, heightMM: 152.4 };
        return { widthMM: 210, heightMM: 297 };
    };

    const { isDownloading, downloadFormat, handleDownloadPDF, handleDownloadPNG } = useExportDocument({
        ref: componentRef,
        filename: `Packing-Slip-${data.orderId || 'Draft'}`,
        pageDimensions: getPageDimensions(),
        onDocumentGenerated: async (format, dataUrl) => {
            try {
                await safeFetch(`${API_URL}/api/documents/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'Packing Slip',
                        ref: data.orderId || 'Draft',
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
        template,
        setTemplate,
        isFetching,
        isDownloading,
        downloadFormat,
        showForm,
        setShowForm,
        register,
        fields,
        append,
        remove,
        handleFetchOrder,
        handleLogoUpload,
        componentRef,
        handlePrint,
        handleDownloadPDF,
        handleDownloadPNG
    };
}

export type PackingSlipLogicReturn = ReturnType<typeof usePackingSlipLogic>;
