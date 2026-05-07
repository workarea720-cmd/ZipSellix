// src/app/settings/page.tsx
// ── Simply import SettingsClient from its new location (components/settings/)

import SettingsClient from '@/components/settings/SettingsClient';

export const metadata = {
    title: 'Settings | ZipSellix',
};

export default function SettingsPage() {
    return <SettingsClient />;
}