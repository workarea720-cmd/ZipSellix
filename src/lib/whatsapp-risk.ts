// src/lib/whatsapp-risk.ts
// WhatsApp Pre-Order Verification Engine — Risk Calculator

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskFlag {
    label: string;
    severity: RiskLevel;
}

export interface RiskResult {
    score: number;       // 0–100
    level: RiskLevel;
    flags: RiskFlag[];
}

interface VerifyInput {
    name: string;
    phone: string;
    city: string;
    address: string;
}

const FAKE_NAMES = /^(unknown|test|abc|xyz|asdf?|admin|user|demo|na|n\/a|none|x+|\.+)$/i;
const PK_PHONE = /^0[3][0-9]{9}$/;                       // 03XX-XXXXXXX without dashes
const PK_CITIES = [
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar',
    'quetta', 'sialkot', 'gujranwala', 'hyderabad', 'bahawalpur', 'sargodha', 'gujrat',
    'sahiwal', 'mardan', 'sheikhupura', 'rahim yar khan', 'okara', 'wah cantt',
    'kasur', 'dera ghazi khan', 'nawabshah', 'jhang', 'chiniot', 'mingora', 'burewala',
    'kamalia', 'hafizabad', 'sadiqabad', 'abbottabad', 'mirpur', 'muzaffarabad',
    'swabi', 'mansehra', 'kohat', 'dera ismail khan', 'turbat', 'hub', 'chaman',
];

export function calculateRisk(input: VerifyInput): RiskResult {
    const flags: RiskFlag[] = [];
    let score = 0;

    // ── Phone validation ──────────────────────────────────────────
    const cleanPhone = input.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone) {
        flags.push({ label: 'Phone number is missing', severity: 'High' });
        score += 40;
    } else if (cleanPhone.length !== 11 || !PK_PHONE.test(cleanPhone)) {
        flags.push({ label: 'Invalid phone format (expected 03XX-XXXXXXX)', severity: 'High' });
        score += 35;
    } else if (/(.)\1{6,}/.test(cleanPhone)) {
        flags.push({ label: 'Suspicious phone: repeated digits', severity: 'High' });
        score += 40;
    }

    // ── Address validation ────────────────────────────────────────
    const addr = input.address.trim();
    if (!addr) {
        flags.push({ label: 'Address is empty', severity: 'High' });
        score += 30;
    } else if (addr.length < 10) {
        flags.push({ label: 'Address too short — house/street details missing', severity: 'High' });
        score += 25;
    } else if (!/\d/.test(addr)) {
        flags.push({ label: 'Address has no house/street number', severity: 'Medium' });
        score += 10;
    }

    // ── Name validation ───────────────────────────────────────────
    const name = input.name.trim();
    if (!name || name.length < 2) {
        flags.push({ label: 'Customer name is missing or too short', severity: 'Medium' });
        score += 15;
    } else if (FAKE_NAMES.test(name)) {
        flags.push({ label: `Suspicious name pattern: "${name}"`, severity: 'Medium' });
        score += 15;
    }

    // ── City validation ───────────────────────────────────────────
    const city = input.city.trim().toLowerCase();
    if (!city) {
        flags.push({ label: 'City is missing', severity: 'Medium' });
        score += 15;
    } else if (!PK_CITIES.includes(city)) {
        flags.push({ label: 'City not in known Pakistani cities list', severity: 'Medium' });
        score += 5;
    }

    // ── Final ─────────────────────────────────────────────────────
    score = Math.min(score, 100);
    const level: RiskLevel = score >= 50 ? 'High' : score >= 20 ? 'Medium' : 'Low';

    if (flags.length === 0) {
        flags.push({ label: 'All fields properly formatted', severity: 'Low' });
    }

    return { score, level, flags };
}

// ── WhatsApp link generator ───────────────────────────────────────
export function makeWhatsAppLink(phone: string, message: string): string {
    const clean = phone.replace(/[\s\-()]/g, '');
    const intl = clean.startsWith('0') ? `92${clean.slice(1)}` : clean;
    return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

// ── Message templates ─────────────────────────────────────────────
export function getTemplates(name: string, address: string) {
    return {
        confirmation: `Asalam o Alaikum ${name}, this is to confirm your recent order. Please reply with 'YES' to dispatch your parcel. Total COD: [Amount].`,
        recheck: `Hi ${name}, your delivery address '${address}' seems incomplete. Please provide your complete street/house number for timely delivery.`,
        codReminder: `Dear ${name}, your parcel is arriving today. Please keep the exact cash amount ready for the rider.`,
    };
}
