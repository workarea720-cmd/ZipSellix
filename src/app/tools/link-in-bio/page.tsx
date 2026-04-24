import { getIsMobile } from '../../../lib/device-detection';
import ClientWrapper from './ClientWrapper';

export const metadata = {
    title: 'WhatsApp Store Builder | ZipSellix',
    description: 'Build your custom Mini WhatsApp Store in minutes.',
};

export default async function WhatsAppStorePage() {
    const isMobile = await getIsMobile();
    return <ClientWrapper isMobile={isMobile} />;
}