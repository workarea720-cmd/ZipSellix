import { getIsMobile } from '../../../lib/device-detection';
import ClientWrapper from './ClientWrapper';

// --- Server Component ---
export default async function PackingSlipPage() {
    const isMobile = await getIsMobile();
    return <ClientWrapper isMobile={isMobile} />;
}