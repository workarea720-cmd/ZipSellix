import { getIsMobile } from '../../../lib/device-detection';
import ClientWrapper from './ClientWrapper';
import { auth } from "@/auth";
import Link from "next/link";

export const metadata = {
    title: 'WhatsApp Manager & Verification | ZipSellix',
    description: 'Verify customers and manage WhatsApp orders seamlessly.',
};

export default async function WhatsAppManagerPage() {
    // 1. Server-Side Security Check
    const session = await auth();
    const isPro = session?.user?.planType === "PRO";

    // 2. Fetch Device Type
    const isMobile = await getIsMobile();

    // 3. The Locked State (Free Tier Banner)
    if (!isPro) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] p-4 font-sans">
                <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center max-w-2xl w-full">
                    <div className="bg-bg-subtle w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
                        <span className="text-5xl">💬</span>
                    </div>

                    <h2 className="text-3xl font-black text-[#304250] mb-4 tracking-tight">
                        In-App WhatsApp Manager
                    </h2>

                    <p className="text-base md:text-lg text-text-muted mb-8 leading-relaxed font-medium">
                        The Free tier allows you to generate links and open WhatsApp externally. Upgrade to <strong className="text-[#20A46B]">ZipSellix Pro</strong> to send and manage client messages directly from this dashboard—saving you hours of switching tabs!
                    </p>

                    <Link
                        href="/pricing"
                        className="inline-block bg-[#EEBE1C] text-[#304250] font-black tracking-wide text-lg py-4 px-10 rounded-xl shadow-md shadow-[#EEBE1C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Upgrade to Pro 🚀
                    </Link>
                </div>
            </div>
        );
    }

    // 4. The Unlocked State (Pro Tier Access)
    return <ClientWrapper isMobile={isMobile} />;
}