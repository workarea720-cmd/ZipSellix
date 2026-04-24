import React from 'react';
import QRCode from 'react-qr-code';
import { Plus, Trash2, X, Banknote, Truck as TruckIcon } from 'lucide-react';

// --- SMART EDITABLE COMPONENT (Handles Preview Logic) ---
export const Editable = ({
    value, onChange, placeholder, className, isTextArea = false, rows = 1, isPreview = false
}: {
    value: string | number; onChange: (val: string) => void; placeholder?: string; className?: string; isTextArea?: boolean; rows?: number; isPreview?: boolean
}) => {
    if (isPreview) {
        if (!value) return null;
        return <div className={`${className} whitespace-pre-wrap bg-transparent px-1 block break-words`}>{value}</div>;
    }
    const baseClass = "block bg-transparent outline-none hover:bg-brand-secondary-hover/5 focus:bg-black/5 rounded transition px-1 w-full placeholder:text-slate-300";
    if (isTextArea) {
        return <textarea rows={rows} className={`${baseClass} ${className} resize-none`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
    }
    return <input className={`${baseClass} ${className}`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
};

// --- DATE FIELD (Renders as plain text in preview, native input in edit) ---
export const DateField = ({ value, onChange, className, isPreview }: { value: string; onChange: (val: string) => void; className?: string; isPreview?: boolean }) => {
    if (isPreview) {
        const formatted = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
        return <span className={`${className} block`}>{formatted}</span>;
    }
    return <input type="date" className={`${className} bg-transparent outline-none hover:bg-brand-secondary-hover/5 focus:bg-black/5 rounded transition`} value={value} onChange={e => onChange(e.target.value)} />;
};

export const LogoSection = ({ data, update, handleUploads, isPreview }: any) => (
    <div className="mb-2 group relative w-fit">
        {data.logo ? (
            <>
                <img src={data.logo} alt="Logo" className="h-16 w-auto object-contain" />
                {!isPreview && (
                    <button onClick={() => update('logo', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition print:hidden"><X size={10} /></button>
                )}
            </>
        ) : (
            !isPreview && (
                <label className="border-2 border-dashed border-slate-300 rounded h-16 w-16 flex items-center justify-center cursor-pointer hover:border-slate-400 bg-bg-subtle print:hidden">
                    <span className="text-[10px] text-text-muted-light text-center">Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploads.logo} />
                </label>
            )
        )}
    </div>
);

export const BillShipSection = ({ data, update, isPreview }: any) => (
    <div className="flex flex-row gap-8 mb-8">
        <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-xs font-bold text-text-muted-light uppercase tracking-widest mb-1">Bill To</h3>
            <Editable isPreview={isPreview} className="font-bold" value={data.billToName} onChange={(v) => update('billToName', v)} placeholder="Client Name" />
            <Editable isPreview={isPreview} className="text-sm" value={data.billToAddress} onChange={(v) => update('billToAddress', v)} placeholder="Address" />
        </div>
        {data.showShippingAddress && (
            <div className="flex-1 flex flex-col gap-1">
                <h3 className="text-xs font-bold text-text-muted-light uppercase tracking-widest mb-1">Ship To</h3>
                <Editable isPreview={isPreview} className="font-bold" value={data.shipToName} onChange={(v) => update('shipToName', v)} placeholder="Recipient" />
                <Editable isPreview={isPreview} className="text-sm" value={data.shipToAddress} onChange={(v) => update('shipToAddress', v)} placeholder="Address" />
            </div>
        )}
    </div>
);

export const ItemsTable = ({ data, update, calculations, headerColor, isPreview }: any) => (
    <div className="mb-8">
        <div className={`flex items-center pb-2 mb-4 ${headerColor}`}>
            <div className="flex-[3] text-xs font-bold uppercase pl-2">Item</div>
            <div className="flex-1 text-right text-xs font-bold uppercase">Qty</div>
            <div className="flex-1 text-right text-xs font-bold uppercase">Rate</div>
            <div className="flex-1 text-right text-xs font-bold uppercase pr-2">Total</div>
            {!isPreview && <div className="w-6 print:hidden"></div>}
        </div>
        <div className="space-y-2">
            {data.items.map((item: any) => (
                <div key={item.id} className="flex flex-row items-center group">
                    <div className="flex-[3] w-auto">
                        <Editable isPreview={isPreview} value={item.description} onChange={(v) => calculations.updateItem(item.id, 'description', v)} placeholder="Item Name" />
                    </div>
                    <div className="contents">
                        <div className="flex-1 text-right block">
                            <Editable isPreview={isPreview} className="text-right w-full" value={item.quantity} onChange={(v) => calculations.updateItem(item.id, 'quantity', Number(v))} />
                        </div>
                        <div className="flex-1 text-right block">
                            <Editable isPreview={isPreview} className="text-right w-full" value={item.rate} onChange={(v) => calculations.updateItem(item.id, 'rate', Number(v))} />
                        </div>
                        <div className="flex-1 text-right font-bold pr-2 flex items-center justify-end">
                            {data.currency} {(item.quantity * item.rate).toLocaleString()}
                        </div>
                        {!isPreview && (
                            <div className="w-6 text-center print:hidden flex items-center justify-center">
                                <button onClick={() => calculations.removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
        {!isPreview && (
            <button onClick={calculations.addItem} className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary print:hidden transition"><Plus size={14} /> Add Item</button>
        )}
    </div>
);

export const TotalsSection = ({ data, update, calculations, isPreview }: any) => (
    <div className="flex flex-row gap-12 border-t border-card-border-subtle pt-8">
        <div className="flex-[1.5]">
            <div className="mb-6 p-4 bg-bg-subtle rounded-lg border border-card-border-subtle relative group">
                {!isPreview && (
                    <div className="absolute top-2 right-2 flex gap-1 print:hidden opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => update('paymentMethod', 'bank')} className={`p-1 rounded ${data.paymentMethod === 'bank' ? 'bg-blue-600 text-white' : 'bg-card-bg text-text-muted-light border'}`} title="Bank Transfer"><Banknote size={14} /></button>
                        <button onClick={() => update('paymentMethod', 'cod')} className={`p-1 rounded ${data.paymentMethod === 'cod' ? 'bg-brand-primary text-white' : 'bg-card-bg text-text-muted-light border'}`} title="Cash on Delivery"><TruckIcon size={14} /></button>
                    </div>
                )}
                <h4 className="text-xs font-bold text-text-muted-light uppercase mb-3 flex items-center gap-2">
                    Payment Details
                    {!isPreview && <span className="text-[10px] bg-slate-200 text-text-muted px-1 rounded print:hidden">{data.paymentMethod === 'bank' ? 'Bank' : 'COD'}</span>}
                </h4>
                {data.paymentMethod === 'bank' ? (
                    <div className="space-y-1">
                        <div className="flex flex-row gap-2 text-sm">
                            <span className="w-20 text-text-muted font-medium">Bank:</span>
                            <Editable isPreview={isPreview} className="font-bold text-text-main" value={data.bankName} onChange={(v) => update('bankName', v)} placeholder="Bank Name" />
                        </div>
                        <div className="flex flex-row gap-2 text-sm">
                            <span className="w-20 text-text-muted font-medium">A/C Title:</span>
                            <Editable isPreview={isPreview} className="font-medium text-text-main" value={data.accountName} onChange={(v) => update('accountName', v)} placeholder="Account Title" />
                        </div>
                        <div className="flex flex-row gap-2 text-sm">
                            <span className="w-20 text-text-muted font-medium">A/C No:</span>
                            <Editable isPreview={isPreview} className="font-mono text-text-main" value={data.accountNumber} onChange={(v) => update('accountNumber', v)} placeholder="XXXX-XXXX-XXXX" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 bg-brand-primary-light rounded-full flex items-center justify-center text-brand-primary">
                            <TruckIcon size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-text-main">Cash on Delivery (COD)</p>
                            <p className="text-xs text-text-muted">Pay cash rider upon delivery.</p>
                        </div>
                    </div>
                )}
            </div>
            <h4 className="text-xs font-bold text-text-muted-light uppercase mt-4 mb-2">Terms & Notes</h4>
            <Editable isPreview={isPreview} isTextArea value={data.notes} onChange={(v) => update('notes', v)} className="text-sm" />
        </div>
        <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm text-text-muted"><span>Subtotal</span><span>{data.currency} {calculations.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm items-center">
                <span>Tax %</span>
                <div className="flex items-center justify-end w-20"><Editable isPreview={isPreview} className="text-right w-12" value={data.tax} onChange={(v) => update('tax', Number(v))} /></div>
            </div>
            <div className="flex justify-between text-sm items-center">
                <span>Shipping</span>
                <div className="flex items-center justify-end w-24"><Editable isPreview={isPreview} className="text-right w-16" value={data.shipping} onChange={(v) => update('shipping', Number(v))} /></div>
            </div>
            <div className="flex justify-between text-sm items-center text-red-500">
                <span>Discount</span>
                <div className="flex items-center justify-end w-24"><span className="text-xs mr-1">-</span><Editable isPreview={isPreview} className="text-right w-16 text-red-500" value={data.discount} onChange={(v) => update('discount', Number(v))} /></div>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-300 pt-2 mt-2">
                <span>Total</span><span>{data.currency} {calculations.total.toLocaleString()}</span>
            </div>
            {data.showAdvance && (
                <>
                    <div className="flex justify-between text-sm items-center text-brand-primary border-t border-dashed border-card-border pt-2 mt-2">
                        <span>Paid</span>
                        <div className="flex items-center justify-end w-24">
                            <span className="text-xs mr-1">-</span>
                            <Editable isPreview={isPreview} className="text-right w-16 text-brand-primary font-bold" value={data.advanceAmount} onChange={(v) => update('advanceAmount', Number(v))} />
                        </div>
                    </div>
                    <div className="flex justify-between text-xl font-extrabold bg-bg-muted p-2 rounded mt-2">
                        <span>Balance Due</span>
                        <span>{data.currency} {(calculations.total - data.advanceAmount).toLocaleString()}</span>
                    </div>
                </>
            )}
        </div>
    </div>
);

export const FooterSection = ({ data, update, handleUploads, calculations, isPreview }: any) => (
    <div className="mt-auto pt-12">
        <div className="flex flex-row justify-between items-end">
        <div className="text-center">
            <div className="mb-2 relative group w-48 h-16 border-b border-slate-400 flex items-end justify-center">
                {data.signature ? (
                    <>
                        <img src={data.signature} alt="Sign" className="max-h-full max-w-full object-contain pb-1" />
                        {!isPreview && <button onClick={() => update('signature', null)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 print:hidden"><X size={10} /></button>}
                    </>
                ) : data.signName ? (
                    <p className="font-[cursive] text-xl pb-1">{data.signName}</p>
                ) : (
                    !isPreview && <span className="text-[10px] text-slate-300 pb-1 print:hidden">Sign here</span>
                )}
            </div>
            {!isPreview && (
                <div className="print:hidden flex flex-col gap-1 items-center">
                    <input className="text-[10px] border rounded p-1 text-center w-48" placeholder="Type Name" value={data.signName} onChange={(e) => update('signName', e.target.value)} />
                    <label className="text-[10px] text-blue-500 cursor-pointer hover:underline">Upload Image <input type="file" accept="image/*" className="hidden" onChange={handleUploads.signature} /></label>
                </div>
            )}
            {data.signName && <p className="text-xs font-bold text-text-main mt-1">{data.signName}</p>}
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Authorized Sign</p>
        </div>
        <div className="text-center">
            <div className="bg-card-bg p-1 inline-block">
                <QRCode
                    value={JSON.stringify({
                        inv: data.invoiceNo,
                        date: data.date,
                        due: calculations.total - data.advanceAmount,
                        items: data.items.map((i: any) => `${i.quantity}x ${i.description}`)
                    })}
                    size={64}
                />
            </div>
            <p className="text-[8px] text-text-muted-light mt-1 uppercase">Scan for Data</p>
        </div>
        </div>
        {/* Powered by ZipSellix Badge */}
        <div className="mt-8 pt-4 border-t border-card-border-subtle flex justify-center">
            <img src="/powered-by-badge-print.svg" alt="Powered by ZipSellix" className="h-[18px] w-auto opacity-75" />
        </div>
    </div>
);

// --- ALL TEMPLATES ---

export const TemplateMinimal = (props: any) => (
    <div className="p-12 h-full flex flex-col font-sans text-text-main">
        <div className="flex flex-row justify-between items-start mb-12">
            <div className="w-1/2 flex flex-col gap-1">
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="text-2xl font-bold mt-3" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} placeholder="Your Company" />
                <Editable isPreview={props.isPreview} className="text-sm text-text-muted" value={props.data.sellerAddress} onChange={(v: any) => props.update('sellerAddress', v)} />
                <Editable isPreview={props.isPreview} className="text-sm text-text-muted" value={props.data.sellerEmail} onChange={(v: any) => props.update('sellerEmail', v)} />
            </div>
            <div className="w-auto text-right">
                <h1 className="text-4xl font-light text-slate-300 tracking-widest uppercase mb-4">Invoice</h1>
                <div className="flex justify-end gap-2 items-center"><span className="text-text-muted-light">#</span><Editable isPreview={props.isPreview} className="text-right font-bold w-32" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} /></div>
                <div className="flex justify-end gap-2 items-center"><span className="text-text-muted-light">Date</span><DateField isPreview={props.isPreview} className="text-right w-32" value={props.data.date} onChange={(v: any) => props.update('date', v)} /></div>
            </div>
        </div>
        <BillShipSection {...props} />
        <ItemsTable {...props} headerColor="bg-bg-muted text-text-muted" />
        <TotalsSection {...props} />
        <FooterSection {...props} />
    </div>
);

export const TemplateCorporate = (props: any) => (
    <div className="h-full flex flex-col font-serif text-text-main">
        <div className="bg-brand-secondary text-white p-12 flex flex-row justify-between items-center">
            <div>
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="text-2xl font-bold text-white mt-2 lg:text-white" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
            </div>
            <div className="text-right">
                <h1 className="text-4xl font-bold uppercase tracking-widest text-text-muted-light">Invoice</h1>
                <Editable isPreview={props.isPreview} className="text-right text-white text-xl lg:text-white" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} />
            </div>
        </div>
        <div className="p-12">
            <BillShipSection {...props} />
            <ItemsTable {...props} headerColor="bg-brand-secondary text-white" />
            <TotalsSection {...props} />
            <FooterSection {...props} />
        </div>
    </div>
);

export const TemplateModern = (props: any) => (
    <div className="h-full flex flex-row font-sans">
        <div className="w-1/3 bg-bg-muted p-8 border-r border-card-border">
            <LogoSection {...props} />
            <div className="mt-8 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase text-text-muted-light mb-1">From</p>
                <Editable isPreview={props.isPreview} className="font-bold text-lg" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
                <Editable isPreview={props.isPreview} className="text-sm" value={props.data.sellerAddress} onChange={(v: any) => props.update('sellerAddress', v)} />
            </div>
            <div className="mt-8 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase text-text-muted-light mb-1">To</p>
                <Editable isPreview={props.isPreview} className="font-bold text-lg" value={props.data.billToName} onChange={(v: any) => props.update('billToName', v)} />
                <Editable isPreview={props.isPreview} className="text-sm" value={props.data.billToAddress} onChange={(v: any) => props.update('billToAddress', v)} />
            </div>
        </div>
        <div className="w-2/3 p-8">
            <div className="flex flex-row justify-between items-end border-b-4 border-brand-primary pb-4 mb-8">
                <h1 className="text-4xl font-bold text-brand-heading">INVOICE</h1>
                <div className="text-right w-auto">
                    <Editable isPreview={props.isPreview} className="text-right font-bold text-xl w-32" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} />
                    <DateField isPreview={props.isPreview} className="text-right text-text-muted w-32 inline-block" value={props.data.date} onChange={(v: any) => props.update('date', v)} />
                </div>
            </div>
            <ItemsTable {...props} headerColor="text-brand-primary border-b-2 border-brand-primary" />
            <TotalsSection {...props} />
            <FooterSection {...props} />
        </div>
    </div>
);

export const TemplateElegant = (props: any) => (
    <div className="p-8 h-full font-serif">
        <div className="border-2 border-double border-slate-800 h-full p-8 flex flex-col">
            <div className="text-center border-b border-slate-800 pb-8 mb-8 flex flex-col items-center gap-1">
                <div className="flex justify-center mb-4"><LogoSection {...props} /></div>
                <Editable isPreview={props.isPreview} className="text-3xl font-bold text-center" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
                <Editable isPreview={props.isPreview} className="text-center text-text-muted" value={props.data.sellerAddress} onChange={(v: any) => props.update('sellerAddress', v)} />
            </div>
            <div className="flex flex-row justify-between mb-8">
                <div><p className="font-bold underline">Bill To:</p><Editable isPreview={props.isPreview} value={props.data.billToName} onChange={(v: any) => props.update('billToName', v)} /></div>
                <div className="text-right"><p className="font-bold underline">Invoice:</p><Editable isPreview={props.isPreview} className="text-right" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} /></div>
            </div>
            <ItemsTable {...props} headerColor="border-b border-t border-slate-800 font-bold" />
            <TotalsSection {...props} />
            <FooterSection {...props} />
        </div>
    </div>
);

export const TemplateTech = (props: any) => (
    <div className="h-full flex flex-col font-mono text-sm">
        <div className="bg-black text-brand-primary p-8 flex flex-row justify-between">
            <div>
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="text-xl font-bold text-brand-primary bg-transparent mt-2 lg:text-brand-primary" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
            </div>
            <div className="text-right">
                <h1 className="text-4xl font-bold">INVOICE</h1>
                <Editable isPreview={props.isPreview} className="text-right bg-transparent text-brand-primary lg:text-brand-primary" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} />
            </div>
        </div>
        <div className="p-8 flex-1">
            <BillShipSection {...props} />
            <div className="my-8 border border-slate-300 p-4 rounded">
                <ItemsTable {...props} headerColor="border-b border-slate-300 font-bold" />
            </div>
            <TotalsSection {...props} />
            <FooterSection {...props} />
        </div>
    </div>
);

export const TemplateCompact = (props: any) => (
    <div className="p-12 h-full font-sans">
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-bg-subtle p-6 rounded-lg">
                <p className="text-xs font-bold uppercase text-text-muted-light">Seller</p>
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="font-bold mt-2" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
            </div>
            <div className="bg-bg-subtle p-6 rounded-lg text-right flex flex-col justify-end">
                <p className="text-xs font-bold uppercase text-text-muted-light">Details</p>
                <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
                <Editable isPreview={props.isPreview} className="text-right w-full font-bold" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} />
                <DateField isPreview={props.isPreview} className="text-right w-full text-text-muted" value={props.data.date} onChange={(v: any) => props.update('date', v)} />
            </div>
        </div>
        <ItemsTable {...props} headerColor="bg-slate-200 rounded-lg px-2" />
        <TotalsSection {...props} />
        <FooterSection {...props} />
    </div>
);

export const TemplateSimple = (props: any) => (
    <div className="p-12 h-full font-sans text-text-main">
        <div className="border-b-4 border-slate-800 pb-8 mb-8 flex flex-row justify-between items-end">
            <div className="w-1/2">
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="text-3xl font-bold mt-4" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
                <Editable isPreview={props.isPreview} className="text-sm text-text-muted" value={props.data.sellerAddress} onChange={(v: any) => props.update('sellerAddress', v)} />
            </div>
            <div className="w-auto text-right">
                <div className="bg-slate-800 text-white px-8 py-2 mb-4 inline-block shadow-sm"><h1 className="font-bold tracking-[0.2em] text-xl">INVOICE</h1></div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-end items-center gap-3"><span className="text-text-muted-light font-bold text-xs uppercase tracking-wider">Invoice No</span><Editable isPreview={props.isPreview} className="text-right font-bold text-lg w-32" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} /></div>
                    <div className="flex justify-end items-center gap-3"><span className="text-text-muted-light font-bold text-xs uppercase tracking-wider">Date</span><DateField isPreview={props.isPreview} className="text-right font-medium w-32" value={props.data.date} onChange={(v: any) => props.update('date', v)} /></div>
                </div>
            </div>
        </div>
        <BillShipSection {...props} />
        <ItemsTable {...props} headerColor="border-b-2 border-card-border text-text-muted" />
        <TotalsSection {...props} />
        <FooterSection {...props} />
    </div>
);

export const TemplateClassic = (props: any) => (
    <div className="p-12 h-full font-serif text-text-main">
        <div className="flex flex-row justify-between items-start border-b border-slate-400 pb-6 mb-8">
            <div>
                <LogoSection {...props} />
                <Editable isPreview={props.isPreview} className="text-3xl font-bold mt-2" value={props.data.sellerName} onChange={(v: any) => props.update('sellerName', v)} />
                <Editable isPreview={props.isPreview} className="text-sm text-text-muted" value={props.data.sellerAddress} onChange={(v: any) => props.update('sellerAddress', v)} />
            </div>
            <div className="w-auto text-right">
                <h1 className="text-5xl font-bold text-slate-200 uppercase tracking-tighter">Invoice</h1>
                <div className="mt-4">
                    <div className="flex justify-end gap-2 items-center"><span className="font-bold text-sm uppercase">Invoice #</span><Editable isPreview={props.isPreview} className="text-right w-24" value={props.data.invoiceNo} onChange={(v: any) => props.update('invoiceNo', v)} /></div>
                    <div className="flex justify-end gap-2 items-center"><span className="font-bold text-sm uppercase">Date</span><DateField isPreview={props.isPreview} className="text-right w-28" value={props.data.date} onChange={(v: any) => props.update('date', v)} /></div>
                </div>
            </div>
        </div>
        <div className="flex flex-row gap-8 mb-8">
            <div className="w-1/2 border border-slate-300 p-4 bg-bg-subtle">
                <h3 className="text-xs font-bold text-text-muted uppercase border-b border-slate-300 pb-1 mb-2">Bill To</h3>
                <Editable isPreview={props.isPreview} className="font-bold" value={props.data.billToName} onChange={(v: any) => props.update('billToName', v)} />
                <Editable isPreview={props.isPreview} className="text-sm" value={props.data.billToAddress} onChange={(v: any) => props.update('billToAddress', v)} />
            </div>
            {props.data.showShippingAddress && (
                <div className="w-1/2 border border-slate-300 p-4 bg-bg-subtle">
                    <h3 className="text-xs font-bold text-text-muted uppercase border-b border-slate-300 pb-1 mb-2">Ship To</h3>
                    <Editable isPreview={props.isPreview} className="font-bold" value={props.data.shipToName} onChange={(v: any) => props.update('shipToName', v)} />
                    <Editable isPreview={props.isPreview} className="text-sm" value={props.data.shipToAddress} onChange={(v: any) => props.update('shipToAddress', v)} />
                </div>
            )}
        </div>
        <div className="mb-8 border border-slate-300">
            <div className="flex bg-slate-200 font-bold text-sm border-b border-slate-300">
                <div className="flex-[3] p-2 border-r border-slate-300">DESCRIPTION</div>
                <div className="flex-1 p-2 text-right border-r border-slate-300">QTY</div>
                <div className="flex-1 p-2 text-right border-r border-slate-300">RATE</div>
                <div className="flex-1 p-2 text-right">TOTAL</div>
            </div>
            {props.data.items.map((item: any) => (
                <div key={item.id} className="flex flex-row border-b border-slate-300 last:border-0 group">
                    <div className="flex-[3] p-2 border-r border-slate-300"><Editable isPreview={props.isPreview} value={item.description} onChange={(v: any) => props.calculations.updateItem(item.id, 'description', v)} placeholder="Description" /></div>
                    <div className="contents">
                        <div className="flex-1 p-2 border-r border-slate-300 flex items-center justify-end">
                            <Editable isPreview={props.isPreview} className="text-right w-full" value={item.quantity} onChange={(v: any) => props.calculations.updateItem(item.id, 'quantity', Number(v))} />
                        </div>
                        <div className="flex-1 p-2 border-r border-slate-300 flex items-center justify-end">
                            <Editable isPreview={props.isPreview} className="text-right w-full" value={item.rate} onChange={(v: any) => props.calculations.updateItem(item.id, 'rate', Number(v))} />
                        </div>
                        <div className="flex-1 p-2 text-right font-bold flex items-center justify-end">
                            {props.data.currency} {(item.quantity * item.rate).toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <TotalsSection {...props} />
        <FooterSection {...props} />
    </div>
);
