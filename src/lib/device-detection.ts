import { headers } from 'next/headers';

export async function getIsMobile(): Promise<boolean> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    // Basic Regex for detecting mobile devices from user-agent strings.
    // It covers iPhone, iPad, Android, Android Tablets, and other common mobile devices.
    const isMobile = Boolean(
        userAgent.match(
            /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
    );

    return isMobile;
}
