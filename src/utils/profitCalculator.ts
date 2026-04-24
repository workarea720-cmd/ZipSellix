/**
 * 🇵🇰 Pakistan E-Commerce Profit Calculator Engine
 * Targets: Tax Year 2025 Regulations
 */

// --- 1. Constants & Rates ---

export type Province = 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'Islamabad' | 'AJK' | 'Gilgit';
export type Courier = 'TCS' | 'Leopards' | 'Trax' | 'PostEx' | 'MnP';
export type PaymentMethod = 'COD' | 'Online'; // Online = Card/JazzCash/EasyPaisa

const TAX_RATES = {
  // Federal GST on Goods
  GST_GOODS: 0.18, 
  
  // Provincial Sales Tax on Services (Applied to Shipping Cost)
  SERVICE_TAX: {
    Punjab: 0.16,
    Sindh: 0.15, 
    KPK: 0.15,
    Balochistan: 0.15,
    Islamabad: 0.15,
    AJK: 0.16,
    Gilgit: 0.00,
  } as Record<Province, number>,

  // Withholding Tax (Deducted from Revenue)
  WHT: {
    COD: 0.02,    // 2% deducted by courier on cash collection
    Online: 0.01, // 1% deducted by gateway
  }
};

// Approximate Base Rates for 1kg Parcel (Zone A/B blended avg)
const COURIER_RATES_PKR: Record<Courier, number> = {
  TCS: 320,
  Leopards: 280,
  Trax: 240,
  PostEx: 220,
  MnP: 260
};

// --- 2. Input/Output Interfaces ---

interface ProfitInputs {
  sellingPrice: number;     // Price customer pays
  costPrice: number;        // Sourcing cost
  marketingCost: number;    // FB/TikTok Ads per sale
  courier: Courier;
  province: Province;       // Destination Province (affects shipping tax)
  paymentMethod: PaymentMethod;
  weightKg?: number;        // Default 1kg if undefined
  isFiler?: boolean;        // Optional: Future use for exact tax adjustments
}

export interface ProfitResult {
  netProfit: number;
  marginPercentage: string;
  currency: string;
  breakdown: {
    revenue: {
      gross: number;
      whtDeduction: number; // The hidden tax
      netReceived: number;  // What actually hits the bank
    };
    costs: {
      product: number;
      marketing: number;
      shippingBase: number;
      shippingTax: number;
      shippingTotal: number;
    };
    taxes: {
      gstOnProduct: number; // If applicable (for accounting)
      totalTaxPaid: number; // WHT + Shipping Tax
    };
  };
}

// --- 3. The Calculation Logic ---

export function calculateProfit(inputs: ProfitInputs): ProfitResult {
  const { 
    sellingPrice, 
    costPrice, 
    marketingCost, 
    courier, 
    province, 
    paymentMethod, 
    weightKg = 1 
  } = inputs;

  // A. Shipping Calculation
  // Logic: Base rate + (Weight - 1) * 50% of Base Rate (Simple estimation rule)
  let baseShipping = COURIER_RATES_PKR[courier];
  if (weightKg > 1) {
    baseShipping += (Math.ceil(weightKg) - 1) * (baseShipping * 0.5);
  }

  // Calculate Provincial Tax on Shipping
  const shippingTaxRate = TAX_RATES.SERVICE_TAX[province];
  const shippingTax = baseShipping * shippingTaxRate;
  const totalShippingCost = baseShipping + shippingTax;

  // B. Revenue Deductions (WHT)
  const whtRate = TAX_RATES.WHT[paymentMethod];
  const whtDeduction = sellingPrice * whtRate;
  const netRevenueReceived = sellingPrice - whtDeduction;

  // C. GST (For Reference/Accounting)
  // We assume Selling Price is Tax Inclusive for the customer
  // Formula: Price / 1.18 * 0.18
  const gstOnProduct = (sellingPrice / (1 + TAX_RATES.GST_GOODS)) * TAX_RATES.GST_GOODS;

  // D. Final Profit
  // Net Profit = (Money In Bank) - (Product Cost + Ads + Shipping Paid)
  // Note: We subtract totalShippingCost because usually seller pays shipping.
  const totalCosts = costPrice + marketingCost + totalShippingCost;
  const netProfit = netRevenueReceived - totalCosts;
  
  const margin = (netProfit / sellingPrice) * 100;

  return {
    netProfit: Math.round(netProfit),
    marginPercentage: margin.toFixed(2) + "%",
    currency: "PKR",
    breakdown: {
      revenue: {
        gross: sellingPrice,
        whtDeduction: Math.round(whtDeduction),
        netReceived: Math.round(netRevenueReceived)
      },
      costs: {
        product: costPrice,
        marketing: marketingCost,
        shippingBase: Math.round(baseShipping),
        shippingTax: Math.round(shippingTax),
        shippingTotal: Math.round(totalShippingCost)
      },
      taxes: {
        gstOnProduct: Math.round(gstOnProduct),
        totalTaxPaid: Math.round(whtDeduction + shippingTax)
      }
    }
  };
}

// --- 4. Example Usage (For Testing) ---
/*
const result = calculateProfit({
  sellingPrice: 3000,
  costPrice: 1200,
  marketingCost: 500,
  courier: 'Trax',
  province: 'Punjab',
  paymentMethod: 'COD'
});
console.log(result);
*/