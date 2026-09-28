'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, ProductVariant } from '@/types';
import { usePOS } from '@/context/POSContext';
import { formatCurrency } from '@/lib/utils';
import { X, Check, ShoppingBag, ShieldCheck, Cpu, Palette, AlertCircle, Plus, Minus } from 'lucide-react';

interface VariantModalProps {
  product: Product | null;
  onClose: () => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({ product, onClose }) => {
  const { addToCart, activeBranchId, activeBranch, branches } = usePOS();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      // Pick first in-stock variant by default
      const inStock = product.variants.find(v => (v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0)) > 0) || product.variants[0];
      setSelectedVariant(inStock);
      setQuantity(1);
      setSelectedSerial(inStock.serialNumbers?.[0] || '');
    }
  }, [product, activeBranchId]);

  if (!product || !selectedVariant || !mounted) return null;

  const currentBranchStock = selectedVariant.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? selectedVariant.stock : 0);

  const handleAddToCart = () => {
    if (!selectedVariant || currentBranchStock <= 0) return;
    addToCart(product, selectedVariant, quantity, selectedSerial);
    onClose();
  };

  // Group unique colors
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100/80">
                {product.brand}
              </span>
              <span className="text-xs text-slate-500 font-mono">SKU: {selectedVariant.sku}</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top Product Hero Summary */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/10 shadow-xs shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedVariant.image || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-black text-slate-900 font-mono">
                {formatCurrency(selectedVariant.price)}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {currentBranchStock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> {currentBranchStock} in stock at {activeBranch.code}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200/80">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Out of Stock at {activeBranch.code}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono">Cost: {formatCurrency(selectedVariant.costPrice)}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{product.description}</p>
            </div>
          </div>

          {/* Multi-Branch Inventory Availability Matrix */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Multi-Store Stock Availability
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {branches.map(b => {
                const stockInBranch = selectedVariant.branchStocks?.[b.id] ?? (b.id === 'branch-1' ? selectedVariant.stock : 0);
                const isCurrent = b.id === activeBranchId;
                return (
                  <div 
                    key={b.id} 
                    className={`p-2 rounded-xl border flex flex-col justify-between ${
                      isCurrent 
                        ? 'bg-blue-50/90 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-500/20' 
                        : 'bg-white border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span className="truncate font-bold text-[10px] text-slate-600">{b.name.split(' ')[0]}</span>
                    <span className={`text-xs font-black mt-0.5 ${
                      stockInBranch > 0 ? (isCurrent ? 'text-blue-700' : 'text-slate-900') : 'text-rose-500'
                    }`}>
                      {stockInBranch} units
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color & Variant Selection */}
          {uniqueColors.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Palette className="w-4 h-4 text-indigo-600" /> Color Option: <span className="text-slate-900 font-extrabold">{selectedVariant.color}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  const vBranchStock = v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedSerial(v.serialNumbers?.[0] || '');
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{v.color}</span>
                      {v.storage && <span className="text-[11px] text-slate-400 font-normal">({v.storage})</span>}
                      <span className={`text-[10px] font-mono font-bold ${vBranchStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        [{vBranchStock} at store]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Condition & Specs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Device Condition
              </span>
              <p className="text-xs font-extrabold text-slate-800 mt-1">{selectedVariant.condition}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" /> RAM / Memory
              </span>
              <p className="text-xs font-extrabold text-slate-800 mt-1">{selectedVariant.ram || 'Standard'}</p>
            </div>
          </div>

          {/* IMEI / Serial Tracker (For Smartphones) */}
          {selectedVariant.serialNumbers && selectedVariant.serialNumbers.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Assign Device IMEI / Serial Number (Optional)
              </label>
              <select
                value={selectedSerial}
                onChange={(e) => setSelectedSerial(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold transition-all"
              >
                {selectedVariant.serialNumbers.map((imei) => (
                  <option key={imei} value={imei}>
                    IMEI: {imei}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Quantity</span>
              <span className="text-[11px] text-slate-400 font-medium">Available: {selectedVariant.stock} units</span>
            </div>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-100/90 p-0.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 transition-all font-bold text-sm shadow-2xs active:scale-90 cursor-pointer"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="w-10 text-center text-xs font-black text-slate-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                disabled={quantity >= selectedVariant.stock}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 transition-all font-bold text-sm disabled:opacity-40 shadow-2xs active:scale-90 cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/90 border-t border-slate-200">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">Total Line Amount</span>
            <span className="text-base font-black text-slate-900 font-mono">
              {formatCurrency(selectedVariant.price * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={selectedVariant.stock <= 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                selectedVariant.stock > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart ({quantity})</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
