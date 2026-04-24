import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExportDocument } from '@/hooks/useExportDocument';
import { useBusinessStore } from '@/store/business-store';
import { toast } from 'sonner';

import { useLabelStore } from '@/store/shipping-label-store';
import { ShippingLabelSchema, LabelData, TemplateType } from '@/types/shipping-label';
import { API_URL, safeFetch } from '@/lib/api-client';

export function useShippingLabelLogic() {
    const { data, template, setTemplate, updateData, setInstructions } = useLabelStore();
    const componentRef = useRef<HTMLDivElement>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);

    // Booking state
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Quick Import search
    const [orderIdToSearch, setOrderIdToSearch] = useState('');



    // Available couriers from Business Store
    const couriers = useBusinessStore((s) => s.couriers);
    const businessInfo = useBusinessStore((s) => s.businessInfo);

    const { register, control, watch, setValue, getValues, reset, trigger, formState: { errors } } = useForm<LabelData>({
        resolver: zodResolver(ShippingLabelSchema),
        defaultValues: data,
        mode: 'onChange'
    });

    // Sync form → store on every change
    useEffect(() => {
        const subscription = watch((value) => {
            // @ts-ignore
            updateData(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, updateData]);

    // Auto-fill sender details from Business Profile on mount
    useEffect(() => {
        const info = businessInfo;

        let addressBlock = info.address || '';
        if (info.city && !addressBlock.toLowerCase().includes(info.city.toLowerCase())) {
            addressBlock += addressBlock ? `, ${info.city}` : info.city;
        }
        if (info.province && !addressBlock.toLowerCase().includes(info.province.toLowerCase())) {
            addressBlock += addressBlock ? `, ${info.province}` : info.province;
        }

        if (info.businessName || info.phone || info.logo) {
            const senderData: Partial<LabelData> = {
                senderName: info.businessName || data.senderName,
                senderPhone: info.phone || data.senderPhone,
                senderAddress: addressBlock || data.senderAddress,
                sellerLogo: info.logo || data.sellerLogo,
            };
            updateData(senderData);
            if (info.businessName) setValue('senderName', info.businessName);
            if (info.phone) setValue('senderPhone', info.phone);
            if (addressBlock) setValue('senderAddress', addressBlock);
            if (info.logo) setValue('sellerLogo', info.logo);
        }

        // Default courier to first one in business couriers list
        if (couriers.length > 0 && !data.courier) {
            setValue('courier', couriers[0].courierName);
            updateData({ courier: couriers[0].courierName });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                updateData({ sellerLogo: res });
                setValue('sellerLogo', res);
            };
            reader.readAsDataURL(file);
        }
    };

    // ─── QUICK IMPORT LOGIC ────────────────────────────────────────────
    const handleFetchOrder = async () => {
        if (!orderIdToSearch.trim()) {
            toast.error("Please enter an Order ID to search.");
            return;
        }

        const fetchId = toast.loading(`Searching for Order ${orderIdToSearch}...`);

        try {
            const orders = await safeFetch<any[]>(`${API_URL}/api/orders`);
            if (!orders) throw new Error("Failed to fetch orders.");

            const foundOrder = orders.find((o: any) => o.orderId.toLowerCase() === orderIdToSearch.toLowerCase().trim());

            if (foundOrder) {
                const importedData: Partial<LabelData> = {
                    receiverName: foundOrder.customerName || '',
                    receiverPhone: foundOrder.phone || '',
                    receiverAddress: foundOrder.address || '',
                    receiverCity: foundOrder.city || '',
                    receiverProvince: foundOrder.province || '',
                    orderRef: foundOrder.orderId || '',
                    courier: foundOrder.courier || (couriers.length > 0 ? couriers[0].courierName : 'Leopards'),
                    weight: foundOrder.weight ? foundOrder.weight.toString() : '0.5',
                    paymentType: foundOrder.paymentType || 'COD',
                    codAmount: foundOrder.totalAmount || 0,
                    orderDate: foundOrder.date || new Date().toISOString().split('T')[0],
                    trackingNumber: ''
                };

                Object.entries(importedData).forEach(([key, val]) => {
                    setValue(key as keyof LabelData, val as any);
                });

                updateData(importedData);
                toast.success(`Order ${foundOrder.orderId} loaded successfully!`, { id: fetchId });
                setBookingSuccess(false);
            } else {
                toast.error(`Order ${orderIdToSearch} not found.`, { id: fetchId });
            }
        } catch (error) {
            console.error("Error importing order:", error);
            toast.error("Error communicating with database.", { id: fetchId });
        }
    };

    // ─── BOOK ORDER (API Call) ──────────────────────────────────────────
    const handleBookOrder = async (): Promise<boolean> => {
        setIsBooking(true);

        try {
            const formData = getValues();

            const result = await safeFetch<any>('/api/courier/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courierName: formData.courier,
                    receiverName: formData.receiverName,
                    receiverPhone: formData.receiverPhone,
                    receiverEmail: formData.receiverEmail,
                    receiverAddress: formData.receiverAddress,
                    receiverCity: formData.receiverCity,
                    receiverProvince: formData.receiverProvince,
                    senderName: formData.senderName,
                    senderPhone: formData.senderPhone,
                    senderAddress: formData.senderAddress,
                    senderCity: businessInfo.city || '',
                    orderRef: formData.orderRef,
                    paymentType: formData.paymentType,
                    codAmount: formData.codAmount,
                    weight: formData.weight,
                    pieces: formData.pieces,
                    contents: formData.contents,
                    specialInstructions: formData.specialInstructions,
                    instructions: formData.instructions,
                }),
            });

            if (result?.status === 200) {
                const bookingData: Partial<LabelData> = {
                    trackingNumber: result.trackingNumber,
                    routingCode: result.routingCode,
                    barcodeValue: result.barcodeValue,
                    qrData: result.qrData || result.trackingNumber,
                    shipmentStatus: 'BOOKED',
                };

                updateData(bookingData);
                setValue('trackingNumber', result.trackingNumber);

                setBookingSuccess(true);
                toast.success(`Order booked! Tracking: ${result.trackingNumber}`, {
                    description: `Routing: ${result.routingCode} via ${result.courierName}`,
                    duration: 5000,
                });
                return true;
            } else {
                toast.error(result.message || 'Booking failed');
                return false;
            }
        } catch (err) {
            console.error("Failed to book order:", err);
            toast.error("Network error. Could not reach courier API.");
            return false;
        } finally {
            setIsBooking(false);
        }
    };

    // ─── VALIDATE & PROCEED ─────────────────────────────────────────────
    const validateAndProceed = async () => {
        // Validate the form fields for step 1
        const isValid = await trigger([
            'senderName', 'senderAddress',
            'receiverName', 'receiverPhone', 'receiverAddress', 'receiverCity',
            'orderRef', 'courier', 'weight', 'pieces', 'paymentType'
        ]);

        if (isValid) {
            setCurrentStep(2);
            return true;
        } else {
            toast.error('Please fix the highlighted errors before proceeding.');
            return false;
        }
    };

    // ─── RESET FOR NEW ORDER ────────────────────────────────────────────
    const resetForNewOrder = () => {
        setCurrentStep(1);
        setBookingSuccess(false);
        // Keep sender info, clear receiver & booking data
        const senderInfo = {
            senderName: data.senderName,
            senderPhone: data.senderPhone,
            senderAddress: data.senderAddress,
            sellerLogo: data.sellerLogo,
        };
        reset();
        Object.entries(senderInfo).forEach(([key, val]) => {
            if (val) setValue(key as keyof LabelData, val);
        });
        updateData({
            ...senderInfo,
            trackingNumber: '',
            routingCode: '',
            barcodeValue: '',
            receiverName: '',
            receiverPhone: '',
            receiverEmail: '',
            receiverAddress: '',
            receiverCity: '',
            receiverProvince: '',
            orderRef: '',
            codAmount: 0,
            shipmentStatus: '',
            courier: couriers.length > 0 ? couriers[0].courierName : '',
        });
    };

    // ─── PRINT LABEL ────────────────────────────────────────────────────
    const handlePrint = () => {
        window.print();
    };

    // ─── SHARE LABEL ────────────────────────────────────────────────────
    const handleShare = async () => {
        try {
            const shareText = `Shipping Label — Tracking: ${data.trackingNumber || 'N/A'}, Routing: ${data.routingCode || 'N/A'}, Courier: ${data.courier}`;
            if (navigator.share) {
                await navigator.share({
                    title: 'Shipping Label',
                    text: shareText,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                toast.success('Label details copied to clipboard!');
            }
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    };

    // ─── EXPORT LOGIC (4x6 orientation-aware) ──────────────────────────
    const getPageDimensions = () => {
        const isLandscape = template === 'tcs' || template === 'trax' || template === 'minimal';
        if (isLandscape) {
            return { widthMM: 152.4, heightMM: 101.6, orientation: 'l' as const };
        }
        return { widthMM: 101.6, heightMM: 152.4, orientation: 'p' as const };
    };

    const { isDownloading, downloadFormat, handleDownloadPDF } = useExportDocument({
        ref: componentRef,
        filename: `Label-${data.trackingNumber || data.orderRef || 'Draft'}`,
        pageDimensions: getPageDimensions(),
        onDocumentGenerated: async (format, dataUrl) => {
            try {
                await safeFetch(`${API_URL}/api/documents/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'Shipping Label',
                        ref: data.trackingNumber || data.orderRef || 'Draft',
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
        updateData,
        setInstructions,
        componentRef,
        isDownloading,
        downloadFormat,
        currentStep,
        setCurrentStep,
        isBooking,
        bookingSuccess,
        orderIdToSearch,
        setOrderIdToSearch,
        couriers,
        businessInfo,
        register,
        control,
        watch,
        setValue,
        errors,
        handleLogoUpload,
        handleBookOrder,
        handleDownloadPDF,
        handleFetchOrder,
        handlePrint,
        handleShare,
        validateAndProceed,
        resetForNewOrder,
    };
}

export type ShippingLabelLogicReturn = ReturnType<typeof useShippingLabelLogic>;