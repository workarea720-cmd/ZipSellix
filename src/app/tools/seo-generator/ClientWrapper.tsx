'use client';

import { useSeoGeneratorLogic } from './useSeoGeneratorLogic';
import DesktopUI from './components/DesktopUI';
import MobileUI from './components/MobileUI';
// Adjust the path below if your components folder is located elsewhere
import UpgradeModal from '../../../components/UpgradeModal';

export default function ClientWrapper({ isMobile }: { isMobile: boolean }) {
    const logic = useSeoGeneratorLogic();

    return (
        <>
            {isMobile ? <MobileUI logic={logic} /> : <DesktopUI logic={logic} />}

            {/* 👉 NEW: The Upgrade Modal sits on top of everything when triggered */}
            <UpgradeModal
                isOpen={logic.isModalOpen}
                onClose={() => logic.setIsModalOpen(false)}
            />
        </>
    );
}