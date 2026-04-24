import SettingsClient from '@/app/settings/SettingsClient';

export const metadata = {
    title: 'Settings | ZipSellix',
    description: 'Manage your business profile, logistics, and account settings.',
};

export default function SettingsPage() {
    return <SettingsClient />;
}
