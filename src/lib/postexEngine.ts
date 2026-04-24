// src/lib/postexEngine.ts

export type Zone = 'city' | 'province' | 'nationwide';

interface RateCard {
    base0_5: number;   // Dot (.) hata kar underscore (_) laga diya
    base1: number;
    add0_5: number;
}

const POSTEX_RATES: Record<Zone, RateCard> = {
    city: { base0_5: 100, base1: 110, add0_5: 50 },
    province: { base0_5: 165, base1: 175, add0_5: 70 },
    nationwide: { base0_5: 175, base1: 185, add0_5: 80 }, // Inter-Province
};

const FUEL_SURCHARGE_PERCENT = 15;
const COD_FEE = 0;

export function calculateCourierCost(weight: number, zone: Zone) {
    const rates = POSTEX_RATES[zone];
    let baseCost = 0;

    // 1. Calculate Base Weight Cost
    if (weight <= 0.5) {
        baseCost = rates.base0_5;
    } else if (weight <= 1) {
        baseCost = rates.base1;
    } else {
        // Weight is greater than 1kg
        // First 1kg cost
        baseCost = rates.base1;

        // Remaining weight
        const remaining = weight - 1;
        // How many 0.5kg chunks? (Ceiled)
        const additionalChunks = Math.ceil(remaining / 0.5);

        baseCost += additionalChunks * rates.add0_5;
    }

    // 2. Apply Fuel Surcharge
    const fuelCost = baseCost * (FUEL_SURCHARGE_PERCENT / 100);

    // 3. Total
    const total = baseCost + fuelCost + COD_FEE;

    return {
        baseCost,
        fuelCost,
        total: Math.ceil(total) // Round up to nearest Rupee
    };
}