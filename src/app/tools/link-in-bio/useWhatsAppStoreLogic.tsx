import React, { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export const TikTokIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.2 8.2 0 0 0 4.76 1.52V7.05a4.83 4.83 0 0 1-1-.36z" />
    </svg>
);

import { API_URL, safeFetch } from '@/lib/api-client';
export { API_URL };

export interface LinkItem {
    id: string;
    title: string;
    url: string;
    type: 'website' | 'daraz' | 'social' | 'custom';
}

export interface ProductItem {
    id: string;
    title: string;
    price: string;
    discount: string;
    image: string;
    imageFile?: File | null;
    rating: number;
    stock: 'in-stock' | 'limited' | 'out-of-stock';
}

export interface StoreProfile {
    display_name: string;
    bio: string;
    whatsapp: string;
    theme: 'classic' | 'modern' | 'dark';
    trust_badges: { cod: boolean; shipping: boolean; fast: boolean };
    socials: { instagram: string; tiktok: string; facebook: string };
    links: LinkItem[];
    products: ProductItem[];
    is_pro: boolean;
    pixels: { facebook: string; google: string; tiktok: string };
    custom_wa_message: string;
    store_logo: string;
}

export const themeClasses = {
    classic: { bg: 'bg-card-bg', text: 'text-brand-heading', card: 'bg-card-bg border border-card-border-subtle', accent: 'bg-brand-primary', badge: 'bg-brand-primary-light text-brand-primary border-brand-primary/20' },
    modern: { bg: 'bg-gradient-to-br from-brand-primary-light via-white to-brand-primary-light', text: 'text-brand-heading', card: 'bg-card-bg/80 backdrop-blur-sm border border-brand-primary/20/50', accent: 'bg-brand-primary', badge: 'bg-card-bg/80 text-brand-primary border-brand-primary/30' },
    dark: { bg: 'bg-brand-secondary', text: 'text-white', card: 'bg-slate-800 border border-slate-700', accent: 'bg-brand-primary', badge: 'bg-slate-800 text-brand-primary border-slate-700' },
};

export function useWhatsAppStoreLogic() {
    const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'products' | 'settings'>('profile');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [username, setUsername] = useState('mystore');
    const [showPreview, setShowPreview] = useState(false);

    const { data: session } = useSession();
    const isPro = session?.user?.planType?.toUpperCase() === 'PRO';

    const [profile, setProfile] = useState<StoreProfile>({
        display_name: "My WhatsApp Store",
        bio: "Best products in Pakistan! 🇵🇰 Order on WhatsApp.",
        whatsapp: "",
        theme: "classic",
        trust_badges: { cod: true, shipping: true, fast: false },
        socials: { instagram: "", tiktok: "", facebook: "" },
        links: [],
        products: [],
        is_pro: isPro,
        pixels: { facebook: "", google: "", tiktok: "" },
        custom_wa_message: "",
        store_logo: "",
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const cleanProducts = profile.products.map(({ imageFile, ...rest }) => rest);
            const payload = { ...profile, products: cleanProducts, username };
            await safeFetch(`${API_URL}/api/store/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            alert("Error saving store");
        } finally {
            setLoading(false);
        }
    };

    const addLink = () => {
        const newLink: LinkItem = { id: Date.now().toString(), title: 'New Link', url: '', type: 'website' };
        setProfile({ ...profile, links: [...profile.links, newLink] });
    };

    const updateLink = (idx: number, field: keyof LinkItem, value: string) => {
        const newLinks = [...profile.links];
        (newLinks[idx] as any)[field] = value;
        setProfile({ ...profile, links: newLinks });
    };

    const removeLink = (id: string) => {
        setProfile({ ...profile, links: profile.links.filter(l => l.id !== id) });
    };

    const moveLink = (idx: number, dir: 'up' | 'down') => {
        const newLinks = [...profile.links];
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= newLinks.length) return;
        [newLinks[idx], newLinks[target]] = [newLinks[target], newLinks[idx]];
        setProfile({ ...profile, links: newLinks });
    };

    const addProduct = () => {
        const newProd: ProductItem = {
            id: Date.now().toString(), title: '', price: '', discount: '',
            image: '', imageFile: null, rating: 0, stock: 'in-stock'
        };
        setProfile({ ...profile, products: [...profile.products, newProd] });
    };

    const updateProduct = (idx: number, field: keyof ProductItem, value: any) => {
        const newProds = [...profile.products];
        (newProds[idx] as any)[field] = value;
        setProfile({ ...profile, products: newProds });
    };

    const removeProduct = (id: string) => {
        setProfile({ ...profile, products: profile.products.filter(p => p.id !== id) });
    };

    const handleProductImageUpload = async (idx: number, file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and WebP images are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be under 5MB.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'product');

            const data = await safeFetch<any>('/api/upload-image', { method: 'POST', body: formData });

            if (data?.success) {
                updateProduct(idx, 'image', data.url);
            } else {
                alert('Image upload failed. Please try again.');
            }
        } catch {
            const localUrl = URL.createObjectURL(file);
            updateProduct(idx, 'image', localUrl);
        }
    };

    const handleLogoUpload = async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and WebP images are allowed.');
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            alert('Logo size must be under 3MB.');
            return;
        }

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const data = await safeFetch<any>('/api/upload-image', { method: 'POST', body: formData });

            if (data?.success) {
                setProfile(prev => ({ ...prev, store_logo: data.url }));
            } else {
                const localUrl = URL.createObjectURL(file);
                setProfile(prev => ({ ...prev, store_logo: localUrl }));
            }
        } catch {
            const localUrl = URL.createObjectURL(file);
            setProfile(prev => ({ ...prev, store_logo: localUrl }));
        } finally {
            setUploadingLogo(false);
        }
    };

    const getWhatsAppUrl = useCallback((productTitle: string, price: string) => {
        const phone = profile.whatsapp.replace(/[^0-9]/g, '');
        let msg: string;
        if (profile.custom_wa_message && profile.custom_wa_message.trim()) {
            msg = profile.custom_wa_message
                .replace(/{product_name}/g, productTitle)
                .replace(/{price}/g, price)
                .replace(/{store_name}/g, profile.display_name);
        } else {
            msg = `Hi, I want to order *${productTitle}* for Rs ${price} from ${profile.display_name}`;
        }
        return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }, [profile.whatsapp, profile.custom_wa_message, profile.display_name]);

    return {
        activeTab, setActiveTab,
        loading, saved,
        username, setUsername,
        showPreview, setShowPreview,
        profile, setProfile,
        logoInputRef, uploadingLogo, setUploadingLogo,
        handleSave,
        addLink, updateLink, removeLink, moveLink,
        addProduct, updateProduct, removeProduct,
        handleProductImageUpload, handleLogoUpload,
        getWhatsAppUrl,
        tc: themeClasses[profile.theme]
    };
}

export type WhatsAppStoreLogicReturn = ReturnType<typeof useWhatsAppStoreLogic>;