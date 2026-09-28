'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { X, ScanLine, Barcode, Check, Search, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerModalProps {
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose }) => {
  const { products, addToCart } = usePOS();
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleScanCode = (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    // Search by product barcode, variant barcode, or IMEI serial
    let foundProduct = null;
    let foundVariant = null;

    for (const p of products) {
      if (p.barcode === clean) {
        foundProduct = p;
        foundVariant = p.variants[0];
        break;
      }
      for (const v of p.variants) {
        if (v.barcode === clean || v.sku === clean || (v.serialNumbers && v.serialNumbers.includes(clean))) {
          foundProduct = p;
          foundVariant = v;
          break;
        }
      }
      if (foundProduct) break;
    }

    if (foundProduct && foundVariant) {
      addToCart(foundProduct, foundVariant, 1);
      toast.success(`Scanned: ${foundProduct.name} (${foundVariant.color})`);
      setBarcodeInput('');
    } else {
      toast.error(`No item found matching barcode/IMEI: "${clean}"`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanCode(barcodeInput);
  };

  // Quick preset barcodes
  const presets = [
    { label: 'iPhone 16 Pro Max 256GB', code: '890123450101', brand: 'Apple' },
    { label: 'Galaxy S24 Ultra 256GB', code: '890123450201', brand: 'Samsung' },
    { label: 'AirPods Pro 2 (USB-C)', code: '890123450801', brand: 'Apple' },
    { label: 'Sony WH-1000XM5 Black', code: '890123450701', brand: 'Sony' },
    { label: 'Anker Prime 100W GaN', code: '890123451101', brand: 'Anker' },
    { label: 'Spigen MagFit Clear Case', code: '890123451301', brand: 'Spigen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ScanLine className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Barcode & IMEI Scanner</h3>
              <p className="text-[11px] text-slate-500">Scan hardware barcode or enter manual SKU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Laser Scanner Visual Effect */}
          <div className="relative h-28 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-center p-4 overflow-hidden border border-slate-800">
            <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-bounce top-1/2 -translate-y-1/2" />
            <Barcode className="w-16 h-12 text-slate-600 mb-1" />
            <span className="text-xs text-slate-400 font-mono">OPTICAL SCANNER READY</span>
            <span className="text-[10px] text-slate-500">Point handheld scanner or enter barcode below</span>
          </div>

          {/* Barcode Input Form */}
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Scan or type barcode (e.g. 890123450101)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Scan & Add
            </button>
          </form>

          {/* Quick Preset Barcode Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Quick Test Simulation Barcodes:
            </span>
            <div className="space-y-1.5">
              {presets.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => handleScanCode(p.code)}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    <span className="font-medium text-slate-800 truncate">{p.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    {p.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
