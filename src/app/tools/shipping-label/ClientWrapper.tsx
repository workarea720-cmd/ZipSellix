'use client';
// src/app/tools/shipping-label/ClientWrapper.tsx
// Updated — 4 tabs: Label, Track, History, Bulk

import { useState } from 'react';
import { Tag, MapPin, List, Layers } from 'lucide-react';
import { useShippingLabelLogic } from './useShippingLabelLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';
import TrackingUI from './components/TrackingUI';
import ShipmentHistory from './components/ShipmentHistory';
import BulkShipment from './components/BulkShipment';

type ActiveTab = 'label' | 'track' | 'history' | 'bulk';

const TABS = [
    { id: 'label' as const, label: 'Create Label', icon: Tag },
    { id: 'track' as const, label: 'Track Order', icon: MapPin },
    { id: 'history' as const, label: 'My Shipments', icon: List },
    { id: 'bulk' as const, label: 'Bulk Shipment', icon: Layers },
];

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useShippingLabelLogic();
    const [activeTab, setActiveTab] = useState<ActiveTab>('label');

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">

            {/* Tab Bar */}
            <div className="bg-white border-b border-[#304250]/10 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center gap-1 h-14 overflow-x-auto no-scrollbar">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${isActive
                                            ? 'bg-[#20A46B]/10 text-[#20A46B]'
                                            : 'text-[#304250]/50 hover:text-[#304250] hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            );
                        })}

                        {/* Live dot for Track */}
                        {activeTab === 'track' && (
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                                <span className="w-2 h-2 rounded-full bg-[#20A46B] animate-pulse" />
                                <span className="text-xs font-bold text-[#304250]/40 uppercase tracking-widest hidden sm:block">Live Tracking</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'label' && (
                isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />
            )}
            {activeTab === 'track' && <TrackingUI />}
            {activeTab === 'history' && <ShipmentHistory />}
            {activeTab === 'bulk' && <BulkShipment />}
        </div>
    );
}