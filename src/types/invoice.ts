// src/types/invoice.ts

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;

    // Sender (You)
    companyName: string;
    companyEmail: string;
    companyAddress: string;

    // Receiver (Client)
    clientName: string;
    clientEmail: string;
    clientAddress: string;

    // Financials
    currency: string;
    taxRate: number;
    discount: number;

    items: LineItem[];
    notes: string;
}
export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;

    // Logo added here
    logo?: string;

    // Sender
    companyName: string;
    companyEmail: string;
    companyAddress: string;

    // Receiver
    clientName: string;
    clientEmail: string;
    clientAddress: string;

    // Financials
    currency: string;
    taxRate: number;
    discount: number;

    items: LineItem[];
    notes: string;
}