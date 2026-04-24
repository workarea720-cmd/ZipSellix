import ClientWrapper from './ClientWrapper';
import { getIsMobile } from '../../../lib/device-detection';

export const metadata = {
    title: 'Background Remover | ZipSellix',
    description: 'Remove and edit image backgrounds instantly using AI.',
};

export default async function BackgroundRemoverPage() {
    const isMobile = await getIsMobile();
    return <ClientWrapper isMobile={isMobile} />;
}