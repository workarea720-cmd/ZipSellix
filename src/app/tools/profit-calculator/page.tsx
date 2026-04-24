import { getIsMobile } from '../../../lib/device-detection';
import ZipSellixClient from '@/app/tools/profit-calculator/ZipSellixClient';

export const metadata = {
    title: 'ZipSellix Dashboard | ZipSellix',
    description: 'Manage your eCommerce business efficiently.',
};

export default async function ZipSellixPage() {
    const isMobile = await getIsMobile();
    return <ZipSellixClient isMobile={isMobile} />;
}
