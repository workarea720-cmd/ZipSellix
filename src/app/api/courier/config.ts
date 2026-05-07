// src/app/api/courier/config.ts
// ─────────────────────────────────────────────────────────────────────
// JAB REAL API KEYS MILEIN — SIRF YAHAN ADD KARO, BAAKI CODE NAHI BADLEGA
// ─────────────────────────────────────────────────────────────────────

export const COURIER_CONFIG = {
    postex: {
        enabled: !!process.env.POSTEX_API_TOKEN,
        apiToken: process.env.POSTEX_API_TOKEN || '',
        baseUrl: 'https://api.postex.pk/services/integration/api',
        // Jab keys milein: POSTEX_API_TOKEN=xxx .env mein add karo
    },
    leopards: {
        enabled: !!(process.env.LEOPARDS_API_KEY && process.env.LEOPARDS_API_PASSWORD),
        apiKey: process.env.LEOPARDS_API_KEY || '',
        apiPassword: process.env.LEOPARDS_API_PASSWORD || '',
        baseUrl: 'https://www.leopardscourier.com/api',
        // Jab keys milein: LEOPARDS_API_KEY=xxx, LEOPARDS_API_PASSWORD=xxx
    },
} as const;

export type CourierName = 'PostEx' | 'Leopards' | 'TCS' | 'Trax' | 'CallCourier' | 'M&P';

// Mock mode: agar koi API key nahi to realistic fake data return karo
export const IS_MOCK_MODE = !COURIER_CONFIG.postex.enabled && !COURIER_CONFIG.leopards.enabled;