'use client';

import { useWhatsAppManagerLogic } from './useWhatsAppManagerLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useWhatsAppManagerLogic();

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
