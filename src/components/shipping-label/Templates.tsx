/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { LabelData } from '@/types/shipping-label';
import { SafeBarcode } from './Barcode';
import QRCode from 'react-qr-code';

// ==========================================
// 1. POSTEX (Exact match of image 1.jpg)
// ==========================================
export const CleanVertical = ({ data }: { data: LabelData }) => {
    return (
        <div className="w-[576px] h-[384px] bg-card-bg text-black font-sans border-2 border-black flex flex-col box-border text-[10px] overflow-hidden shrink-0 m-0 p-0">
            {/* Top Header */}
            <div className="flex justify-between items-center px-4 border-b border-black h-[15%] overflow-hidden shrink-0">
                <div className="w-[30%]">
                    <h1 className="text-4xl font-black tracking-tighter">PostEx<span className="text-[#8CC63F]">.</span></h1>
                </div>
                <div className="w-[40%] flex flex-col items-center justify-center pt-2">
                    <SafeBarcode value={data.orderRef} width={1.2} height={25} displayValue={false} />
                    <span className="text-[9px] mt-0.5">{data.orderRef}</span>
                </div>
                <div className="w-[30%] flex justify-end items-center gap-4 pt-2">
                    <div className="flex flex-col items-center">
                        <SafeBarcode value={data.trackingNumber} width={1.2} height={25} displayValue={false} />
                        <span className="text-[9px] mt-0.5">{data.trackingNumber}</span>
                    </div>
                    <span className="font-bold text-sm uppercase">{data.receiverCity?.substring(0, 3) || ''}</span>
                </div>
            </div>

            {/* Table Headers */}
            <div className="flex bg-[#e5e5e5] border-b border-black font-bold h-[7%] items-center shrink-0">
                <div className="w-[42%] text-center border-r border-black h-full flex items-center justify-center">Consignee Information</div>
                <div className="w-[35%] text-center border-r border-black h-full flex items-center justify-center">Shipment Information</div>
                <div className="w-[23%] text-center h-full flex items-center justify-center">Order Information</div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Column - Consignee & Shipper */}
                <div className="w-[42%] border-r border-black flex flex-col h-full overflow-hidden">
                    <div className="flex border-b border-black h-[10%] items-center"><div className="w-[30%] px-1 border-r border-black h-full flex items-center">Name:</div><div className="flex-1 px-1 font-bold truncate">{data.receiverName}</div></div>
                    <div className="flex border-b border-black h-[10%] items-center"><div className="w-[30%] px-1 border-r border-black h-full flex items-center">Contact:</div><div className="flex-1 px-1 font-bold truncate">{data.receiverPhone}</div></div>
                    <div className="flex border-b border-black h-[18%]"><div className="w-[30%] p-1 border-r border-black">Delivery Address:</div><div className="flex-1 p-1 font-bold leading-tight line-clamp-2">{data.receiverAddress} {data.receiverCity}</div></div>

                    <div className="bg-[#e5e5e5] border-b border-black h-[8%] flex items-center justify-center font-bold">Shipper Information</div>

                    <div className="flex border-b border-black h-[10%] items-center"><div className="w-[30%] px-1 border-r border-black h-full flex items-center">Name:</div><div className="flex-1 px-1 font-bold truncate">{data.senderName}</div></div>
                    <div className="flex border-b border-black h-[10%] items-center"><div className="w-[30%] px-1 border-r border-black h-full flex items-center">Contact:</div><div className="flex-1 px-1 font-bold truncate">{data.senderPhone}</div></div>
                    <div className="flex border-b border-black h-[13%]"><div className="w-[30%] p-1 border-r border-black">Pickup Address:</div><div className="flex-1 p-1 font-bold leading-tight line-clamp-2">{data.senderAddress}</div></div>
                    <div className="flex border-b border-black h-[13%]"><div className="w-[30%] p-1 border-r border-black">Return Address:</div><div className="flex-1 p-1 font-bold leading-tight line-clamp-2">{data.senderAddress}</div></div>
                    <div className="flex flex-1"><div className="w-[30%] px-1 border-r border-black flex items-center">Order Details:</div><div className="flex-1 px-1 font-bold uppercase truncate flex items-center">{data.contents}</div></div>
                </div>

                {/* Middle Column - Shipment Info */}
                <div className="w-[35%] border-r border-black flex flex-col h-full overflow-hidden">
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Pieces:</div><div className="flex-1 px-1 font-bold truncate">{data.pieces}</div></div>
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Order Ref:</div><div className="flex-1 px-1 font-bold truncate">{data.orderRef}</div></div>
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Tracking No:</div><div className="flex-1 px-1 font-bold truncate">{data.trackingNumber}</div></div>
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Origin:</div><div className="flex-1 px-1 font-bold truncate"></div></div>
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Destination:</div><div className="flex-1 px-1 font-bold truncate">{data.receiverCity}</div></div>
                    <div className="flex border-b border-black h-[12%] items-center"><div className="w-[35%] px-1 border-r border-black h-full flex items-center">Return City:</div><div className="flex-1 px-1 font-bold truncate"></div></div>
                    <div className="flex flex-1"><div className="w-[35%] p-1 border-r border-black">Remarks:</div><div className="flex-1 p-1 font-bold line-clamp-3">{data.specialInstructions}</div></div>
                </div>

                {/* Right Column - Order Info */}
                <div className="w-[23%] flex flex-col h-full overflow-hidden">
                    <div className="flex-1 flex items-center justify-center border-b border-black p-1">
                        <QRCode value={data.trackingNumber || data.orderRef || ' '} size={95} />
                    </div>
                    <div className="flex border-b border-black h-[15%]">
                        <div className="w-[35%] px-1 border-r border-black flex items-center text-[9px]">Amount:</div>
                        <div className="flex-1 px-1 font-black text-[11px] flex items-center justify-center">{data.paymentType === 'COD' ? `${data.codAmount}/-` : '0/-'}</div>
                    </div>
                    <div className="flex border-b border-black h-[15%]">
                        <div className="w-[35%] px-1 border-r border-black flex items-center text-[9px]">Date:</div>
                        <div className="flex-1 px-1 font-bold flex items-center justify-center text-[10px]">{data.orderDate}</div>
                    </div>
                    <div className="flex h-[15%]">
                        <div className="w-[35%] px-1 border-r border-black flex items-center text-[9px]">Order Type:</div>
                        <div className="flex-1 px-1 font-bold flex items-center justify-center text-[10px]">{data.paymentType === 'COD' ? 'Overland' : 'Prepaid'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 2. TCS STYLE (Mapped to BrandPriority - Exact 2.jpg)
// ==========================================
export const BrandPriority = ({ data }: { data: LabelData }) => {
    return (
        <div className="w-[576px] h-[384px] bg-card-bg text-black font-sans border-2 border-black flex flex-col box-border text-[10px] overflow-hidden shrink-0 m-0 p-0">

            {/* Row 1: Header */}
            <div className="flex border-b border-black h-[22%] overflow-hidden">
                <div className="w-[22%] border-r border-black flex flex-col items-center justify-center p-1 bg-card-bg">
                    <h1 className="text-4xl font-black italic text-red-600 tracking-tighter leading-none uppercase truncate w-full text-center">{data.courier || 'TCS'}</h1>
                    <span className="text-[7.5px] font-bold mt-1">TCS (Pvt)Ltd</span>
                </div>
                <div className="w-[28%] border-r border-black flex flex-col items-center justify-center p-1 bg-card-bg">
                    <div className="w-full flex justify-center items-center h-[70%] overflow-hidden">
                        <SafeBarcode value={data.trackingNumber || data.orderRef} width={1.2} height={30} fontSize={10} displayValue={false} />
                    </div>
                    <span className="text-[10px] font-bold mt-1 tracking-widest">{data.trackingNumber || data.orderRef}</span>
                    <span className="text-[8px] mt-0.5">Consignee Copy</span>
                </div>
                <div className="w-[30%] border-r border-black flex flex-col h-full bg-card-bg">
                    <div className="flex h-1/3 border-b border-black">
                        <div className="w-[40%] border-r border-black px-2 flex items-center text-[8px] shrink-0">Date/Time</div>
                        <div className="flex-1 px-2 font-bold flex items-center text-[9px] truncate">{data.orderDate || ''}</div>
                    </div>
                    <div className="flex h-1/3 border-b border-black">
                        <div className="w-[40%] border-r border-black px-2 flex items-center text-[8px] shrink-0">Service</div>
                        <div className="flex-1 px-2 font-bold flex items-center text-[9px] truncate">OVERNIGHT</div>
                    </div>
                    <div className="flex h-1/3">
                        <div className="w-[40%] border-r border-black px-2 flex items-center text-[8px] shrink-0">ORGN/DSTN</div>
                        <div className="flex-1 px-2 font-bold flex items-center text-[9px] uppercase truncate"> / {data.receiverCity?.substring(0, 3) || ''}</div>
                    </div>
                </div>
                <div className="w-[20%] flex items-center justify-center p-1 bg-card-bg">
                    <QRCode value={data.trackingNumber || data.orderRef || ' '} size={60} />
                </div>
            </div>

            {/* Row 2: Shipper / Consignee Header */}
            <div className="flex border-b border-black h-[6%] overflow-hidden">
                <div className="w-[22%] border-r border-black px-2 flex items-center text-[9px] shrink-0">Shipper</div>
                <div className="w-[28%] border-r border-black px-2 font-bold flex items-center truncate text-[9px]">{data.senderName}</div>
                <div className="w-[50%] px-2 flex items-center text-[9px]">Consignee</div>
            </div>

            {/* Row 3: Shipper / Consignee Body */}
            <div className="flex border-b border-black h-[18%] overflow-hidden">
                <div className="w-[50%] border-r border-black p-2 flex flex-col leading-tight overflow-hidden gap-0.5">
                    <span className="line-clamp-2">{data.senderAddress}</span>
                    <span className="">{data.senderPhone}</span>
                </div>
                <div className="w-[50%] p-2 flex flex-col leading-tight overflow-hidden gap-0.5">
                    <span className="font-extrabold truncate text-[11px]">{data.receiverName}</span>
                    <span className="font-extrabold line-clamp-2">{data.receiverAddress} {data.receiverCity}</span>
                    <span className="font-extrabold">{data.receiverPhone}</span>
                </div>
            </div>

            {/* Row 4: Pieces / Weight / Fragile */}
            <div className="flex border-b border-black h-[6%] overflow-hidden">
                <div className="w-[22%] border-r border-black px-2 flex items-center font-bold">Pieces</div>
                <div className="w-[10%] border-r border-black px-2 flex items-center justify-center font-bold">{data.pieces}</div>
                <div className="w-[10%] border-r border-black px-2 flex items-center text-[9px]">Weight</div>
                <div className="w-[8%] border-r border-black px-2 flex items-center justify-center">{data.weight}</div>

                <div className="w-[12%] border-r border-black px-2 flex items-center text-[9px]">Fragile</div>
                <div className="w-[8%] border-r border-black px-2 flex items-center justify-center">{data.instructions?.fragile ? 'YES' : 'NO'}</div>
                <div className="w-[30%] px-2 flex items-center font-bold">{data.receiverPhone}</div>
            </div>

            {/* Row 5: Declared Insurance / COD */}
            <div className="flex border-b border-black h-[16%] overflow-hidden">
                <div className="w-[50%] border-r border-black p-2 flex items-start">
                    <span className="text-[9px]">Declared Insurance Value</span>
                </div>
                <div className="w-[50%] flex flex-col relative p-1.5">
                    <div className="text-[9px]">COD AMOUNT</div>
                    <div className="absolute right-3 bottom-1.5 flex flex-col items-end">
                        {data.paymentType === 'COD' ? (
                            <>
                                <SafeBarcode value={`RS${data.codAmount}`} width={1.2} height={25} displayValue={false} />
                                <span className="font-bold text-[12px] mt-0.5 tracking-widest">RS{data.codAmount}</span>
                            </>
                        ) : (
                            <span className="font-black text-xl tracking-widest mt-1">PREPAID</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 6: Product Detail */}
            <div className="flex border-b border-black h-[7%] overflow-hidden">
                <div className="w-[22%] border-r border-black px-2 flex items-center text-[9px]">Product Detail</div>
                <div className="w-[78%] px-2 flex items-center truncate">{data.contents}</div>
            </div>

            {/* Row 7: Remarks */}
            <div className="flex border-b border-black h-[7%] overflow-hidden">
                <div className="w-[22%] border-r border-black px-2 flex items-center text-[9px]">Remarks</div>
                <div className="w-[78%] px-2 flex items-center truncate">{data.specialInstructions}</div>
            </div>

            {/* Row 8: Footer */}
            <div className="flex flex-1 overflow-hidden">
                <div className="w-[62%] border-r border-black flex items-center justify-center p-2">
                    <SafeBarcode value={data.trackingNumber || data.orderRef} width={2.2} height={45} displayValue={false} />
                </div>
                <div className="w-[38%] flex flex-col h-full">
                    <div className="flex border-b border-black h-[30%] items-center">
                        <div className="w-[40%] border-r border-black px-2 text-[8px]">Customer Ref. #</div>
                        <div className="w-[60%] px-2 font-bold text-[9px] truncate">{data.orderRef}</div>
                    </div>
                    <div className="flex-1 text-center text-[7px] flex flex-col items-center justify-center px-3 leading-tight">
                        <span>Please don't accept, if shipment is not intact. Before paying the COD, shipment can not be open.</span>
                        <span className="mt-1">Incase of complaints, pls contact your seller.</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

// ==========================================
// 3. TRAX STYLE (Mapped to FragileHeader - Exact 3.jpg)
// ==========================================
export const FragileHeader = ({ data }: { data: LabelData }) => {
    return (
        <div className="w-[576px] h-[384px] bg-card-bg text-black font-sans border border-[#3ce086] flex flex-col box-border text-[9px] overflow-hidden shrink-0 m-0 p-0 relative">

            {/* Top Green Bar */}
            <div className="bg-[#3ce086] text-white text-center font-black text-2xl py-1 uppercase tracking-widest h-[12%] flex items-center justify-center shrink-0">
                Custom Print Labels
            </div>

            {/* Header with Logos and Barcode */}
            <div className="flex border-b border-black h-[14%] overflow-hidden shrink-0 items-center justify-between px-2 bg-card-bg relative z-10">
                <div className="w-[20%] flex items-center justify-start overflow-hidden">
                    <h1 className="text-2xl font-light tracking-[0.2em] text-[#3ce086] leading-none uppercase truncate">{data.courier || 'TRAX'}</h1>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center pt-1 overflow-hidden">
                    <span className="font-bold mb-0.5 text-[10px] leading-none tracking-widest">{data.trackingNumber || data.orderRef}</span>
                    <div className="w-full flex justify-center items-center h-[20px] overflow-hidden">
                        <SafeBarcode value={data.trackingNumber || data.orderRef} width={1.2} height={20} displayValue={false} />
                    </div>
                </div>
                <div className="w-[20%] flex items-center justify-end overflow-hidden">
                    <QRCode value={data.trackingNumber || data.orderRef || ' '} size={35} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[55%] overflow-hidden shrink-0">

                {/* Column 1: Consignee Information */}
                <div className="w-[33.33%] border-r border-black flex flex-col h-full overflow-hidden">
                    <div className="border-b border-black font-bold py-1 text-center h-[16%] flex items-center justify-center shrink-0 bg-card-bg">Consignee Information</div>
                    <div className="p-2 flex flex-col gap-1.5 flex-1 overflow-hidden bg-card-bg">
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Name:</span> <span className="flex-1 truncate font-bold">{data.receiverName}</span></p>
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Phone:</span> <span className="flex-1 truncate font-bold text-text-muted">{data.receiverPhone}</span></p>
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Address:</span> <span className="flex-1 line-clamp-3 font-bold text-text-muted">{data.receiverAddress}</span></p>

                        <p className="border-t border-card-border pt-2 mt-auto flex w-full leading-tight overflow-hidden"><span className="font-bold w-[35%] shrink-0">Destination:</span> <span className="flex-1 truncate font-bold">{data.receiverCity}</span></p>
                        <p className="border-t border-card-border pt-2 flex w-full leading-tight overflow-hidden font-bold">
                            COD Amount: Rs {data.paymentType === 'COD' ? data.codAmount : '0'}/-
                        </p>
                    </div>
                </div>

                {/* Column 2: Shipper Information */}
                <div className="w-[33.33%] border-r border-black flex flex-col h-full overflow-hidden">
                    <div className="border-b border-black font-bold py-1 text-center h-[16%] flex items-center justify-center shrink-0 bg-card-bg">Shipper Information</div>
                    <div className="flex flex-col items-center justify-center p-2 border-b border-black h-[45%] overflow-hidden bg-card-bg">
                        {data.sellerLogo ? (
                            <img src={data.sellerLogo} className="h-8 mb-1 object-contain" />
                        ) : (
                            <h2 className="font-black text-[12px] mb-1 truncate max-w-full text-[#3ce086] tracking-widest">{data.senderName}</h2>
                        )}
                        <span className="font-bold text-[11px] mb-1 truncate max-w-full">Order:{data.orderRef}</span>
                        <div className="w-full flex justify-center items-center overflow-hidden h-[18px]">
                            <SafeBarcode value={data.orderRef} width={1} height={18} displayValue={false} />
                        </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1 flex-1 overflow-hidden bg-card-bg">
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Name:</span> <span className="flex-1 truncate font-bold text-text-muted">{data.senderName}</span></p>
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Phone:</span> <span className="flex-1 truncate font-bold text-text-muted">{data.senderPhone}</span></p>
                        <p className="flex w-full leading-tight overflow-hidden"><span className="font-bold w-[25%] shrink-0">Address:</span> <span className="flex-1 line-clamp-2 font-bold text-text-muted">{data.senderAddress}</span></p>
                    </div>
                </div>

                {/* Column 3: Parcel Information */}
                <div className="w-[33.33%] flex flex-col h-full overflow-hidden">
                    <div className="border-b border-black font-bold py-1 text-center h-[16%] flex items-center justify-center shrink-0 bg-card-bg">Parcel Information</div>
                    <div className="flex flex-col h-[84%] bg-card-bg">
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Date:</span><span className="truncate">{data.orderDate}</span></div>
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Service:</span><span className="truncate">Overnight</span></div>
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Weight:</span><span className="truncate">{data.weight} KG</span></div>
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Pieces:</span><span className="truncate">{data.pieces}</span></div>
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Handling:</span><span className="truncate">{data.instructions?.fragile ? 'Fragile' : ''}</span></div>
                        <div className="px-3 border-b border-card-border flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Payment Mode:</span><span className="truncate">{data.paymentType}</span></div>
                        <div className="px-3 flex-1 flex items-center overflow-hidden"><span className="font-bold w-[35%] shrink-0">Items Qty:</span><span className="truncate">{data.pieces}</span></div>
                    </div>
                </div>
            </div>

            {/* Bottom Area: Remarks & Products */}
            <div className="flex flex-col border-t border-black h-[19%] overflow-hidden shrink-0 bg-card-bg">
                <div className="flex border-b border-black flex-1 overflow-hidden">
                    <div className="w-[33.33%] border-r border-black font-bold flex items-center justify-center shrink-0">Remarks</div>
                    <div className="flex-1 px-3 flex items-center truncate text-[9px]">{data.specialInstructions}</div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[33.33%] border-r border-black font-bold flex items-center justify-center shrink-0">Products</div>
                    <div className="flex-1 px-3 flex items-center truncate font-bold text-[9px]">{data.pieces} x {data.contents}</div>
                </div>
            </div>

        </div>
    );
};

// ==========================================
// 4. LEOPARDS STYLE (Mapped to IconHeader - Exact 4.jpg)
// ==========================================
export const IconHeader = ({ data }: { data: LabelData }) => {
    return (
        <div className="w-[576px] h-[384px] bg-card-bg text-black font-sans border-2 border-black flex flex-col box-border text-[9px] overflow-hidden shrink-0 m-0 p-0">
            {/* Header Bar */}
            <div className="flex justify-between items-center px-4 border-b-2 border-black h-[15%] overflow-hidden shrink-0">
                <div className="w-[30%] overflow-hidden">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase truncate leading-none">{data.courier || 'LEOPARDS'}</h1>
                </div>
                <div className="w-[40%] text-center overflow-hidden flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-black uppercase tracking-widest truncate leading-none">OVERNIGHT</h2>
                    <span className="font-bold text-[10px] truncate mt-0.5">(COD PARCEL)</span>
                </div>
                <div className="w-[30%] text-right font-bold text-[11px] truncate">Handle with care</div>
            </div>

            {/* Main Columns */}
            <div className="flex h-[85%] overflow-hidden">

                {/* Column 1: Addresses */}
                <div className="w-[33%] border-r-2 border-black flex flex-col h-full overflow-hidden">
                    <div className="h-[8%] flex items-center justify-center font-bold border-b border-black text-[10px] shrink-0">Consignee / Shipper Information</div>

                    <div className="h-[8%] flex items-center justify-center font-bold border-b border-black shrink-0">Consignee Information</div>
                    <div className="p-3 flex flex-col justify-start gap-1.5 border-b-2 border-black h-[38%] overflow-hidden">
                        <div className="flex leading-tight overflow-hidden"><span className="w-14 font-bold shrink-0">Name :</span> <span className="flex-1 truncate text-text-main">{data.receiverName}</span></div>
                        <div className="flex leading-tight overflow-hidden"><span className="w-14 font-bold shrink-0">Address :</span> <span className="flex-1 line-clamp-2 text-text-main">{data.receiverAddress} {data.receiverCity}</span></div>
                        <div className="flex leading-tight overflow-hidden"><span className="w-14 font-bold shrink-0">Contact #:</span> <span className="flex-1 truncate text-text-main">{data.receiverPhone}</span></div>
                    </div>

                    <div className="h-[8%] flex items-center justify-center font-bold border-b border-black shrink-0">Shipper Information</div>
                    <div className="p-3 flex flex-col justify-start gap-1.5 flex-1 overflow-hidden">
                        <div className="flex leading-tight overflow-hidden"><span className="w-16 font-bold shrink-0">AC / Name :</span> <span className="flex-1 truncate text-text-main">{data.orderRef} / {data.senderName}</span></div>
                        <div className="flex leading-tight overflow-hidden"><span className="w-16 font-bold shrink-0">Address :</span> <span className="flex-1 line-clamp-2 text-text-main">{data.senderAddress}</span></div>
                        <div className="flex leading-tight overflow-hidden"><span className="w-16 font-bold shrink-0">Contact #:</span> <span className="flex-1 truncate text-text-main">{data.senderPhone}</span></div>
                    </div>
                </div>

                {/* Column 2: QR & Tracking */}
                <div className="w-[34%] border-r-2 border-black flex flex-col h-full overflow-hidden">
                    <div className="h-[8%] flex items-center justify-center font-bold border-b-2 border-black w-full shrink-0">Consignment Information</div>
                    <div className="flex-1 flex flex-col items-center justify-center w-full p-2 overflow-hidden h-[72%]">
                        <QRCode value={data.trackingNumber || data.orderRef || ' '} size={140} />
                        <div className="mt-4 w-full flex justify-center h-[35px] overflow-hidden">
                            <SafeBarcode value={data.trackingNumber || data.orderRef} width={1.2} height={35} fontSize={10} displayValue={false} />
                        </div>
                        <span className="text-[11px] font-bold mt-1 tracking-widest">{data.trackingNumber}</span>
                    </div>
                    <div className="w-full border-t-2 border-black h-[20%] flex flex-col shrink-0 overflow-hidden">
                        <div className="flex border-b border-black flex-1 overflow-hidden"><span className="px-2 font-bold w-[45%] border-r border-black flex items-center shrink-0">Tracking No :</span><span className="px-2 font-black text-[12px] flex-1 flex items-center justify-center truncate tracking-widest">{data.trackingNumber}</span></div>
                        <div className="flex flex-1 overflow-hidden"><span className="px-2 font-bold w-[45%] border-r border-black flex items-center shrink-0">Destination :</span><span className="px-2 font-black text-[12px] flex-1 flex items-center justify-center uppercase truncate">{data.receiverCity}</span></div>
                    </div>
                </div>

                {/* Column 3: Shipment Details */}
                <div className="w-[33%] flex flex-col h-full overflow-hidden">
                    <div className="h-[8%] flex items-center justify-center font-bold border-b-2 border-black shrink-0">Shipment Information</div>

                    <div className="px-3 border-b border-black h-[10%] flex items-center overflow-hidden"><span className="font-bold w-14 shrink-0">Pieces :</span> <span className="font-bold truncate">{data.pieces} PCS</span></div>
                    <div className="px-3 border-b border-black h-[12%] flex items-center overflow-hidden"><span className="font-bold w-14 shrink-0">Weight<br />:</span> <span className="truncate">{data.weight} (KG)</span></div>

                    <div className="px-3 border-b border-black h-[25%] flex justify-center items-center shrink-0 overflow-hidden">
                        <span className="font-bold w-14 block self-start pt-2 shrink-0">COD<br />Amount<br />:</span>
                        {data.paymentType === 'COD' ? (
                            <div className="flex flex-col items-center w-full h-full justify-center">
                                <div className="h-[40px] w-full overflow-hidden flex justify-center"><SafeBarcode value={`PKR${data.codAmount}`} width={1.2} height={40} displayValue={false} /></div>
                                <span className="text-[10px] font-bold mt-1 truncate">PKR {data.codAmount}.00</span>
                            </div>
                        ) : (
                            <span className="font-black text-xl text-center block w-full">PREPAID</span>
                        )}
                    </div>

                    <div className="px-3 border-b border-black h-[14%] flex items-center overflow-hidden"><span className="font-bold w-14 shrink-0">Order<br />ID :</span> <span className="truncate text-text-main font-bold">{data.orderRef}</span></div>
                    <div className="px-3 border-b border-black h-[10%] flex items-center overflow-hidden"><span className="font-bold w-14 shrink-0">Origin :</span> <span className="truncate uppercase text-text-main">{data.receiverProvince || 'PUNJAB'}</span></div>
                    <div className="px-3 border-b border-black h-[11%] flex items-center overflow-hidden"><span className="font-bold w-16 shrink-0">Booking<br />Date :</span> <span className="truncate text-text-main">{data.orderDate}</span></div>

                    <div className="p-2 h-[10%] flex flex-col shrink-0 overflow-hidden bg-card-bg">
                        <span className="font-bold border-b border-slate-300 pb-0.5 mb-0.5 w-[50%]">Remarks :-</span>
                        <span className="text-[9px] truncate text-text-muted font-bold">{data.paymentType === 'COD' ? 'CBD' : ''} {data.instructions.fragile ? 'Fragile' : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. M&P STYLE (Mapped to QRModern - Exact 5.jpg)
// ==========================================
export const QRModern = ({ data }: { data: LabelData }) => {
    return (
        <div className="w-[576px] h-[384px] bg-card-bg text-black font-sans border-2 border-black flex flex-col box-border text-[10px] overflow-hidden shrink-0 m-0 p-0">

            {/* Top Bar with Barcode */}
            <div className="flex border-b border-black h-[15%] overflow-hidden shrink-0">
                <div className="w-[30%] border-r border-black flex flex-col items-center justify-center overflow-hidden p-1 relative">
                    <div className="flex items-center justify-center">
                        <span className="text-[45px] font-black tracking-tighter text-text-muted leading-none">M</span>
                        <span className="text-[35px] font-black text-orange-500 leading-none mb-2">&</span>
                        <span className="text-[45px] font-black tracking-tighter text-orange-500 leading-none">P</span>
                    </div>
                    <span className="text-[5px] font-bold absolute bottom-1">COURIER . LOGISTICS . COD</span>
                </div>
                <div className="w-[45%] border-r border-black flex flex-col items-center justify-center p-1 pt-2 overflow-hidden bg-card-bg">
                    <div className="w-full flex items-center justify-center h-[70%]">
                        <SafeBarcode value={data.trackingNumber || data.orderRef} width={1.2} height={25} fontSize={10} displayValue={false} />
                    </div>
                    <span className="text-[9px] font-bold mt-1 tracking-widest">{data.trackingNumber || data.orderRef}</span>
                </div>
                <div className="w-[25%] flex flex-col h-full overflow-hidden">
                    <div className="h-1/2 border-b border-black flex items-center justify-center text-[10px] bg-bg-subtle shrink-0">COD Amount</div>
                    <div className="h-1/2 flex items-center justify-center font-black text-xl truncate">{data.paymentType === 'COD' ? data.codAmount : '0'}</div>
                </div>
            </div>

            {/* Consignee Row */}
            <div className="flex border-b border-black h-[22%] overflow-hidden shrink-0">
                <div className="w-[30%] border-r border-black flex items-center justify-center p-2 overflow-hidden bg-card-bg">
                    <QRCode value={data.trackingNumber || data.orderRef || ' '} size={60} />
                </div>
                <div className="w-[5%] border-r border-black flex items-center justify-center bg-bg-subtle shrink-0">
                    <span className="transform -rotate-90 whitespace-nowrap text-[9px] font-bold">Consignee</span>
                </div>
                <div className="w-[65%] flex flex-col h-full overflow-hidden">
                    <div className="flex border-b border-black h-1/2 shrink-0">
                        <div className="w-[65%] border-r border-black font-bold px-3 text-[12px] flex items-center truncate">{data.receiverName}</div>
                        <div className="w-[35%] font-bold px-3 text-[12px] flex items-center justify-center truncate">{data.receiverPhone}</div>
                    </div>
                    <div className="p-2 leading-snug font-bold text-[10px] flex-1 flex items-center overflow-hidden">
                        <span className="line-clamp-2">{data.receiverAddress} {data.receiverCity} {data.receiverPhone} {data.receiverName}</span>
                    </div>
                </div>
            </div>

            {/* Shipper Rows Container */}
            <div className="flex border-b border-black h-[25%] overflow-hidden shrink-0">
                {/* Left Origin Box */}
                <div className="w-[30%] border-r border-black flex items-center justify-center font-bold text-sm uppercase truncate px-2 bg-card-bg">
                    {data.receiverCity?.substring(0, 3)} to {data.senderCity?.substring(0, 3) || 'KHI'}
                </div>
                {/* Vertical Text */}
                <div className="w-[5%] border-r border-black flex items-center justify-center bg-bg-subtle shrink-0">
                    <span className="transform -rotate-90 whitespace-nowrap text-[9px] font-bold">Shipper</span>
                </div>
                {/* Shipper Details */}
                <div className="w-[65%] flex flex-col h-full overflow-hidden">
                    <div className="border-b border-black font-bold px-2 py-1 flex items-center justify-center tracking-widest text-[11px] truncate shrink-0 h-[33.33%] uppercase bg-card-bg">
                        {data.senderName}
                    </div>
                    <div className="flex border-b border-black overflow-hidden h-[33.33%]">
                        <div className="w-[30%] border-r border-black px-2 flex items-center text-[9px] shrink-0 bg-bg-subtle">Pickup Address</div>
                        <div className="flex-1 px-2 flex items-center justify-center uppercase font-bold truncate text-[10px]">{data.senderAddress}</div>
                    </div>
                    <div className="flex overflow-hidden h-[33.33%]">
                        <div className="w-[30%] border-r border-black px-2 flex items-center text-[9px] shrink-0 bg-bg-subtle">Return Address</div>
                        <div className="flex-1 px-2 flex items-center justify-center font-bold truncate text-[10px]">Same as above</div>
                    </div>
                </div>
            </div>

            {/* Bottom Section (Details Grid) */}
            <div className="flex flex-1 overflow-hidden shrink-0">
                <div className="w-[35%] border-r border-black flex flex-col h-full overflow-hidden bg-card-bg">
                    <div className="border-b border-black font-black text-center text-[12px] h-[30%] flex items-center justify-center">
                        Standard (Upto 2KG)
                    </div>
                    <div className="flex flex-col flex-1 text-[8.5px]">
                        <div className="flex border-b border-black flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Return Branch:</div><div className="flex-1 flex items-center justify-center font-bold truncate">{data.senderCity?.substring(0, 3)?.toUpperCase() || 'KHI'}</div></div>
                        <div className="flex border-b border-black flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Order Ref. No.:</div><div className="flex-1 flex items-center justify-center font-bold truncate">{data.orderRef}</div></div>
                        <div className="flex border-b border-black flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Pieces:</div><div className="flex-1 flex items-center justify-center font-bold truncate">{data.pieces}</div></div>
                        <div className="flex border-b border-black flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Weight:</div><div className="flex-1 flex items-center justify-center font-bold truncate">{data.weight}</div></div>
                        <div className="flex border-b border-black flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Insurance Value:</div><div className="flex-1"></div></div>
                        <div className="flex flex-1 overflow-hidden"><div className="w-[45%] border-r border-black px-2 flex items-center shrink-0">Printed On</div><div className="flex-1 flex items-center justify-center font-bold truncate">{data.orderDate}</div></div>
                    </div>
                </div>

                <div className="w-[65%] flex flex-col h-full overflow-hidden bg-card-bg">
                    <div className="border-b border-black p-2 h-1/2 overflow-hidden flex flex-col justify-center">
                        <span className="font-bold block text-[10px]">Product Details:</span>
                        <span className="text-[12px] block mt-1 font-bold truncate px-2">{data.contents}</span>
                    </div>
                    <div className="p-2 h-1/2 overflow-hidden flex flex-col justify-center">
                        <span className="font-bold block text-[10px]">Shipper Remarks:</span>
                        <span className="text-[11px] block mt-1 truncate px-2 text-text-main">{data.specialInstructions}</span>
                    </div>
                </div>
            </div>

            {/* Urdu Footer */}
            <div className="border-t-2 border-black px-2 py-1 text-[8px] text-center bg-bg-subtle font-bold flex items-center justify-center h-[8%] shrink-0 leading-tight">
                اگر پیکنگ برقرار نہیں ہے تو پارسل وصول نہ کریں۔ سی او ڈی رقم ادا کرنے سے پہلے پارسل کھولنا منع ہے۔ کسی بھی مسئلے کی صورت میں آن لائن شاپ یا بھیجنے والے سے رابطہ کریں۔
            </div>
        </div>
    );
};