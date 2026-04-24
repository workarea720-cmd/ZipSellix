import { z } from 'zod';

export type CourierType = string;
export type PaymentType = 'COD' | 'Prepaid';
export type TemplateType = 'postex' | 'tcs' | 'trax' | 'leopards' | 'minimal';

export const ShippingLabelSchema = z.object({
    // Logistics & System Fields
    courier: z.string().min(1, "Courier is required"),
    trackingNumber: z.string().optional(),
    shipmentId: z.string().optional(),
    shipmentStatus: z.string().optional(),
    routingCode: z.string().optional(),
    barcodeValue: z.string().optional(),
    qrData: z.string().optional(),

    orderRef: z.string().min(1, "Order Reference is required"),
    orderDate: z.string().optional(),

    // Package Details
    weight: z.string().min(1, "Weight is required"),
    pieces: z.string().min(1, "Pieces is required"),
    dimensions: z.string().optional(),
    contents: z.string().optional(),
    declaredValue: z.string().optional(),
    hsCode: z.string().optional(),

    // Financials
    paymentType: z.enum(['COD', 'Prepaid']),
    codAmount: z.number().min(0),

    // Sender Details (Pre-filled from Business Profile)
    senderName: z.string().min(1, "Sender Name is required"),
    senderAddress: z.string().min(5, "Sender Address is required"),
    senderCity: z.string().optional(),
    senderPhone: z.string().optional(),

    // Receiver Details
    receiverName: z.string().min(1, "Name is required"),
    receiverPhone: z.string().regex(/^(03\d{9}|\+92\d{10})$/, "Invalid phone format (e.g. 03001234567)"),
    receiverEmail: z.string().email("Invalid email").optional().or(z.literal('')),
    receiverAddress: z.string().min(5, "Address is too short"),
    receiverCity: z.string().min(1, "City is required"),
    receiverProvince: z.string().optional(),

    // Instructions & Services
    instructions: z.object({
        dontOpen: z.boolean(),
        fragile: z.boolean(),
        callFirst: z.boolean(),
        insurance: z.boolean(),
        signature: z.boolean(),
    }),

    specialInstructions: z.string().optional(),
    sellerLogo: z.string().optional(),
});

export type LabelData = z.infer<typeof ShippingLabelSchema>;