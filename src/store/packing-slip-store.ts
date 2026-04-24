import { create } from 'zustand';
import { PackingSlipData, TemplateType } from '@/types/packing-slip';

interface PackingSlipStore {
    data: PackingSlipData;
    template: TemplateType;
    setTemplate: (t: TemplateType) => void;
    updateData: (d: Partial<PackingSlipData>) => void;
    fetchOrderData: (orderId: string) => Promise<void>; // ✅ New Action
}

const initialData: PackingSlipData = {
    senderName: '', senderAddress: '', senderPhone: '',
    receiverName: '', receiverAddress: '', receiverCity: '', receiverPhone: '',
    orderId: '', orderDate: new Date().toISOString().split('T')[0],
    shippingMethod: '', totalWeight: '',
    items: [{ id: '1', sku: '', name: '', variant: '', quantity: 1 }],
    internalNotes: '', customerNotes: ''
};

export const usePackingSlipStore = create<PackingSlipStore>((set) => ({
    data: initialData,
    template: 'standard',
    setTemplate: (t) => set({ template: t }),
    updateData: (d) => set((state) => ({ data: { ...state.data, ...d } })),

    // ✅ Mock Fetch Logic (Replace with actual API call)
    fetchOrderData: async (orderId) => {
        // In real app: const res = await fetch(`/api/orders/${orderId}`);
        // const order = await res.json();

        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock Data found
        set({
            data: {
                senderName: 'ZipSellix Sellers',
                senderAddress: 'Warehouse 4, Industrial Estate',
                senderPhone: '+92 300 1234567',
                receiverName: 'Ali Khan',
                receiverAddress: 'House 12, Street 5, DHA Phase 6',
                receiverCity: 'Lahore',
                receiverPhone: '0321-9876543',
                orderId: orderId,
                orderDate: new Date().toISOString().split('T')[0],
                shippingMethod: 'Leopards Overnight',
                totalWeight: '1.5 KG',
                items: [
                    { id: '101', sku: 'STK-Blue-L', name: 'Denim Jacket', variant: 'Large / Blue', quantity: 1, binLocation: 'A-12' },
                    { id: '102', sku: 'ACC-Belt-Brn', name: 'Leather Belt', variant: 'Brown', quantity: 2, binLocation: 'B-04' }
                ],
                internalNotes: '⚠️ Double check zipper before packing.',
                customerNotes: 'Thank you for shopping! Leave us a review.'
            }
        });
    }
}));