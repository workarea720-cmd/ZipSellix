"use client";

import { useShippingLabelLogic } from './useShippingLabelLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useShippingLabelLogic();

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
