/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { PackingSlipData, LineItem } from '@/types/packing-slip';
import { SafeBarcode } from '../shipping-label/Barcode';
import { Box, Table, Package, CheckSquare, Clipboard } from 'lucide-react';

// --- HELPER COMPONENTS ---

const Header = ({ title, data }: { title: string, data: PackingSlipData }) => (
    <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center gap-4">
            {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
            ) : (
                <div className="h-16 w-16 bg-bg-muted flex items-center justify-center border border-slate-300">
                    <Box className="text-text-muted-light" />
                </div>
            )}
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">{title}</h1>
                <p className="text-sm font-bold text-text-muted">{data.senderName}</p>
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-xl font-mono font-bold">{data.orderId}</h2>
            <p className="text-sm">Date: {data.orderDate}</p>
            <div className="mt-2">
                <SafeBarcode value={data.orderId} width={1} height={40} displayValue={false} />
            </div>
        </div>
    </div>
);

const AddressSection = ({ data }: { data: PackingSlipData }) => (
    <div className="flex gap-8 mb-6">
        <div className="flex-1">
            <h3 className="font-bold text-xs uppercase text-text-muted mb-1">Ship From</h3>
            <p className="font-bold">{data.senderName}</p>
            <p className="text-sm whitespace-pre-line">{data.senderAddress}</p>
            <p className="text-sm mt-1">{data.senderPhone}</p>
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-xs uppercase text-text-muted mb-1">Ship To</h3>
            <p className="font-bold text-lg">{data.receiverName}</p>
            <p className="text-sm whitespace-pre-line">{data.receiverAddress}</p>
            <p className="font-bold mt-1">{data.receiverCity}</p>
            <p className="text-sm">{data.receiverPhone}</p>
        </div>
    </div>
);

const ItemsTable = ({ items }: { items: LineItem[] }) => (
    <table className="w-full text-left text-sm mb-6">
        <thead className="bg-bg-muted border-b-2 border-card-border">
            <tr>
                <th className="p-2 font-bold w-16">Qty</th>
                <th className="p-2 font-bold">Item Details</th>
                <th className="p-2 font-bold w-32">SKU</th>
                <th className="p-2 font-bold w-24">Check</th>
            </tr>
        </thead>
        <tbody>
            {items.map((item, i) => (
                <tr key={i} className="border-b border-card-border-subtle">
                    <td className="p-3 font-bold text-lg">{item.quantity}</td>
                    <td className="p-3">
                        <p className="font-bold">{item.name}</p>
                        {item.variant && <p className="text-xs text-text-muted">Variant: {item.variant}</p>}
                    </td>
                    <td className="p-3 font-mono text-xs">{item.sku}</td>
                    <td className="p-3"><div className="w-6 h-6 border-2 border-slate-300 rounded" /></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const Footer = ({ data }: { data: PackingSlipData }) => (
    <div className="mt-auto pt-6 border-t border-card-border">
        <div className="flex justify-between items-start">
            <div className="w-2/3">
                {data.customerNotes && (
                    <div className="mb-4 p-3 bg-bg-subtle rounded border border-card-border-subtle">
                        <p className="font-bold text-xs uppercase text-text-muted-light mb-1">Note to Customer</p>
                        <p className="text-sm italic">"{data.customerNotes}"</p>
                    </div>
                )}
            </div>
            <div className="w-1/3 text-right">
                <p className="text-xs font-bold uppercase text-text-muted">Total Items</p>
                <p className="text-xl font-black">{data.items.reduce((acc, item) => acc + Number(item.quantity), 0)}</p>
            </div>
        </div>
        <p className="text-center text-[10px] text-text-muted-light mt-4">Thank you for your business!</p>
        {/* Powered by ZipSellix Badge */}
        <div className="mt-3 pt-3 border-t border-card-border-subtle flex justify-center">
            <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[14px] w-auto opacity-75" />
        </div>
    </div>
);

// --- 1. STANDARD TEMPLATE ---
export const StyleStandard = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-full h-full bg-card-bg p-8 flex flex-col font-sans text-brand-heading">
            <Header title="PACKING SLIP" data={data} />
            <AddressSection data={data} />

            <div className="flex gap-4 mb-6 text-sm">
                <div className="flex-1 p-2 border rounded bg-bg-subtle">
                    <span className="block text-xs font-bold text-text-muted-light uppercase">Method</span>
                    <span className="font-bold">{data.shippingMethod}</span>
                </div>
                <div className="flex-1 p-2 border rounded bg-bg-subtle">
                    <span className="block text-xs font-bold text-text-muted-light uppercase">Weight</span>
                    <span className="font-bold">{data.totalWeight}</span>
                </div>
            </div>

            <ItemsTable items={data.items} />
            <Footer data={data} />
        </div>
    );
};

// --- 2. WAREHOUSE TEMPLATE (Optimized for Picking) ---
export const StyleWarehouse = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-full h-full bg-card-bg p-6 flex flex-col font-mono text-black">
            <div className="border-4 border-black p-4 mb-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black uppercase">PICK LIST</h1>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold">{data.orderId}</h2>
                    </div>
                </div>
            </div>

            {data.internalNotes && (
                <div className="bg-yellow-100 border-2 border-black p-2 mb-4 text-center">
                    <span className="font-bold text-red-600 uppercase">⚠ ALERT: {data.internalNotes}</span>
                </div>
            )}

            <div className="mb-6 border-b-2 border-black pb-4">
                <p className="font-bold">SHIP TO: {data.receiverName} ({data.receiverCity})</p>
            </div>

            <table className="w-full text-left mb-6 border-2 border-black">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-2 border-r border-white">BIN</th>
                        <th className="p-2 border-r border-white">QTY</th>
                        <th className="p-2 border-r border-white">SKU</th>
                        <th className="p-2">ITEM</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i} className="border-b-2 border-black text-lg">
                            <td className="p-2 border-r-2 border-black font-bold w-20">{item.binLocation || '-'}</td>
                            <td className="p-2 border-r-2 border-black font-black text-2xl w-16 text-center">{item.quantity}</td>
                            <td className="p-2 border-r-2 border-black text-sm w-32">{item.sku}</td>
                            <td className="p-2 font-bold">{item.name} <br /><span className="text-xs font-normal">{item.variant}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-auto border-t-4 border-black pt-4 flex justify-between">
                <div>
                    <p className="text-xs">Picker Sig: _______________</p>
                    <p className="text-xs mt-2">Checker Sig: _______________</p>
                </div>
                <div className="w-32">
                    <SafeBarcode value={data.orderId} width={1.5} height={40} />
                </div>
            </div>
            <div className="mt-3 pt-2 border-t border-black flex justify-center">
                <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[12px] w-auto opacity-75" />
            </div>
        </div>
    );
};

