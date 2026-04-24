import React, { useState, useRef, useEffect } from 'react';
import { WhatsAppStoreLogicReturn, TikTokIcon } from '../useWhatsAppStoreLogic';
import {
    Store, Save, Plus, Trash2, ChevronUp, ChevronDown,
    Link as LinkIcon, ShoppingBag, Eye, MessageCircle, Phone, Globe,
    Star, Shield, Truck, Zap, Lock, Settings, User, Image as ImageIcon,
    Facebook, Instagram, Share2, ChevronRight, Loader2, Check, X,
    Palette, Crown, Tag, Upload, Camera, Edit3
} from 'lucide-react';

// Custom Original WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
);

export default function DesktopUI({ logic }: { logic: WhatsAppStoreLogicReturn }) {
    const {
        activeTab, setActiveTab,
        loading, saved,
        username, setUsername,
        profile, setProfile,
        logoInputRef, uploadingLogo,
        handleSave,
        addLink, updateLink, removeLink, moveLink,
        addProduct, updateProduct, removeProduct,
        handleProductImageUpload, handleLogoUpload,
        getWhatsAppUrl,
        tc
    } = logic;

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'links' as const, label: 'Links', icon: LinkIcon },
        { id: 'products' as const, label: 'Products', icon: ShoppingBag },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    // State for managing custom stock status dropdowns (Product ID -> Boolean)
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const linkTypes = [
        { id: 'website', label: '🌐 Website' },
        { id: 'daraz', label: '🛒 Daraz' },
        { id: 'social', label: '📱 Social' },
        { id: 'custom', label: '🔗 Custom' }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#304250] font-sans selection:bg-[#20A46B]/20 selection:text-[#20A46B]">
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-12 gap-6 items-start min-h-[calc(100vh-180px)]">

                    {/* ===== LEFT: EDITOR PANEL ===== */}
                    <div className="col-span-7 flex flex-col gap-4">

                        {/* Top Action Bar */}
                        <div className="flex justify-end items-center bg-transparent">
                            <button onClick={handleSave} disabled={loading} className="bg-[#20A46B] hover:bg-[#20A46B]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-[0_4px_14px_rgba(32,164,107,0.3)] disabled:opacity-60 disabled:shadow-none active:scale-95">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Publish Store</>}
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-white border border-[#304250]/10 p-1.5 rounded-xl overflow-x-auto no-scrollbar whitespace-nowrap shadow-sm mt-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`shrink-0 flex-1 py-2.5 text-[13px] font-bold rounded-lg transition flex items-center justify-center gap-1.5
                                            ${activeTab === tab.id ? 'bg-[#20A46B]/10 text-[#20A46B] shadow-sm' : 'text-[#304250]/60 hover:bg-gray-50 hover:text-[#304250]'}`}>
                                        <Icon size={14} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white p-6 rounded-2xl border border-[#304250]/10 shadow-[0_8px_30px_rgba(48,66,80,0.04)] flex-1 overflow-y-auto w-full custom-scrollbar">

                            {/* ===== PROFILE TAB ===== */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-in fade-in duration-300">

                                    {/* Store Logo Upload (Moved to TOP) */}
                                    <div className="bg-gray-50/50 border border-[#304250]/5 p-4 rounded-xl flex items-center gap-5">
                                        <div className="relative group shrink-0">
                                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#304250]/20 flex items-center justify-center overflow-hidden bg-white cursor-pointer hover:border-[#20A46B] transition shadow-sm"
                                                onClick={() => logoInputRef.current?.click()}>
                                                {uploadingLogo ? (
                                                    <Loader2 size={24} className="text-[#20A46B] animate-spin" />
                                                ) : profile.store_logo ? (
                                                    <img src={profile.store_logo} className="w-full h-full object-cover" alt="Logo" />
                                                ) : (
                                                    <Camera size={24} className="text-[#304250]/30" />
                                                )}
                                            </div>
                                            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold uppercase text-[#304250] mb-1 block tracking-wider">Store Logo</label>
                                            <p className="text-xs text-[#304250]/60 font-medium mb-2">Upload your brand logo (JPG, PNG). Max 3MB.</p>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => logoInputRef.current?.click()} className="text-xs font-bold bg-white text-[#304250] border border-[#304250]/10 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm active:scale-95">
                                                    Upload Image
                                                </button>
                                                {profile.store_logo && (
                                                    <button onClick={() => setProfile({ ...profile, store_logo: '' })} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition active:scale-95">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-[#304250]/60 mb-1.5 block tracking-wider">Store Name</label>
                                            <input type="text" className="w-full border border-[#304250]/10 p-3 rounded-xl text-sm font-bold text-[#304250] focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition bg-gray-50 focus:bg-white" placeholder="My Awesome Store"
                                                value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-[#304250]/60 mb-1.5 block tracking-wider">Bio / Tagline</label>
                                            <textarea className="w-full border border-[#304250]/10 p-3 rounded-xl text-sm font-medium text-[#304250] h-20 resize-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition bg-gray-50 focus:bg-white" placeholder="Describe your store and products..."
                                                value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-[#304250]/60 mb-1.5 block tracking-wider">WhatsApp Number (for orders)</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#20A46B]" />
                                                <input type="text" placeholder="+92 300 1234567" className="w-full border border-[#304250]/10 pl-10 pr-4 py-3 rounded-xl text-sm font-bold text-[#304250] focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition bg-gray-50 focus:bg-white"
                                                    value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="pt-2 border-t border-[#304250]/10">
                                        <label className="text-xs font-bold uppercase text-[#304250]/60 mb-3 block tracking-wider">Store Trust Badges</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { key: 'cod' as const, label: 'Cash on Delivery', icon: Shield },
                                                { key: 'shipping' as const, label: 'All Pakistan Shipping', icon: Truck },
                                                { key: 'fast' as const, label: 'Fast Delivery', icon: Zap },
                                            ].map(badge => (
                                                <button key={badge.key} onClick={() => setProfile({ ...profile, trust_badges: { ...profile.trust_badges, [badge.key]: !profile.trust_badges[badge.key] } })}
                                                    className={`p-3 rounded-xl border-2 text-left text-xs font-bold flex items-center gap-2 transition-all active:scale-95
                                                    ${profile.trust_badges[badge.key]
                                                            ? 'border-[#20A46B] bg-[#20A46B]/5 text-[#20A46B] shadow-sm'
                                                            : 'border-[#304250]/10 bg-white text-[#304250]/60 hover:border-[#304250]/30 hover:bg-gray-50'}`}>
                                                    <badge.icon size={16} />
                                                    {badge.label}
                                                    {profile.trust_badges[badge.key] && <Check size={14} className="ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom WhatsApp Message */}
                                    <div className="pt-2 border-t border-[#304250]/10">
                                        <label className="text-xs font-bold uppercase text-[#304250]/60 mb-2 flex items-center justify-between tracking-wider">
                                            <span>Custom Order Message</span>
                                            <span className="text-[10px] font-bold bg-[#20A46B]/10 text-[#20A46B] px-2 py-0.5 rounded-md">WhatsApp format</span>
                                        </label>
                                        <textarea
                                            className="w-full border border-[#304250]/10 p-3 rounded-xl text-sm font-medium text-[#304250] h-20 resize-none focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition bg-gray-50 focus:bg-white"
                                            placeholder="Hi, I want to order {product_name} for Rs {price} from {store_name}"
                                            value={profile.custom_wa_message}
                                            onChange={(e) => setProfile({ ...profile, custom_wa_message: e.target.value })}
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2.5">
                                            {['{product_name}', '{price}', '{store_name}'].map(tag => (
                                                <button key={tag} onClick={() => setProfile({ ...profile, custom_wa_message: profile.custom_wa_message + ' ' + tag })}
                                                    className="text-[11px] bg-gray-100 text-[#304250]/60 border border-[#304250]/10 px-3 py-1.5 rounded-lg font-mono font-bold hover:bg-gray-200 hover:text-[#304250] transition flex items-center active:scale-95">
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== LINKS TAB ===== */}
                            {activeTab === 'links' && (
                                <div className="space-y-6 animate-in fade-in duration-300 w-full">

                                    {/* Socials */}
                                    <div className="bg-gray-50/50 border border-[#304250]/10 p-5 rounded-2xl shadow-sm">
                                        <label className="text-[11px] font-extrabold uppercase text-[#304250]/60 mb-4 block tracking-wider">Social Media Profiles</label>
                                        <div className="space-y-3">
                                            {/* Instagram */}
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-11 h-11 rounded-xl bg-white border border-[#304250]/10 shadow-sm flex items-center justify-center shrink-0 transition-transform group-focus-within:border-[#20A46B] group-focus-within:ring-2 ring-[#20A46B]/20">
                                                    <Instagram size={20} className="text-pink-600" />
                                                </div>
                                                <input type="text" placeholder="instagram.com/yourstore" className="flex-1 border border-[#304250]/10 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition shadow-sm bg-white text-[#304250] min-w-0 placeholder:font-medium placeholder:text-[#304250]/30"
                                                    value={profile.socials.instagram} onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, instagram: e.target.value } })} />
                                            </div>
                                            {/* TikTok */}
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-11 h-11 rounded-xl bg-white border border-[#304250]/10 shadow-sm flex items-center justify-center shrink-0 transition-transform group-focus-within:border-[#20A46B] group-focus-within:ring-2 ring-[#20A46B]/20">
                                                    <div className="bg-black text-white p-1 rounded-md"><TikTokIcon size={14} /></div>
                                                </div>
                                                <input type="text" placeholder="tiktok.com/@yourstore" className="flex-1 border border-[#304250]/10 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition shadow-sm bg-white text-[#304250] min-w-0 placeholder:font-medium placeholder:text-[#304250]/30"
                                                    value={profile.socials.tiktok} onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, tiktok: e.target.value } })} />
                                            </div>
                                            {/* Facebook */}
                                            <div className="flex items-center gap-3 group">
                                                <div className="w-11 h-11 rounded-xl bg-white border border-[#304250]/10 shadow-sm flex items-center justify-center shrink-0 transition-transform group-focus-within:border-[#20A46B] group-focus-within:ring-2 ring-[#20A46B]/20">
                                                    <Facebook size={20} className="text-blue-600" />
                                                </div>
                                                <input type="text" placeholder="facebook.com/yourstore" className="flex-1 border border-[#304250]/10 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 ring-[#20A46B]/20 focus:border-[#20A46B] outline-none transition shadow-sm bg-white text-[#304250] min-w-0 placeholder:font-medium placeholder:text-[#304250]/30"
                                                    value={profile.socials.facebook} onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, facebook: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Links */}
                                    <div>
                                        <label className="text-[11px] font-extrabold uppercase text-[#304250]/60 mb-4 block tracking-wider">Custom Links</label>
                                        <div className="space-y-3">
                                            {profile.links.length === 0 && (
                                                <div className="text-center py-8 text-[#304250]/40 bg-white border border-[#304250]/10 rounded-xl border-dashed">
                                                    <LinkIcon size={24} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm font-bold">No custom links added</p>
                                                </div>
                                            )}
                                            {profile.links.map((link, idx) => (
                                                <div key={link.id} className="border border-[#304250]/10 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition group shadow-sm">
                                                    <div className="flex items-start gap-4 w-full">
                                                        {/* Reorder Buttons */}
                                                        <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                                                            <button onClick={() => moveLink(idx, 'up')} disabled={idx === 0} className="p-1 flex justify-center items-center text-[#304250]/40 hover:text-[#304250] hover:bg-white disabled:opacity-30 transition bg-transparent border border-transparent hover:border-[#304250]/10 rounded-md mb-1 active:scale-95"><ChevronUp size={14} /></button>
                                                            <button onClick={() => moveLink(idx, 'down')} disabled={idx === profile.links.length - 1} className="p-1 flex justify-center items-center text-[#304250]/40 hover:text-[#304250] hover:bg-white disabled:opacity-30 transition bg-transparent border border-transparent hover:border-[#304250]/10 rounded-md active:scale-95"><ChevronDown size={14} /></button>
                                                        </div>
                                                        <div className="flex-1 space-y-3 w-full">
                                                            <div className="flex gap-3">
                                                                <input type="text" placeholder="Link Title (e.g. Visit my Daraz Store)" className="flex-1 font-bold text-sm text-[#304250] bg-white border border-[#304250]/10 rounded-lg px-3 py-2.5 focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none transition min-w-0 shadow-sm placeholder:font-medium placeholder:text-[#304250]/30"
                                                                    value={link.title} onChange={(e) => updateLink(idx, 'title', e.target.value)} />

                                                                {/* Custom Link Type Dropdown */}
                                                                <div className="relative w-36 shrink-0" ref={(el) => { dropdownRefs.current[link.id] = el; }}>
                                                                    <button onClick={() => setOpenDropdownId(openDropdownId === link.id ? null : link.id)} className="w-full bg-white border border-[#304250]/10 text-[#304250] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between gap-2 shadow-sm hover:border-[#304250]/30 transition-colors outline-none focus:ring-1 ring-[#20A46B] focus:border-[#20A46B]">
                                                                        <span>{linkTypes.find(t => t.id === link.type)?.label || '🌐 Website'}</span>
                                                                        <ChevronDown size={14} className={`text-[#304250]/40 transition-transform ${openDropdownId === link.id ? 'rotate-180' : ''}`} />
                                                                    </button>
                                                                    {openDropdownId === link.id && (
                                                                        <div className="absolute top-full right-0 mt-1 w-full bg-white border border-[#304250]/10 rounded-xl shadow-[0_10px_40px_rgba(48,66,80,0.08)] z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                            {linkTypes.map(type => (
                                                                                <div key={type.id} onClick={() => { updateLink(idx, 'type', type.id); setOpenDropdownId(null); }} className={`px-3 py-2 text-xs font-bold cursor-pointer transition mx-1 rounded-lg flex items-center gap-2 ${link.type === type.id ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'text-[#304250]/70 hover:bg-gray-50 hover:text-[#304250]'}`}>{type.label}</div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 items-center">
                                                                <div className="relative flex-1 min-w-0 shadow-sm rounded-lg">
                                                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#304250]/30" />
                                                                    <input type="text" placeholder="https://..." className="w-full text-sm font-bold text-[#304250] bg-white border border-[#304250]/10 rounded-lg pl-9 pr-3 py-2.5 focus:border-[#20A46B] focus:ring-1 ring-[#20A46B]/20 outline-none transition min-w-0 placeholder:font-medium placeholder:text-[#304250]/30"
                                                                        value={link.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} />
                                                                </div>
                                                                <button onClick={() => removeLink(link.id)} className="p-2.5 text-[#304250]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100 shrink-0 active:scale-95"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={addLink} className="w-full py-4 border-2 border-dashed border-[#20A46B] bg-[#20A46B]/5 hover:bg-[#20A46B]/10 rounded-2xl text-[#20A46B] font-extrabold text-sm active:scale-[0.98] flex justify-center items-center gap-2 transition-all">
                                                <Plus size={18} /> Add Custom Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== PRODUCTS TAB ===== */}
                            {activeTab === 'products' && (
                                <div className="space-y-4 animate-in fade-in duration-300 w-full pb-32">
                                    <div className="text-sm text-[#20A46B] bg-[#20A46B]/10 p-4 rounded-xl border border-[#20A46B]/20 flex items-start gap-3 shadow-sm">
                                        <MessageCircle size={20} className="text-[#20A46B] shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="font-extrabold">WhatsApp Store Integration</strong>
                                            <p className="text-[#20A46B]/80 font-medium mt-0.5 leading-relaxed">Products appear directly in your mini store. When a customer clicks "Buy", it generates a pre-filled WhatsApp order message.</p>
                                        </div>
                                    </div>

                                    {profile.products.length === 0 && (
                                        <div className="text-center py-12 text-[#304250]/40 bg-gray-50/50 border-2 border-dashed border-[#304250]/10 rounded-2xl">
                                            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30 text-[#304250]/40" />
                                            <p className="text-base font-extrabold text-[#304250]/60 mb-1">Your store is empty</p>
                                            <p className="text-sm font-medium">Add your first product to start selling.</p>
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        {profile.products.map((prod, idx) => (
                                            <div key={prod.id} className="border border-[#304250]/10 p-5 rounded-2xl bg-white shadow-[0_8px_30px_rgba(48,66,80,0.04)] relative group transition-all hover:border-[#304250]/30 hover:shadow-md">

                                                {/* Delete Product Button */}
                                                <button onClick={() => removeProduct(prod.id)} className="absolute top-4 right-4 p-2 text-[#304250]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 z-10 active:scale-95">
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* Card Content - Vertical Stack */}
                                                <div className="flex flex-col gap-5">

                                                    {/* Top Header & Image Row */}
                                                    <div className="flex items-center gap-5 pb-5 border-b border-[#304250]/5">
                                                        {/* Image Upload Box */}
                                                        <div className="shrink-0 flex flex-col items-center gap-2">
                                                            <label className="block w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-[#304250]/20 hover:border-[#20A46B] cursor-pointer overflow-hidden transition relative group/img shadow-sm">
                                                                {prod.image ? (
                                                                    <>
                                                                        <img src={prod.image} className="w-full h-full object-cover" alt="" />
                                                                        <div className="absolute inset-0 bg-[#304250]/60 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]">
                                                                            <Camera size={20} className="text-white" />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#304250]/40">
                                                                        <Upload size={18} className="text-[#304250]/30" />
                                                                        <span className="text-[10px] font-bold">Photo</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProductImageUpload(idx, f); }} />
                                                            </label>
                                                            {prod.image && (
                                                                <button onClick={() => updateProduct(idx, 'image', '')} className="text-[10px] font-extrabold text-red-500 hover:text-red-600 transition active:scale-95">Remove</button>
                                                            )}
                                                        </div>

                                                        {/* Title Input */}
                                                        <div className="flex-1 space-y-1.5 pr-8">
                                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider">Product Title</label>
                                                            <input type="text" placeholder="e.g. Minimalist Watch"
                                                                className="w-full font-bold text-base bg-gray-50 border border-[#304250]/10 rounded-xl px-4 py-3 focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] focus:bg-white outline-none transition shadow-sm text-[#304250] placeholder:text-[#304250]/30 placeholder:font-medium min-w-0"
                                                                value={prod.title} onChange={(e) => updateProduct(idx, 'title', e.target.value)} />
                                                        </div>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Regular Price */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider flex items-center justify-between">
                                                                <span>Regular Price</span>
                                                                <span className="text-[9px] text-[#304250]/40 bg-gray-100 px-1.5 py-0.5 rounded">PKR</span>
                                                            </label>
                                                            <div className="relative shadow-sm rounded-xl">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#304250]/40">Rs</span>
                                                                <input type="text" placeholder="1500"
                                                                    className="w-full text-sm font-bold text-[#304250] bg-white border border-[#304250]/10 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] transition min-w-0 placeholder:text-[#304250]/30"
                                                                    value={prod.price} onChange={(e) => updateProduct(idx, 'price', e.target.value)} />
                                                            </div>
                                                        </div>

                                                        {/* Sale Price */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-1">
                                                                <Tag size={12} /> Sale Price <span className="text-[9px] font-bold opacity-70">(Optional)</span>
                                                            </label>
                                                            <div className="relative shadow-sm rounded-xl">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-red-300">Rs</span>
                                                                <input type="text" placeholder="1200"
                                                                    className="w-full text-sm font-bold bg-red-50/30 border border-red-100 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-red-400 focus:ring-1 ring-red-400 text-red-600 transition placeholder:text-red-200 min-w-0"
                                                                    value={prod.discount} onChange={(e) => updateProduct(idx, 'discount', e.target.value)} />
                                                            </div>
                                                        </div>

                                                        {/* Stock Status */}
                                                        <div className="space-y-1.5 relative">
                                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider">Stock Status</label>
                                                            <div className="relative w-full" ref={(el) => { dropdownRefs.current[prod.id] = el; }}>
                                                                <button
                                                                    onClick={() => setOpenDropdownId(openDropdownId === prod.id ? null : prod.id)}
                                                                    className="w-full bg-white border border-[#304250]/10 text-[#304250] py-2.5 px-3 rounded-xl text-[13px] font-bold flex items-center justify-between shadow-sm outline-none focus:border-[#20A46B] focus:ring-1 ring-[#20A46B] transition-colors"
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        {prod.stock === 'in-stock' && <><span className="text-[#20A46B]">●</span> In Stock</>}
                                                                        {prod.stock === 'limited' && <><span className="text-[#EEBE1C]">●</span> Limited</>}
                                                                        {prod.stock === 'out-of-stock' && <><span className="text-red-500">●</span> Sold Out</>}
                                                                    </span>
                                                                    <ChevronDown size={16} className={`text-[#304250]/40 transition-transform ${openDropdownId === prod.id ? 'rotate-180' : ''}`} />
                                                                </button>

                                                                {/* Custom Dropdown */}
                                                                {openDropdownId === prod.id && (
                                                                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#304250]/10 rounded-xl shadow-[0_10px_40px_rgba(48,66,80,0.08)] z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                        <div onClick={() => { updateProduct(idx, 'stock', 'in-stock'); setOpenDropdownId(null); }}
                                                                            className={`px-3 py-2.5 text-[13px] font-bold cursor-pointer mx-1 rounded-lg flex items-center gap-2 ${prod.stock === 'in-stock' ? 'bg-[#20A46B]/10 text-[#20A46B]' : 'text-[#304250]/70 hover:bg-gray-50'}`}>
                                                                            <span className="text-[#20A46B]">●</span> In Stock
                                                                        </div>
                                                                        <div onClick={() => { updateProduct(idx, 'stock', 'limited'); setOpenDropdownId(null); }}
                                                                            className={`px-3 py-2.5 text-[13px] font-bold cursor-pointer mx-1 rounded-lg flex items-center gap-2 mt-1 ${prod.stock === 'limited' ? 'bg-[#EEBE1C]/10 text-[#EEBE1C]' : 'text-[#304250]/70 hover:bg-gray-50'}`}>
                                                                            <span className="text-[#EEBE1C]">●</span> Limited
                                                                        </div>
                                                                        <div onClick={() => { updateProduct(idx, 'stock', 'out-of-stock'); setOpenDropdownId(null); }}
                                                                            className={`px-3 py-2.5 text-[13px] font-bold cursor-pointer mx-1 rounded-lg flex items-center gap-2 mt-1 ${prod.stock === 'out-of-stock' ? 'bg-red-50 text-red-500' : 'text-[#304250]/70 hover:bg-gray-50'}`}>
                                                                            <span className="text-red-500">●</span> Sold Out
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Rating */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase tracking-wider">Customer Rating</label>
                                                            <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-xl border border-[#304250]/10 shadow-inner">
                                                                <div className="flex gap-1.5">
                                                                    {[1, 2, 3, 4, 5].map(s => (
                                                                        <button key={s} onClick={() => updateProduct(idx, 'rating', prod.rating === s ? 0 : s)} className="transition hover:scale-125 focus:outline-none active:scale-90">
                                                                            <Star size={16} className={s <= prod.rating ? 'text-[#EEBE1C] fill-[#EEBE1C]' : 'text-[#304250]/20'} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs font-bold text-[#304250]/50">{prod.rating}/5</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addProduct} className="w-full py-4 border-2 border-dashed border-[#20A46B] bg-[#20A46B]/5 rounded-2xl text-[#20A46B] font-extrabold text-sm active:scale-[0.98] flex items-center justify-center gap-2 transition-all hover:bg-[#20A46B]/10">
                                        <Plus size={18} /> Add New Product
                                    </button>
                                </div>
                            )}

                            {/* ===== SETTINGS TAB ===== */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6 animate-in fade-in duration-300 w-full pb-10">
                                    {/* Store Slug */}
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-[#304250]/10 shadow-sm">
                                        <label className="text-xs font-extrabold uppercase text-[#304250] mb-2 flex items-center gap-1.5 tracking-wider"><Globe size={14} className="text-[#20A46B]" /> Store URL</label>
                                        <p className="text-xs text-[#304250]/60 font-medium mb-3">Claim your unique store link. Only lowercase letters, numbers, and hyphens allowed.</p>
                                        <div className="flex items-center border border-[#304250]/10 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 ring-[#20A46B]/20 focus-within:border-[#20A46B] transition-all">
                                            <span className="px-4 py-3 bg-gray-100 text-sm text-[#304250]/50 font-bold font-mono border-r border-[#304250]/10 flex items-center">zipsellix.com/</span>
                                            <input type="text" className="min-w-0 flex-1 px-4 py-3 text-sm font-bold outline-none text-[#304250] placeholder:text-[#304250]/30" placeholder="mystore"
                                                value={username} onChange={(e) => {
                                                    const val = e.target.value.toLowerCase();
                                                    setUsername(val.replace(new RegExp('[^a-z0-9-]', 'g'), ''));
                                                }} />
                                        </div>
                                    </div>

                                    {/* Theme Selector */}
                                    <div>
                                        <label className="text-xs font-extrabold uppercase text-[#304250]/60 mb-3 flex items-center gap-1.5 block tracking-wider"><Palette size={14} /> Color Theme</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {([
                                                { id: 'classic' as const, label: 'Classic Light', colors: ['bg-[#ffffff]', 'bg-[#20A46B]', 'bg-[#f8fafc]'] },
                                                { id: 'modern' as const, label: 'Modern Mint', colors: ['bg-[#20A46B]/10', 'bg-[#20A46B]', 'bg-[#ffffff]'] },
                                                { id: 'dark' as const, label: 'Midnight Dark', colors: ['bg-[#304250]', 'bg-[#20A46B]', 'bg-[#1e293b]'] },
                                            ]).map(t => (
                                                <button key={t.id} onClick={() => setProfile({ ...profile, theme: t.id })}
                                                    className={`p-4 rounded-2xl border-2 text-center transition-all bg-white
                                        ${profile.theme === t.id ? 'border-[#20A46B] ring-4 ring-[#20A46B]/10 shadow-[0_8px_30px_rgba(32,164,107,0.15)] scale-105' : 'border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50 shadow-sm'}`}>
                                                    <div className="flex justify-center items-center gap-1.5 mb-3">
                                                        {t.colors.map((c, i) => <div key={i} className={`w-6 h-6 rounded-full ${c} border border-[#304250]/10 shadow-sm`} />)}
                                                    </div>
                                                    <span className="text-[11px] font-extrabold text-[#304250] block uppercase tracking-wide">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PRO Features - FIXED: Made completely prominent Yellow */}
                                    <div className="border-2 border-[#EEBE1C] bg-[#EEBE1C]/10 p-5 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <label className="font-extrabold flex items-center gap-2 text-sm text-[#304250] tracking-wide"><Crown size={18} className="text-[#EEBE1C] fill-[#EEBE1C]" /> PRO Features</label>
                                                <p className="text-xs text-[#304250]/80 font-medium mt-1">Unlock tracking pixels and remove ZipSellix branding.</p>
                                            </div>
                                            <button onClick={() => setProfile({ ...profile, is_pro: !profile.is_pro })}
                                                className={`relative w-14 h-7 rounded-full transition-colors shadow-inner ${profile.is_pro ? 'bg-[#EEBE1C]' : 'bg-[#304250]/20'}`}>
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${profile.is_pro ? 'translate-x-8' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {profile.is_pro ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-[#EEBE1C]/30">
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#304250] bg-[#EEBE1C] px-4 py-2.5 rounded-xl shadow-sm">
                                                    <Check size={16} /> "Powered by" branding has been removed from your store.
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white p-4 rounded-xl border border-[#EEBE1C]/50 shadow-sm">
                                                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase mb-2 flex items-center gap-1.5 tracking-wider"><Facebook size={14} className="text-blue-600" /> Facebook Pixel ID</label>
                                                        <input type="text" className="min-w-0 w-full border border-[#304250]/10 p-2.5 rounded-lg text-sm font-bold text-[#304250] outline-none focus:border-[#EEBE1C] focus:ring-1 ring-[#EEBE1C]/30 transition-all font-mono placeholder:text-[#304250]/30 shadow-sm" placeholder="123456789012345"
                                                            value={profile.pixels.facebook} onChange={(e) => setProfile({ ...profile, pixels: { ...profile.pixels, facebook: e.target.value } })} />
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-[#EEBE1C]/50 shadow-sm">
                                                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase mb-2 flex items-center gap-1.5 tracking-wider">Google Analytics ID</label>
                                                        <input type="text" className="min-w-0 w-full border border-[#304250]/10 p-2.5 rounded-lg text-sm font-bold text-[#304250] outline-none focus:border-[#EEBE1C] focus:ring-1 ring-[#EEBE1C]/30 transition-all font-mono placeholder:text-[#304250]/30 shadow-sm" placeholder="G-XXXXXXXXXX"
                                                            value={profile.pixels.google} onChange={(e) => setProfile({ ...profile, pixels: { ...profile.pixels, google: e.target.value } })} />
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-[#EEBE1C]/50 shadow-sm col-span-2">
                                                        <label className="text-[11px] font-extrabold text-[#304250]/60 uppercase mb-2 flex items-center gap-1.5 tracking-wider"><div className="bg-black text-white p-0.5 rounded"><TikTokIcon size={10} /></div> TikTok Pixel ID</label>
                                                        <input type="text" className="min-w-0 w-full border border-[#304250]/10 p-2.5 rounded-lg text-sm font-bold text-[#304250] outline-none focus:border-[#EEBE1C] focus:ring-1 ring-[#EEBE1C]/30 transition-all font-mono placeholder:text-[#304250]/30 shadow-sm" placeholder="CXXXXXXXXXXXXXXXXX"
                                                            value={profile.pixels.tiktok} onChange={(e) => setProfile({ ...profile, pixels: { ...profile.pixels, tiktok: e.target.value } })} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/60 p-6 rounded-xl border border-[#304250]/5 text-center mt-2 shadow-inner">
                                                <Lock size={28} className="mx-auto mb-3 text-[#304250]/20" />
                                                <p className="text-sm text-[#304250] font-extrabold mb-1">PRO is currently disabled</p>
                                                <p className="text-xs text-[#304250]/60 font-medium">Toggle the switch above to preview PRO tracking features.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT: LIVE PREVIEW (PHONE MOCKUP) ===== */}
                    <div className="col-span-5 flex flex-col items-center justify-center bg-gray-50 rounded-[32px] border border-[#304250]/10 p-8 relative min-h-[500px] sticky top-8 self-start shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">

                        {/* FIXED: Real-time preview badge made solid Yellow with Dark Blue text */}
                        <div className="bg-[#EEBE1C] text-[#304250] px-5 py-2 rounded-full text-[10px] font-extrabold shadow-[0_8px_30px_rgba(238,190,28,0.3)] flex items-center gap-2.5 z-30 border border-[#EEBE1C]/50 ring-4 ring-white mb-6">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#304250] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#304250]"></span>
                            </span>
                            <span className="tracking-widest uppercase">Real-time Preview</span>
                        </div>

                        <div className={`w-[320px] h-[640px] border-[8px] border-[#304250] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col ${tc.bg} ${tc.text} transition-colors duration-500`}>
                            {/* iPhone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#304250] rounded-b-3xl z-20 flex justify-center pt-2">
                                <div className="w-12 h-1.5 bg-black/50 rounded-full" />
                            </div>

                            <div className="flex-1 overflow-y-auto pt-14 pb-20 px-5 custom-scrollbar">
                                <div className="text-center mb-6">
                                    {/* Store Logo in Preview */}
                                    <div className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center overflow-hidden bg-white relative">
                                        {profile.store_logo ? <img src={profile.store_logo} className="w-full h-full object-cover" alt="Store Logo" /> : <Store size={36} className="text-[#304250]/20" />}
                                    </div>
                                    <h2 className="font-black text-xl mb-1.5">{profile.display_name || 'My Awesome Store'}</h2>
                                    <p className={`text-xs px-2 leading-relaxed font-medium ${profile.theme === 'dark' ? 'text-white/60' : 'text-[#304250]/60'}`}>{profile.bio || 'Welcome to my online store.'}</p>

                                    {/* Trust Badges Preview */}
                                    {(profile.trust_badges.cod || profile.trust_badges.shipping || profile.trust_badges.fast) && (
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            {profile.trust_badges.cod && <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 ${tc.badge}`}><Shield size={10} /> COD</span>}
                                            {profile.trust_badges.shipping && <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 ${tc.badge}`}><Truck size={10} /> Shipping</span>}
                                            {profile.trust_badges.fast && <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 ${tc.badge}`}><Zap size={10} /> Fast</span>}
                                        </div >
                                    )}

                                    {/* Socials Preview */}
                                    {(profile.socials.instagram || profile.socials.tiktok || profile.socials.facebook) && (
                                        <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-[#304250]/10">
                                            {profile.socials.instagram && <a href={profile.socials.instagram} className="hover:scale-110 transition-transform p-1.5 bg-white rounded-full shadow-sm border border-[#304250]/5"><Instagram size={18} className="text-pink-600" /></a>}
                                            {profile.socials.tiktok && <a href={profile.socials.tiktok} className="hover:scale-110 transition-transform p-1.5 bg-white rounded-full shadow-sm border border-[#304250]/5"><div className="bg-black text-white p-0.5 rounded-full"><TikTokIcon size={12} /></div></a>}
                                            {profile.socials.facebook && <a href={profile.socials.facebook} className="hover:scale-110 transition-transform p-1.5 bg-white rounded-full shadow-sm border border-[#304250]/5"><Facebook size={18} className="text-blue-600" /></a>}
                                        </div>
                                    )}
                                </div >

                                {/* Custom Links Preview */}
                                {profile.links.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {profile.links.map(link => (
                                            <a href={link.url} key={link.id} target="_blank" rel="noreferrer" className={`block p-4 rounded-2xl text-center font-extrabold text-sm shadow-[0_4px_14px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2.5 transition active:scale-95 border ${tc.card}`}>
                                                {link.type === 'daraz' && <ShoppingBag size={16} className="text-orange-500" />}
                                                {link.type === 'website' && <Globe size={16} className="text-blue-500" />}
                                                {link.type === 'social' && <Share2 size={16} className="text-purple-500" />}
                                                {link.type === 'custom' && <LinkIcon size={16} className="opacity-50" />}
                                                {link.title || 'Visit Link'}
                                            </a>
                                        ))}
                                    </div >
                                )}

                                {/* Products Preview */}
                                {profile.products.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-extrabold text-[10px] uppercase mb-3 opacity-50 tracking-widest flex items-center gap-2"><ShoppingBag size={12} /> Store Products</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {profile.products.map(prod => (
                                                <div key={prod.id} className={`rounded-2xl overflow-hidden shadow-sm flex flex-col border ${tc.card}`}>
                                                    <div className="w-full h-28 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-[#304250]/5 shrink-0">
                                                        {prod.image ? <img src={prod.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={24} className="text-[#304250]/20" />}

                                                        {/* Status Badges */}
                                                        {(prod.stock === 'in-stock' || !prod.stock) && <span className="absolute top-1.5 right-1.5 bg-[#20A46B] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">In Stock</span>}
                                                        {/* FIXED: Yellow used for Limited Stock */}
                                                        {prod.stock === 'limited' && <span className="absolute top-1.5 right-1.5 bg-[#EEBE1C] text-[#304250] text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">Limited</span>}
                                                        {prod.stock === 'out-of-stock' && <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">Sold Out</span>}

                                                        {prod.discount && <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">Sale</span>}
                                                    </div>
                                                    <div className="p-2.5 flex flex-col flex-1">
                                                        <p className="font-extrabold text-[11px] truncate leading-tight mb-1">{prod.title || 'Product Name'}</p>
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            {prod.discount ? (
                                                                <>
                                                                    <span className="text-[10px] font-black text-red-500">Rs {prod.discount}</span>
                                                                    <span className="text-[8px] opacity-40 line-through font-bold">Rs {prod.price}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] font-black">Rs {prod.price || '0'}</span>
                                                            )}
                                                        </div>
                                                        {/* FIXED: Yellow stars */}
                                                        {prod.rating > 0 && <div className="flex gap-0.5 mb-2">{[1, 2, 3, 4, 5].map(s => (<Star key={s} size={8} className={s <= prod.rating ? 'text-[#EEBE1C] fill-[#EEBE1C]' : 'text-[#304250]/10'} />))}</div>}
                                                        <div className="mt-auto pt-2 border-t border-[#304250]/5">
                                                            {profile.whatsapp && prod.stock !== 'out-of-stock' ? (
                                                                <a href={profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(new RegExp('[^0-9]', 'g'), '')}` : '#'} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-1.5 ${tc.accent} text-[9px] py-1.5 rounded-lg font-extrabold transition active:scale-95 shadow-sm`}>
                                                                    <WhatsAppIcon size={10} /> Buy
                                                                </a>
                                                            ) : (
                                                                <button disabled className="w-full bg-gray-100 text-[#304250]/30 border border-[#304250]/10 text-[9px] py-1.5 rounded-lg font-extrabold cursor-not-allowed">
                                                                    {prod.stock === 'out-of-stock' ? 'Sold Out' : 'No WhatsApp'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div >
                                    </div >
                                )}

                                {!profile.is_pro && <div className="mt-8 text-center pb-4 opacity-40"><img src={profile.theme === 'dark' ? "/powered-by-badge-dark.svg" : "/powered-by-badge.svg"} alt="Powered by ZipSellix" className="h-5 mx-auto" /></div>}
                            </div >

                            {/* Floating WhatsApp Bubble in Preview */}
                            {profile.whatsapp && <div className="absolute bottom-6 right-5 z-30"><a href={`https://wa.me/${profile.whatsapp.replace(new RegExp('[^0-9]', 'g'), '')}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] flex items-center justify-center cursor-pointer active:scale-95 transition hover:scale-105"><WhatsAppIcon size={24} /></a></div>}
                        </div >
                    </div >
                </div >
            </div >

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #30425020; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #30425040; }
            `}</style>
        </div >
    );
}