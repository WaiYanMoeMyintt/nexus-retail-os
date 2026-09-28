'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface RefundModalProps {
  order: Order;
  onClose: () => void;
  onRefundComplete: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ order, onClose, onRefundComplete }) => {
  const { refundOrder } = usePOS();

  const [reason, setReason] = useState('Customer return within 14-day policy');
  const [returnToStock, setReturnToStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify a reason for refund');
      return;
    }

    setIsSubmitting(true);
    const success = refundOrder(order.id, reason.trim(), returnToStock);
    setIsSubmitting(false);

    if (success) {
      onRefundComplete();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Process Order Refund</h2>
              <p className="text-[11px] text-slate-500 font-mono">Order #{order.id} • {order.receiptNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Refund Amount Summary Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">Refund Amount Due</span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              {formatCurrency(order.grandTotal)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Method: <strong className="text-white capitalize">{order.paymentMethod.replace('_', ' ')}</strong>
            </p>
          </div>

          {/* Refund Reason */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Refund Reason / Return Inspection Notes *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer returned phone in sealed box within 14 days..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden transition-all"
            />
          </div>

          {/* Restock items checkbox */}
          <div 
            onClick={() => setReturnToStock(!returnToStock)}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
          >
            <div className="mt-0.5 text-indigo-600">
              {returnToStock ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Restock Line Items Back to Inventory</span>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Automatically increment stock counts across variants & serial numbers.
              </p>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Full Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