// --- 3. THERMAL TEMPLATE (4x6 Invoice) ---
export const StyleThermal = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-[101.6mm] h-[152.4mm] bg-card-bg p-2 flex flex-col font-sans text-black border box-border text-xs leading-tight">
            <div className="text-center border-b pb-1 mb-1">
                <h1 className="font-bold text-lg">PACKING SLIP</h1>
                <p className="font-mono">{data.orderId}</p>
            </div>

            <div className="mb-2">
                <span className="font-bold block">To:</span>
                <p>{data.receiverName}</p>
                <p>{data.receiverAddress}</p>
                <p className="font-bold">{data.receiverCity}</p>
            </div>

            <table className="w-full text-left border-collapse border border-black mb-2">
                <thead>
                    <tr className="bg-slate-200">
                        <th className="border border-black p-1 w-8">Qty</th>
                        <th className="border border-black p-1">Item</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i}>
                            <td className="border border-black p-1 text-center font-bold text-sm">{item.quantity}</td>
                            <td className="border border-black p-1">
                                <span className="block font-bold truncate">{item.name}</span>
                                <span className="block text-[9px]">{item.sku}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-auto pt-1 border-t text-center">
                <SafeBarcode value={data.orderId} width={1.2} height={30} displayValue={false} />
                <p className="text-[8px] mt-1">{data.senderName}</p>
                <div className="mt-1 flex justify-center">
                    <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[10px] w-auto opacity-75" />
                </div>
            </div>
        </div>
    );
};

