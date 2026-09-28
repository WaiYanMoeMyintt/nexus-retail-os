'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { PaymentMethod, PaymentDetails, SplitPaymentEntry } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Split, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Receipt,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface PaymentModalProps {
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onPaymentSuccess }) => {
  const { 
    cartSummary, 
    cartCustomer, 
    checkoutOrder, 
    settings 
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(cartSummary.grandTotal));
  const [cardType, setCardType] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Discover'>('Visa');
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardHolder, setCardHolder] = useState(cartCustomer?.name || 'Walk-in Customer');
  const [digitalProvider, setDigitalProvider] = useState<'Apple Pay' | 'Google Pay' | 'Venmo' | 'Zelle'>('Apple Pay');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Split Payment Entries
  const [splitEntries, setSplitEntries] = useState<SplitPaymentEntry[]>([
    { method: 'cash', amount: Math.floor(cartSummary.grandTotal / 2) },
    { method: 'card', amount: Number((cartSummary.grandTotal - Math.floor(cartSummary.grandTotal / 2)).toFixed(2)) }
  ]);

  const grandTotal = cartSummary.grandTotal;

  // Split calculations
  const totalAllocatedSplit = useMemo(() => {
    return splitEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [splitEntries]);

  const splitDifference = Number((totalAllocatedSplit - grandTotal).toFixed(2));
  const isSplitValid = paymentMethod !== 'split' || Math.abs(splitDifference) <= 0.01;

  const changeDue = Math.max(0, cashTendered - grandTotal);
  const isCashInsufficient = paymentMethod === 'cash' && cashTendered < grandTotal;

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && isCashInsufficient) {
      toast.error('Cash tendered is less than the total amount due!');
      return;
    }

    if (paymentMethod === 'split' && !isSplitValid) {
      toast.error(`Split payment breakdown must equal $${grandTotal.toFixed(2)} (Currently: $${totalAllocatedSplit.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      let details: PaymentDetails = {};

      if (paymentMethod === 'cash') {
        details = {
          amountReceived: cashTendered,
          changeGiven: changeDue,
          provider: 'Cash'
        };
      } else if (paymentMethod === 'card') {
        details = {
          cardType,
          cardLast4: cardLast4.padStart(4, '0').slice(-4),
          cardHolder,
          authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
          provider: 'Card Terminal'
        };
      } else if (paymentMethod === 'mobile_digital') {
        details = {
          provider: digitalProvider,
          transactionRef: `MOB-${digitalProvider.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}`
        };
      } else if (paymentMethod === 'split') {
        details = {
          splitBreakdown: splitEntries,
          provider: 'Cash'
        };
      }

      const createdOrder = checkoutOrder(paymentMethod, details, orderNotes);
      setIsProcessing(false);

      if (createdOrder) {
        fireConfetti();
        onPaymentSuccess();
      }
    }, 500);
  };

  const handleUpdateSplitEntry = (idx: number, field: keyof SplitPaymentEntry, val: any) => {
    const updated = [...splitEntries];
    updated[idx] = { ...updated[idx], [field]: val };
    setSplitEntries(updated);
  };

  const handleAddSplitEntry = () => {
    const remainingNeeded = Math.max(0, grandTotal - totalAllocatedSplit);
    setSplitEntries(prev => [...prev, { method: 'mobile_digital', amount: Number(remainingNeeded.toFixed(2)) }]);
  };

  const handleRemoveSplitEntry = (idx: number) => {
    if (splitEntries.length <= 1) return;
    setSplitEntries(prev => prev.filter((_, i) => i !== idx));
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">POS Tender Settlement</span>
            <h2 className="text-base font-bold text-slate-900">Payment Processing</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Amount Due Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-700">Total Payable Amount</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                {formatCurrency(grandTotal)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Customer: <strong className="text-slate-800">{cartCustomer?.name || 'Walk-in Guest'}</strong></div>
              <div>Items: <strong className="text-slate-800">{cartSummary.itemCount} units</strong></div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Tender Method
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Credit/Debit', icon: CreditCard },
                { id: 'mobile_digital', label: 'Digital Pay', icon: Smartphone },
                { id: 'split', label: 'Split Tender', icon: Split }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Forms by Method */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Amount Tendered ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex gap-2">
                {[
                  Math.ceil(grandTotal),
                  Math.ceil(grandTotal / 10) * 10,
                  Math.ceil(grandTotal / 50) * 50 || 50,
                  Math.ceil(grandTotal / 100) * 100 || 100
                ].filter((v, i, a) => a.indexOf(v) === i && v >= grandTotal).slice(0, 4).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Change Calculation Box */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Change Due to Customer</span>
                <span className={`text-xl font-mono font-bold ${
                  changeDue > 0 ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Network</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="Discover">Discover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    placeholder="4242"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted POS EMV / NFC Chip & PIN transaction terminal</span>
              </div>
            </div>
          )}

          {paymentMethod === 'mobile_digital' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Digital Wallet Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {['Apple Pay', 'Google Pay', 'Venmo', 'Zelle'].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setDigitalProvider(provider as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      digitalProvider === provider
                        ? 'border-blue-600 bg-white text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'split' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Split Tender Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddSplitEntry}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700"
                >
                  <Plus className="w-3 h-3" />
                  Add Payment Line
                </button>
              </div>

              <div className="space-y-2">
                {splitEntries.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <select
                      value={entry.method}
                      onChange={(e) => handleUpdateSplitEntry(idx, 'method', e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mobile_digital">Digital Pay</option>
                    </select>

                    <div className="relative flex-1">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={entry.amount || ''}
                        onChange={(e) => handleUpdateSplitEntry(idx, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-2 py-1 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg"
                      />
                    </div>

                    {splitEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitEntry(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Split Balance Verification */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Allocated: <strong className="font-mono text-slate-900">${totalAllocatedSplit.toFixed(2)}</strong></span>
                {splitDifference === 0 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact match
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold font-mono">
                    Difference: {splitDifference > 0 ? `+$${splitDifference}` : `-$${Math.abs(splitDifference)}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Optional Order Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Note (Optional)</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. VIP discount approved by Manager Dave"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing || (paymentMethod === 'cash' && isCashInsufficient) || (paymentMethod === 'split' && !isSplitValid)}
            onClick={handleConfirmPayment}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Settling Transaction...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Tender & Issue Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
