export type TemplateType = 'standard' | 'warehouse' | 'thermal' | 'modern' | 'gift' | 'minimal';

export interface LineItem {
    id: string;
    sku: string;
    name: string;
    variant: string;
    quantity: number;
    binLocation?: string; // Useful for Warehouse template
}

export interface PackingSlipData {
    // Sender (Business)
    senderName: string;
    senderAddress: string;
    senderPhone: string;
    logoUrl?: string; // ✅ New: Base64 or URL

    // Receiver
    receiverName: string;
    receiverAddress: string;
    receiverCity: string;
    receiverProvince?: string; // ✅ New: Province/State
    receiverPhone: string; // ✅ Renamed from "Phone (COD)"

    // Order Details
    orderId: string;
    orderDate: string;
    shippingMethod: string;
    totalWeight: string;

    // Items
    items: LineItem[];

    // Notes
    internalNotes?: string; // ✅ Warehouse specific
    customerNotes?: string; // ✅ Public facing
}