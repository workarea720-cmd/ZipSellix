'use client';

import { useImageCompressorLogic } from './useImageCompressorLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useImageCompressorLogic();

    return isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />;
}
