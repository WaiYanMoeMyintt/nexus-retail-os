'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { StockMovementType } from '@/types';
import { X, Boxes, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StockAdjustmentModalProps {
  onClose: () => void;
  preselectedProductId?: string;
  preselectedVariantId?: string;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ 
  onClose,
  preselectedProductId,
  preselectedVariantId
}) => {
  const { products, adjustStock } = usePOS();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedProdId, setSelectedProdId] = useState(preselectedProductId || products[0]?.id || '');
  const selectedProduct = products.find(p => p.id === selectedProdId) || products[0];

  const [selectedVarId, setSelectedVarId] = useState(
    preselectedVariantId || selectedProduct?.variants[0]?.id || ''
  );
  const selectedVariant = selectedProduct?.variants.find(v => v.id === selectedVarId) || selectedProduct?.variants[0];

  const [adjustmentType, setAdjustmentType] = useState<StockMovementType>('restock');
  const [qtyDelta, setQtyDelta] = useState<number>(10);
  const [reason, setReason] = useState('Supplier shipment replenishment');
  const [performedBy, setPerformedBy] = useState('Dave (Inventory Mgr)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedVariant) return;

    let delta = Math.abs(qtyDelta);
    if (adjustmentType === 'damaged_writeoff' || (adjustmentType === 'adjustment' && qtyDelta < 0)) {
      delta = -delta;
    } else if (adjustmentType === 'audit_count') {
      // Delta to reach exact target
      delta = qtyDelta - selectedVariant.stock;
    }

    adjustStock(selectedProduct.id, selectedVariant.id, delta, reason.trim() || 'Inventory stock update', adjustmentType, performedBy);
    toast.success('Stock adjusted successfully!');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Adjust Inventory Stock</h2>
              <p className="text-[11px] text-slate-500 font-medium">Record stock replenishment, audits, or damaged item write-offs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Product */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Product *
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => {
                setSelectedProdId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p && p.variants.length > 0) {
                  setSelectedVarId(p.variants[0].id);
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 cursor-pointer focus:border-blue-500 focus:outline-hidden"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand}) • {p.totalStock} in stock
                </option>
              ))}
            </select>
          </div>

          {/* Select Variant */}
          {selectedProduct && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Variant / SKU *
              </label>
              <select
                value={selectedVarId}
                onChange={(e) => setSelectedVarId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-mono text-slate-800 cursor-pointer focus:border-blue-500 focus:outline-hidden"
              >
                {selectedProduct.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.color} {v.storage ? `(${v.storage})` : ''} • SKU: {v.sku} (Current Stock: {v.stock})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Adjustment Reason Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'restock', label: 'Restock / PO (+)' },
                { type: 'audit_count', label: 'Audit / Count' },
                { type: 'damaged_writeoff', label: 'Damaged / Scrap (-)' }
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => {
                    setAdjustmentType(t.type as any);
                    if (t.type === 'restock') setReason('Supplier shipment replenishment');
                    else if (t.type === 'audit_count') setReason('Physical stock audit count');
                    else setReason('Floor damage / defective unit write-off');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    adjustmentType === t.type
                      ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {adjustmentType === 'audit_count' ? 'Exact Audited Stock Count:' : 'Quantity to Add / Deduct:'}
              </label>
              <span className="text-xs text-slate-500 font-mono">
                Current: <strong>{selectedVariant?.stock || 0}</strong>
              </span>
            </div>
            <input
              type="number"
              min={adjustmentType === 'audit_count' ? 0 : 1}
              required
              value={qtyDelta}
              onChange={(e) => setQtyDelta(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Reason Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Audit Reason / Reference Note *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Received PO #8841 from Apple distributor"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Performed By (Staff / Manager)
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Commit Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
