"use client";

import { useSession } from 'next-auth/react';
import { useInvoiceLogic } from './useInvoiceLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const { data: session } = useSession();
    const isPro = session?.user?.planType?.toUpperCase() === 'PRO';
    const logic = useInvoiceLogic(isPro);

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}