// --- 4. MODERN TEMPLATE ---
export const StyleModern = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-full h-full bg-card-bg p-10 flex flex-col font-sans">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-light text-text-main tracking-wide uppercase">Packing Slip</h1>
                    <p className="text-text-muted mt-2">Order #{data.orderId}</p>
                </div>
                {data.logoUrl && <img src={data.logoUrl} className="h-20 object-contain" />}
            </div>

            <div className="grid grid-cols-2 gap-12 mb-10">
                <div>
                    <p className="text-xs font-bold text-text-muted-light uppercase tracking-widest mb-2">Recipient</p>
                    <p className="text-xl font-medium">{data.receiverName}</p>
                    <p className="text-text-muted">{data.receiverAddress}</p>
                    <p className="text-text-muted">{data.receiverCity}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-text-muted-light uppercase tracking-widest mb-2">Details</p>
                    <div className="flex justify-between border-b py-1"><span className="text-text-muted">Date</span> <span>{data.orderDate}</span></div>
                    <div className="flex justify-between border-b py-1"><span className="text-text-muted">Method</span> <span>{data.shippingMethod}</span></div>
                    <div className="flex justify-between border-b py-1"><span className="text-text-muted">Weight</span> <span>{data.totalWeight}</span></div>
                </div>
            </div>

            <div className="mb-8">
                {data.items.map((item, i) => (
                    <div key={i} className="flex items-center py-4 border-b border-card-border-subtle">
                        <div className="h-12 w-12 bg-bg-muted rounded-lg flex items-center justify-center text-text-muted-light mr-4 font-bold">
                            {item.quantity}x
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-main">{item.name}</p>
                            <p className="text-sm text-text-muted">SKU: {item.sku} {item.variant && `• ${item.variant}`}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-card-border" />
                    </div>
                ))}
            </div>

            <div className="mt-auto bg-bg-subtle p-6 rounded-xl flex justify-between items-center">
                <div>
                    <p className="font-bold text-text-main">Questions?</p>
                    <p className="text-sm text-text-muted">{data.senderPhone}</p>
                    <p className="text-sm text-text-muted">{data.senderAddress}</p>
                </div>
                <SafeBarcode value={data.orderId} width={1.5} height={40} background="transparent" />
            </div>
            <div className="mt-4 flex justify-center">
                <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[14px] w-auto opacity-75" />
            </div>
        </div>
    );
};

// --- 5. GIFT TEMPLATE ---
export const StyleGift = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-full h-full bg-[#fffaf0] p-10 flex flex-col font-serif border-[12px] border-double border-orange-200">
            <div className="text-center mb-8">
                <span className="text-orange-400 text-6xl block mb-2">❦</span>
                <h1 className="text-4xl italic font-bold text-text-main">A Gift For You</h1>
                <p className="text-text-muted mt-2">We hope you enjoy your package!</p>
            </div>

            {data.customerNotes && (
                <div className="mx-auto w-2/3 text-center mb-8 p-6 bg-card-bg shadow-sm rounded-lg italic text-lg leading-relaxed">
                    "{data.customerNotes}"
                </div>
            )}

            <div className="bg-card-bg p-8 rounded-lg shadow-sm mb-6 flex-1">
                <h2 className="text-center font-sans text-xs font-bold uppercase text-text-muted-light mb-6 tracking-widest">Package Contents</h2>
                <ul className="space-y-4">
                    {data.items.map((item, i) => (
                        <li key={i} className="flex justify-between items-baseline border-b border-dashed border-orange-200 pb-2">
                            <span className="font-bold text-lg">{item.name}</span>
                            <span className="text-text-muted-light italic">Qty: {item.quantity}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-center text-text-muted-light text-sm mt-auto font-sans">
                From: {data.senderName} • Order #{data.orderId}
            </div>
            <div className="mt-4 flex justify-center font-sans">
                <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[14px] w-auto opacity-75" />
            </div>
        </div>
    );
};

// --- 6. MINIMAL TEMPLATE ---
export const StyleMinimal = ({ data }: { data: PackingSlipData }) => {
    return (
        <div className="w-full h-full bg-card-bg p-12 flex flex-col font-mono text-xs">
            <div className="flex justify-between items-end border-b border-black pb-4 mb-8">
                <h1 className="text-2xl font-bold">{data.senderName}</h1>
                <div className="text-right">
                    <p>PACKING SLIP</p>
                    <p>#{data.orderId}</p>
                    <p>{data.orderDate}</p>
                </div>
            </div>

            <div className="mb-12">
                <p className="mb-2">SHIP TO:</p>
                <p className="text-lg">{data.receiverName}</p>
                <p>{data.receiverAddress}</p>
                <p>{data.receiverCity}</p>
            </div>

            <table className="w-full text-left mb-8">
                <thead>
                    <tr className="border-b border-black">
                        <th className="py-2 w-16">QTY</th>
                        <th className="py-2">DESCRIPTION</th>
                        <th className="py-2 w-32">SKU</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i} className="border-b border-card-border">
                            <td className="py-2 align-top">{item.quantity}</td>
                            <td className="py-2 align-top">
                                <div>{item.name}</div>
                                {item.variant && <div className="text-text-muted-light">{item.variant}</div>}
                            </td>
                            <td className="py-2 align-top">{item.sku}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-auto pt-6 border-t border-black flex justify-between items-end">
                <p>Checked By: ___________</p>
                <SafeBarcode value={data.orderId} width={1.2} height={30} displayValue={true} fontSize={10} />
            </div>
            <div className="mt-3 pt-2 border-t border-card-border flex justify-center">
                <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[12px] w-auto opacity-75" />
            </div>
        </div>
    );
};