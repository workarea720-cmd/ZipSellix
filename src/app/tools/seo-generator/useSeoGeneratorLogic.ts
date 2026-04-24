import { useState } from 'react';

export const CSS = `
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
`;

export function useSeoGeneratorLogic() {
    const [productName, setProductName] = useState('');
    const [features, setFeatures] = useState('');
    const [brandName, setBrandName] = useState('Buy2');

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // 👉 NEW: State to control the Upgrade Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGenerate = async () => {
        if (!productName || !features) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_name: productName, features, brand_name: brandName })
            });

            const data = await res.json();

            // 👉 CHANGED: Trigger our beautiful modal instead of the browser alert
            if (res.status === 403 && data.limitReached) {
                setIsModalOpen(true);
                return;
            }

            if (data.success) {
                setResult(data.data);
            } else {
                alert(data.message || "Something went wrong.");
            }
        } catch (err) {
            alert("Error: Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return {
        productName, setProductName,
        features, setFeatures,
        brandName, setBrandName,
        result, setResult,
        loading,
        copiedField,
        isModalOpen,      // 👉 Exported for the UI
        setIsModalOpen,   // 👉 Exported for the UI
        handleGenerate,
        copyToClipboard
    };
}

export type SeoGeneratorLogicReturn = ReturnType<typeof useSeoGeneratorLogic>;