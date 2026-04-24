'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
    value?: string | null;
    width?: number;
    height?: number;
    fontSize?: number;
    displayValue?: boolean;
    background?: string;
}

export const SafeBarcode = ({
    value,
    width = 1.5,
    height = 40,
    fontSize = 12,
    displayValue = true,
    background = "#ffffff"
}: BarcodeProps) => {
    const barcodeRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (barcodeRef.current && value) {
            try {
                JsBarcode(barcodeRef.current, value, {
                    format: "CODE128",
                    width: width,
                    height: height,
                    displayValue: displayValue,
                    font: "monospace",
                    fontSize: fontSize,
                    textAlign: "center",
                    textMargin: 2,
                    margin: 0,
                    background: background
                });
            } catch (e) {
                console.error("Barcode generation failed", e);
            }
        }
    }, [value, width, height, fontSize, displayValue]);

    // NEW: Render a placeholder skeleton instead of collapsing the UI 
    // when waiting for the Create Shipment tracking number
    if (!value) {
        return (
            <div
                className="w-[80%] mx-auto bg-bg-muted rounded-md flex items-center justify-center border border-dashed border-slate-300"
                style={{ minHeight: `${height + (displayValue ? 15 : 0)}px` }}
            >
                <span className="text-[9px] uppercase tracking-widest text-text-muted-light font-bold">
                    Pending Barcode
                </span>
            </div>
        );
    }

    return <svg ref={barcodeRef} className="w-full h-auto max-w-full" />;
};