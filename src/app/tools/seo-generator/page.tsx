import { getIsMobile } from '../../../lib/device-detection';
import ClientWrapper from './ClientWrapper';

export const metadata = {
    title: 'SEO Generator | ZipSellix',
    description: 'Generate perfectly optimized product titles, descriptions, and FAQs instantly.',
};

export default async function SeoGeneratorPage() {
    const isMobile = await getIsMobile();
    return <ClientWrapper isMobile={isMobile} />;
}