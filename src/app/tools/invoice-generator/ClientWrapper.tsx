"use client";

import { useInvoiceLogic } from './useInvoiceLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useInvoiceLogic();

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
