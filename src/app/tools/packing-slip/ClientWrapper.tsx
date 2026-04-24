"use client";

import { usePackingSlipLogic } from './usePackingSlipLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = usePackingSlipLogic();

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
