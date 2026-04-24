import { create } from 'zustand';
import { LabelData, TemplateType } from '@/types/shipping-label';

interface ShippingLabelStore {
    data: LabelData;
    template: TemplateType;
    setTemplate: (t: TemplateType) => void;
    updateData: (d: Partial<LabelData>) => void;
    setInstructions: (key: keyof LabelData['instructions'], val: boolean) => void;
}

const initialData: LabelData = {
    courier: '',
    trackingNumber: '',
    routingCode: '',
    barcodeValue: '',
    qrData: '',
    orderRef: '',
    orderDate: new Date().toISOString().split('T')[0],
    weight: '0.5',
    pieces: '1',
    dimensions: '',
    contents: '',
    declaredValue: '',
    hsCode: '',

    paymentType: 'COD',
    codAmount: 0,

    senderName: '',
    senderAddress: '',
    senderPhone: '',

    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    receiverCity: '',
    receiverProvince: '',

    specialInstructions: '',

    instructions: {
        dontOpen: false,
        fragile: false,
        callFirst: false,
        insurance: false,
        signature: false
    }
};

export const useLabelStore = create<ShippingLabelStore>((set) => ({
    data: initialData,
    template: 'postex',
    setTemplate: (t) => set({ template: t }),
    updateData: (d) => set((state) => ({ data: { ...state.data, ...d } })),
    setInstructions: (key, val) => set((state) => ({
        data: { ...state.data, instructions: { ...state.data.instructions, [key]: val } }
    }))
}));