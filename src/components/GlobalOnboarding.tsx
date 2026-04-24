"use client";
import React, { useState } from 'react';
import {
    Building2, ArrowRight, ArrowLeft, Check, Share2, Truck,
    DollarSign, Trash2, ChevronDown, Package, MapPin, Globe, Plus
} from 'lucide-react';
import {
    useBusinessStore, COURIER_PRESETS, PROVINCES,
    SALES_CHANNEL_OPTIONS, COURIER_NAMES, type CourierRate
} from '@/store/business-store';
import { toast } from 'sonner';
import CustomDropdown from './CustomDropdown';

interface Props { onComplete: () => void; }

const STEPS = [
    { label: 'Type', icon: Package },
    { label: 'Basics', icon: Building2 },
    { label: 'Channels', icon: Share2 },
    { label: 'Rates', icon: Truck },
    { label: 'Costs', icon: DollarSign },
];

export default function GlobalOnboardingWizard({ onComplete }: Props) {
    const store = useBusinessStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [ownerName, setOwnerName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState<'STOCK' | 'SERVICE' | ''>(''); // 👈 Updated Types
    const [city, setCity] = useState('');
    const [province, setProvince] = useState<string>('Punjab');
    const [channels, setChannels] = useState<string[]>([]);
    const [couriers, setCouriers] = useState<CourierRate[]>([]);
    const [hosting, setHosting] = useState(0);
    const [internet, setInternet] = useState(0);
    const [rent, setRent] = useState(0);
    const [salary, setSalary] = useState(0);
    const [packaging, setPackaging] = useState(0);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customName, setCustomName] = useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const customInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleCustomCourierAdd = () => {
        if (!customName.trim()) return;
        addCourier(customName);
        setCustomName('');
        setShowCustomInput(false);
    }

    const totalExpense = Number(hosting) + Number(internet) + Number(rent) + Number(salary);
    const toggleChannel = (ch: string) => setChannels(p => p.includes(ch) ? p.filter(c => c !== ch) : [...p, ch]);

    const addCourier = (name: string) => {
        if (!name || couriers.some(c => c.courierName === name)) return;
        const preset = COURIER_PRESETS[name] || { sameCity: 0, sameProvince: 0, crossProvince: 0, extraKg: 0 };
        setCouriers([...couriers, { courierName: name, ...preset }]);
    };

    const removeCourier = (i: number) => setCouriers(couriers.filter((_, idx) => idx !== i));
    const updateRate = (i: number, field: keyof CourierRate, val: string) => {
        const u = [...couriers]; (u[i] as any)[field] = Number(val); setCouriers(u);
    };

    const canNext = step === 1 ? businessType !== '' : (step === 2 ? ownerName.trim() && businessName.trim() : true);

    const handleSubmit = async () => {
        setLoading(true);
        store.setAccount({ name: ownerName });
        store.setBusinessInfo({ businessName, city, province, businessType });
        store.setSalesChannels(channels);
        store.setCouriers(couriers);
        store.setExpenses({ hosting: Number(hosting), internet: Number(internet), rent: Number(rent), salary: Number(salary), packagingCost: Number(packaging) });
        await store.saveProfile();
        setTimeout(() => { setLoading(false); toast.success('Business setup complete!'); onComplete(); }, 400);
    };

    // ── Step indicator ────────────────────────────────────────────────
    const renderStepIndicator = () => (
        <div className="flex items-center justify-between relative mt-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bg-muted rounded-full z-0 overflow-hidden">
                <div
                    className="h-full bg-brand-primary transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                />
            </div>
            {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = step === i + 1;
                const done = step > i + 1;
                return (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${active ? 'bg-brand-primary text-white shadow-brand-primary/20 ring-4 ring-brand-primary-light'
                            : done ? 'bg-brand-primary-light text-brand-primary border border-brand-primary/30'
                                : 'bg-card-bg text-slate-300 border border-card-border'
                            }`}>
                            {done ? <Check size={16} strokeWidth={3} /> : <Icon size={18} />}
                        </div>
                        <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? 'text-brand-primary' : done ? 'text-text-muted' : 'text-text-muted-light'
                            }`}>
                            {s.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    // ── Step bodies ───────────────────────────────────────────────────
    const renderStepContent = () => {
        if (step === 1) return (
            <div className="space-y-6">
                <div className="text-center md:text-left mb-6">
                    <h3 className="text-2xl font-black text-text-main tracking-tight">What do you sell?</h3>
                    <p className="text-text-muted mt-1.5 text-sm font-medium">This helps us customize the platform for your specific needs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 👇 Updated to use 'STOCK' */}
                    <button
                        onClick={() => { setBusinessType('STOCK'); setStep(2); }}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden ${businessType === 'STOCK' ? 'border-brand-primary bg-brand-primary-light shadow-md shadow-brand-primary/10' : 'border-card-border bg-card-bg hover:border-slate-300 hover:bg-bg-subtle'
                            }`}
                    >
                        {businessType === 'STOCK' && (
                            <div className="absolute top-4 right-4 text-brand-primary animate-in zoom-in duration-200">
                                <Check size={20} strokeWidth={3} />
                            </div>
                        )}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${businessType === 'STOCK' ? 'bg-card-bg shadow-sm text-brand-primary' : 'bg-bg-muted text-text-muted-light'
                            }`}>
                            <Package size={28} />
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${businessType === 'STOCK' ? 'text-brand-primary' : 'text-text-main'}`}>Physical Products</h4>
                        <p className="text-sm font-medium text-text-muted">I sell inventory, ship parcels, and need courier integrations.</p>
                    </button>

                    {/* 👇 Updated to use 'SERVICE' */}
                    <button
                        onClick={() => { setBusinessType('SERVICE'); setStep(2); }}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden ${businessType === 'SERVICE' ? 'border-brand-primary bg-brand-primary-light shadow-md shadow-brand-primary/10' : 'border-card-border bg-card-bg hover:border-slate-300 hover:bg-bg-subtle'
                            }`}
                    >
                        {businessType === 'SERVICE' && (
                            <div className="absolute top-4 right-4 text-brand-primary animate-in zoom-in duration-200">
                                <Check size={20} strokeWidth={3} />
                            </div>
                        )}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${businessType === 'SERVICE' ? 'bg-card-bg shadow-sm text-brand-primary' : 'bg-bg-muted text-text-muted-light'
                            }`}>
                            <Building2 size={28} />
                        </div>
                        <h4 className={`text-lg font-bold mb-1 ${businessType === 'SERVICE' ? 'text-brand-primary' : 'text-text-main'}`}>Digital / Services</h4>
                        <p className="text-sm font-medium text-text-muted">I provide services, consulting, or sell digital assets.</p>
                    </button>
                </div>
            </div>
        );
        if (step === 2) return (
            <div className="space-y-6">
                <div className="text-center md:text-left mb-6">
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Tell us about your business</h3>
                    <p className="text-text-muted mt-1.5 text-sm font-medium">This information will be used on your generated documents.</p>
                </div>

                <div className="bg-card-bg rounded-2xl border border-card-border p-5 sm:p-6 shadow-sm shadow-slate-100/50 hover:border-brand-primary/30 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Owner Name *" value={ownerName} onChange={setOwnerName} placeholder="E.g. Ali Khan" icon={<Building2 size={16} />} />
                        <Field label="Business Name *" value={businessName} onChange={setBusinessName} placeholder="E.g. MyStore.pk" icon={<Package size={16} />} />
                        <Field label="City" value={city} onChange={setCity} placeholder="E.g. Lahore" icon={<MapPin size={16} />} />
                        <div className="space-y-2 z-50 relative">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Province</label>
                            <CustomDropdown options={PROVINCES} value={province} onChange={setProvince} />
                        </div>
                    </div>
                </div>
            </div>
        );

        if (step === 3) return (
            <div className="space-y-6">
                <div className="text-center md:text-left mb-6">
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Sales Channels</h3>
                    <p className="text-text-muted mt-1.5 text-sm font-medium">Select all the platforms where you currently sell your products.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {SALES_CHANNEL_OPTIONS.map(ch => {
                        const isSelected = channels.includes(ch);
                        let logoUrl = '';
                        if (ch === 'WhatsApp') logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
                        else if (ch === 'Facebook') logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg';
                        else if (ch === 'Instagram') logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg';
                        else if (ch === 'Shopify') logoUrl = 'https://cdn.simpleicons.org/shopify/95BF47';
                        else if (ch === 'TikTok') logoUrl = 'https://cdn.simpleicons.org/tiktok/000000';

                        return (
                            <button key={ch} onClick={() => toggleChannel(ch)}
                                className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${isSelected
                                    ? 'bg-brand-primary-light border-brand-primary text-brand-primary shadow-sm'
                                    : 'bg-card-bg border-card-border text-text-muted hover:border-slate-300 hover:bg-bg-subtle'
                                    }`}>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 text-brand-primary animate-in zoom-in duration-200">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-card-bg shadow-sm' : 'bg-bg-muted'}`}>
                                    {ch === 'Daraz' ? (
                                        <svg viewBox="0 0 100 100" className={`w-6 h-6 object-contain ${isSelected ? '' : 'opacity-80'}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="100" height="100" rx="20" fill="#F85606" />
                                            <polygon points="28,48 50,36 50,84 28,72" fill="#D2F4F4" />
                                            <polygon points="50,36 50,12 72,24 72,72 50,84" fill="#D2F4F4" />
                                            <polygon points="50,44 72,56 50,68" fill="#F85606" />
                                        </svg>
                                    ) : ch === 'Website' ? (
                                        <Globe size={20} className={isSelected ? "text-brand-primary" : "text-text-muted-light"} />
                                    ) : logoUrl ? (
                                        <img src={logoUrl} alt={ch} className={`w-6 h-6 object-contain ${isSelected || logoUrl.includes('tiktok') ? '' : 'opacity-80'}`} />
                                    ) : (
                                        <Share2 size={24} className={isSelected ? "text-brand-primary" : "text-text-muted-light"} />
                                    )}
                                </div>
                                <span className="text-sm font-bold">{ch}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
        if (step === 4) return (
            <div className="space-y-6">
                <div className="text-center md:text-left mb-6">
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Courier Rates</h3>
                    <p className="text-text-muted mt-1.5 text-sm font-medium">Add the delivery companies you use to calculate accurate shipping costs.</p>
                </div>

                <div className="z-50 relative bg-card-bg p-4 sm:p-5 rounded-2xl border border-card-border shadow-sm shadow-slate-100/50">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Add a Courier</label>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="relative flex-1" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-bg-subtle hover:bg-card-bg border-2 border-card-border-subtle text-text-main py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-between gap-2 shadow-sm focus:border-brand-primary focus:bg-card-bg focus:ring-4 focus:ring-brand-primary/10 transition-all text-left"
                            >
                                <span className="flex items-center gap-2 text-text-muted">
                                    <Plus size={16} className="text-brand-primary" />
                                    Select courier company...
                                </span>
                                <ChevronDown size={16} className={`text-text-muted-light transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-card-bg border border-card-border rounded-xl shadow-xl z-[999] overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {COURIER_NAMES.filter(c => c !== 'Other' && !couriers.some(r => r.courierName.toLowerCase() === c.toLowerCase())).map(name => (
                                            <div
                                                key={name}
                                                onClick={() => {
                                                    addCourier(name)
                                                    setIsDropdownOpen(false)
                                                    setShowCustomInput(false)
                                                }}
                                                className="px-4 py-3 text-sm font-semibold cursor-pointer transition text-text-main hover:bg-bg-subtle hover:text-brand-primary"
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-card-border-subtle" />
                                    <div
                                        onClick={() => {
                                            setShowCustomInput(true)
                                            setIsDropdownOpen(false)
                                        }}
                                        className="px-4 py-3 text-sm font-bold cursor-pointer transition text-brand-primary hover:bg-brand-primary-light flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Other (Custom Name)
                                    </div>
                                </div>
                            )}
                        </div>

                        {showCustomInput && (
                            <div className="flex items-center gap-2 flex-1 sm:flex-none animate-in zoom-in-95 duration-200">
                                <input
                                    ref={customInputRef}
                                    type="text"
                                    placeholder="Courier Name"
                                    className="px-4 py-2.5 border-2 border-brand-primary bg-brand-primary-light/30 rounded-xl text-sm outline-none focus:ring-4 focus:ring-brand-primary/20 w-full font-semibold focus:bg-card-bg transition-all shadow-sm"
                                    value={customName}
                                    onChange={e => setCustomName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCustomCourierAdd()
                                        if (e.key === 'Escape') {
                                            setShowCustomInput(false)
                                            setCustomName('')
                                        }
                                    }}
                                    autoFocus
                                />
                                <button
                                    onClick={handleCustomCourierAdd}
                                    className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary-hover transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {couriers.length > 0 && (
                    <div className="space-y-3">
                        {couriers.map((c, i) => (
                            <div key={i} className="bg-card-bg border-2 border-card-border-subtle rounded-2xl p-4 sm:p-5 shadow-sm hover:border-card-border transition-colors group">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
                                            <Truck size={16} />
                                        </div>
                                        <span className="font-bold text-base text-text-main">{c.courierName}</span>
                                    </div>
                                    <button onClick={() => removeCourier(i)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {(['sameCity', 'sameProvince', 'crossProvince', 'extraKg'] as const).map(f => (
                                        <div key={f} className="space-y-1.5 relative">
                                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                {f === 'sameCity' ? 'Same City' : f === 'sameProvince' ? 'Same Prov' : f === 'crossProvince' ? 'Cross Prov' : 'Extra /Kg'}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light text-xs font-medium">Rs</span>
                                                <input type="number" min={0} value={c[f]} onChange={e => updateRate(i, f, e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 text-sm border-2 border-card-border-subtle rounded-xl font-bold text-text-main outline-none focus:border-brand-primary focus:bg-card-bg bg-bg-subtle transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
        return (
            <div className="space-y-6">
                <div className="text-center md:text-left mb-6">
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Fixed Costs</h3>
                    <p className="text-text-muted mt-1.5 text-sm font-medium">Set your regular monthly expenses to calculate true net profit.</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-card-bg text-amber-500 flex items-center justify-center shadow-sm shrink-0">
                                <Package size={20} />
                            </div>
                            <div>
                                <p className="text-base font-bold text-amber-900">Packaging Cost</p>
                                <p className="text-xs font-medium text-amber-700/80 mt-0.5">Average cost of flyer, tape & bubble wrap per order.</p>
                            </div>
                        </div>
                        <div className="relative shrink-0 w-full sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/60 font-medium">Rs</span>
                            <input type="number" min={0} value={packaging} onChange={e => setPackaging(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-2.5 text-base border-2 border-amber-200 rounded-xl font-bold text-amber-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 bg-card-bg transition-all shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden shadow-sm shadow-slate-100/50">
                    <div className="px-5 py-4 bg-bg-subtle border-b border-card-border-subtle">
                        <h4 className="font-bold text-sm text-text-main uppercase tracking-wider">Monthly Expenses</h4>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[{ l: 'Hosting', v: hosting, s: setHosting }, { l: 'Internet', v: internet, s: setInternet }, { l: 'Rent / Ads', v: rent, s: setRent }, { l: 'Salaries', v: salary, s: setSalary }].map(item => (
                            <div key={item.l} className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{item.l}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light text-xs font-medium">Rs</span>
                                    <input type="number" min={0} value={item.v} onChange={e => item.s(Number(e.target.value))}
                                        className="w-full pl-8 pr-3 py-2.5 text-sm border-2 border-card-border-subtle rounded-xl font-bold text-text-main outline-none focus:border-brand-primary focus:bg-card-bg bg-bg-subtle transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-4 bg-brand-primary-light/50 border-t border-card-border-subtle flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wide">Total Fixed Monthly</span>
                        <span className="text-xl font-black text-brand-primary">Rs {totalExpense.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    // ── Navigation buttons ────────────────────────────────────────────
    const renderNavButtons = () => (
        <div className="flex items-center justify-between w-full">
            {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-text-muted hover:text-text-main bg-bg-muted hover:bg-slate-200 rounded-xl transition-colors w-full sm:w-auto">
                    <ArrowLeft size={16} /> Back
                </button>
            ) : <div className="hidden sm:block" />}

            {step < 5 ? (
                <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
                    className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto mt-3 sm:mt-0">
                    Continue <ArrowRight size={16} />
                </button>
            ) : (
                <button onClick={handleSubmit} disabled={loading}
                    className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50 w-full sm:w-auto mt-3 sm:mt-0">
                    {loading ? 'Saving...' : <><Check size={16} strokeWidth={3} /> Complete Setup</>}
                </button>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#F8FAFC]">
            {/* ── Modern Header ── */}
            <div className="bg-card-bg border-b border-card-border px-4 sm:px-8 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <img
                        src="/wordmark-logo.svg"
                        alt="ZipSellix"
                        className="h-8 md:h-10 w-auto"
                    />
                    <div className="ml-2 border-l-2 border-slate-200 pl-3">
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Store Setup</p>
                    </div>
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Stepper */}
                    <div className="mb-10 px-2 sm:px-8">
                        {renderStepIndicator()}
                    </div>

                    {/* Step Card */}
                    <div key={step} className="bg-card-bg sm:bg-transparent sm:border-none border border-card-border rounded-3xl p-5 sm:p-0 mb-8 animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out fill-mode-both">
                        {renderStepContent()}
                    </div>
                </div>
            </div>

            {/* ── Sticky Bottom Bar ── */}
            <div className="bg-card-bg border-t border-card-border p-4 sm:p-6 shrink-0 z-50">
                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    {renderNavButtons()}
                </div>
            </div>
        </div>
    );
}

// ── Reusable input field ──────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted-light pointer-events-none">{icon}</div>}
                <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className={`w-full py-2.5 pr-3 bg-bg-subtle border-2 border-card-border-subtle rounded-xl text-sm font-semibold text-text-main outline-none focus:bg-card-bg focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-text-muted-light ${icon ? 'pl-10' : 'pl-3.5'}`} />
            </div>
        </div>
    );
}