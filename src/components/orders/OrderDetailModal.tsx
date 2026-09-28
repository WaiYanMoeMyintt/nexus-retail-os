'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '@/types';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RefundModal } from './RefundModal';
import { ReceiptModal } from '../pos/ReceiptModal';
import { 
  X, 
  Printer, 
  RotateCcw, 
  User, 
  CreditCard, 
  AlertCircle, 
  Ban, 
  Copy, 
  Phone, 
  Mail, 
  Receipt 
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { cancelOrder } = usePOS();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isRefunded = order.paymentStatus === 'refunded';
  const isCancelled = order.orderStatus === 'cancelled';

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(order.id, 'Cancelled by store manager');
      toast.info(`Order #${order.id} cancelled`);
    }
  };

  const handleCopyImei = (imei: string) => {
    navigator.clipboard.writeText(imei);
    toast.success(`IMEI ${imei} copied`);
  };

  // Human-readable formatters
  const formatFulfillmentType = (type?: string) => {
    if (!type) return 'In-Store POS';
    switch (type.toLowerCase()) {
      case 'in_store_pos':
      case 'in-store':
        return 'In-Store POS Checkout';
      case 'delivery':
        return 'Express Home Delivery';
      case 'pickup':
        return 'Customer Store Pickup';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'Card';
    switch (method.toLowerCase()) {
      case 'card':
        return 'Credit / Debit Card';
      case 'cash':
        return 'Cash Payment';
      case 'mobile_digital':
      case 'mobile':
        return 'Mobile Digital (Apple Pay / Google Pay)';
      case 'store_credit':
        return 'Store Credit / Voucher';
      default:
        return method.replace(/_/g, ' ');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 ring-1 ring-indigo-500/10">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900 font-mono tracking-tight">{order.receiptNumber}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : order.paymentStatus === 'refunded'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-500' :
                    order.paymentStatus === 'refunded' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  {order.paymentStatus}
                </span>
                <span className="text-xs text-slate-400 font-mono">#{order.id}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                Placed on {formatDate(order.createdAt, true)} • {order.branchName || 'HQ Store'} • Cashier: {order.cashierName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 overscroll-contain">
          {/* Status Alert if refunded or cancelled */}
          {isRefunded && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-900 block">Refund Processed</strong>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Refunded on {formatDate(order.refundedAt || order.createdAt, true)}. Reason: {order.refundReason || 'Customer return'}
                </p>
              </div>
            </div>
          )}

          {/* Customer & Fulfillment Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Card */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customer Information</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {order.customer ? order.customer.name : 'Walk-in Guest'}
                </p>
                {order.customer?.phone && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.customer.phone}</span>
                  </p>
                )}
                {order.customer?.email && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{order.customer.email}</span>
                  </p>
                )}
                {order.customer?.tier && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Tier: {order.customer.tier} • {order.customer.loyaltyPoints || 0} pts
                  </span>
                )}
              </div>
            </div>

            {/* Fulfillment & Payment Card */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fulfillment & Payment</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-700 font-medium">
                  Type: <strong className="text-slate-900 font-bold">{formatFulfillmentType(order.fulfillmentType)}</strong>
                </p>
                <p className="text-slate-700 font-medium">
                  Method: <strong className="text-slate-900 font-bold">{formatPaymentMethod(order.paymentMethod)}</strong>
                </p>
                {order.paymentDetails?.cardLast4 && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Card: {order.paymentDetails.cardType || 'Visa'} •••• {order.paymentDetails.cardLast4}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Purchased Line Items ({order.items.length})</span>
              <span className="text-[11px] font-semibold text-slate-400 capitalize">{order.items.reduce((s, i) => s + i.quantity, 0)} total units</span>
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Modern Borderless Thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="font-bold text-slate-900 text-xs block leading-tight truncate">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate font-medium">
                        {item.variantSummary}
                      </span>
                      {item.selectedSerial && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-md">
                            IMEI: {item.selectedSerial}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyImei(item.selectedSerial!)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors cursor-pointer"
                            title="Copy IMEI"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-900 text-xs font-mono block">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discounts Applied {order.appliedCoupon ? `(${order.appliedCoupon})` : ''}</span>
                <span className="font-mono">-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 font-medium">
              <span>Tax ({order.taxRate}%)</span>
              <span className="font-mono">{formatCurrency(order.taxTotal)}</span>
            </div>

            <div className="flex justify-between text-sm font-black text-slate-900 pt-2.5 border-t border-slate-200/80">
              <span className="tracking-tight">Grand Total</span>
              <span className="text-base font-black text-indigo-600 font-mono">{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isRefunded && !isCancelled && (
              <button
                type="button"
                onClick={() => setShowRefundModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Refund</span>
              </button>
            )}

            {!isCancelled && !isRefunded && (
              <button
                type="button"
                onClick={handleCancelOrder}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice / Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showRefundModal && (
        <RefundModal
          order={order}
          onClose={() => setShowRefundModal(false)}
          onRefundComplete={() => {
            setShowRefundModal(false);
            onClose();
          }}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal
          order={order}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>,
    document.body
  );
};
