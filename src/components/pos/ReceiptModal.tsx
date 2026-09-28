'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  FileText, 
  Smartphone, 
  Copy, 
  Sparkles,
  Barcode as BarcodeIcon,
  Store,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

import { createPortal } from 'react-dom';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = usePOS();
  const [receiptMode, setReceiptMode] = useState<'thermal' | 'invoice'>('thermal');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!order || !mounted) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const text = `
NEXUS TECH & GADGETS
Receipt #: ${order.receiptNumber}
Date: ${formatDate(order.createdAt, true)}
Customer: ${order.customer ? order.customer.name : 'Walk-in Guest'}
Items:
${order.items.map(i => `- ${i.quantity}x ${i.productName} (${i.variantSummary}): $${(i.unitPrice * i.quantity).toFixed(2)}`).join('\n')}
Subtotal: $${order.subtotal.toFixed(2)}
Discount: -$${order.discountTotal.toFixed(2)}
Tax: $${order.taxTotal.toFixed(2)}
Grand Total: $${order.grandTotal.toFixed(2)}
Payment: ${order.paymentMethod.toUpperCase()} (Status: ${order.paymentStatus})
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Receipt details copied to clipboard!');
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Order Completed</h3>
              <p className="text-[11px] text-slate-500">Order #{order.id} • {order.receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode switch */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium mr-2">
              <button
                type="button"
                onClick={() => setReceiptMode('thermal')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  receiptMode === 'thermal' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setReceiptMode('invoice')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  receiptMode === 'invoice' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Tax Invoice
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div className="p-6 overflow-y-auto bg-slate-100/60 flex justify-center">
          <div 
            id="printable-receipt"
            className={`w-full bg-white border border-slate-200 shadow-sm p-6 text-slate-800 transition-all font-mono text-xs ${
              receiptMode === 'thermal' ? 'max-w-[340px] rounded-lg' : 'max-w-md rounded-xl'
            }`}
          >
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm tracking-tight text-slate-900">
                <Store className="w-4 h-4 text-blue-600" />
                <span>{settings.storeName}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{settings.storeTagline}</p>
              <p className="text-[10px] text-slate-500">{settings.storeAddress}</p>
              <p className="text-[10px] text-slate-500">{settings.storeCity} • Tel: {settings.storePhone}</p>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">Tax ID: {settings.taxId}</p>
            </div>

            {/* Order Metadata */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{formatDate(order.createdAt, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">
                  {order.customer ? order.customer.name : 'Walk-in Guest'}
                </span>
              </div>
              {order.customer?.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Description / Spec</span>
                <span>Amount</span>
              </div>

              {order.items.map((item, idx) => {
                const itemTotal = item.unitPrice * item.quantity;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.variantSummary} (@ {formatCurrency(item.unitPrice)})
                    </div>
                    {item.selectedSerial && (
                      <div className="text-[9px] text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded-sm inline-block">
                        IMEI: {item.selectedSerial}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Financial Calculations */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.appliedCoupon ? `(${order.appliedCoupon})` : ''}</span>
                  <span>-{formatCurrency(order.discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Sales Tax ({order.taxRate}%)</span>
                <span>{formatCurrency(order.taxTotal)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>GRAND TOTAL</span>
                <span className="text-base font-extrabold">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Payment Type:</span>
                <span className="uppercase text-blue-700">{order.paymentMethod.replace('_', ' ')}</span>
              </div>

              {order.paymentMethod === 'cash' && order.paymentDetails.amountReceived && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(order.paymentDetails.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(order.paymentDetails.changeGiven || 0)}</span>
                  </div>
                </>
              )}

              {order.paymentMethod === 'card' && (
                <div className="flex justify-between text-slate-600">
                  <span>Card / Auth:</span>
                  <span>{order.paymentDetails.cardType} ****{order.paymentDetails.cardLast4} ({order.paymentDetails.authCode})</span>
                </div>
              )}

              {order.paymentMethod === 'mobile_digital' && (
                <div className="flex justify-between text-slate-600">
                  <span>Digital Provider:</span>
                  <span>{order.paymentDetails.provider} ({order.paymentDetails.transactionRef})</span>
                </div>
              )}
            </div>

            {/* Footer Barcode & Policy */}
            <div className="text-center pt-4 space-y-2">
              <div className="flex flex-col items-center justify-center">
                <BarcodeIcon className="w-40 h-10 text-slate-800" />
                <span className="text-[10px] tracking-widest font-mono text-slate-500 mt-0.5">
                  *{order.receiptNumber}*
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-sans font-medium">
                {settings.receiptHeader}
              </p>
              <p className="text-[9px] text-slate-400 font-sans leading-tight">
                {settings.receiptFooter}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-t border-slate-200 no-print">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
