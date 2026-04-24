import { getIsMobile } from '../../../lib/device-detection';
import ClientWrapper from './ClientWrapper';

export const metadata = {
    title: 'Image Compressor | ZipSellix',
    description: 'Compress and optimize images locally without losing quality.',
};

export default async function ImageCompressorPage() {
    const isMobile = await getIsMobile();
    return <ClientWrapper isMobile={isMobile} />;
}