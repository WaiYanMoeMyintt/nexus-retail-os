'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { PaymentTransaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { 
  CreditCard, 
  Search, 
  Download, 
  Banknote, 
  QrCode, 
  RotateCcw, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentsView: React.FC = () => {
  const { payments, globalSearch, setGlobalSearch } = usePOS();
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchId = p.id.toLowerCase().includes(q);
        const matchCust = p.customerName.toLowerCase().includes(q);
        const matchRef = p.reference.toLowerCase().includes(q);
        const matchReceipt = p.receiptNumber.toLowerCase().includes(q);
        return matchId || matchCust || matchRef || matchReceipt;
      }
      return true;
    });
  }, [payments, methodFilter, typeFilter, globalSearch]);

  const handleExportCSV = () => {
    const headers = ['Txn ID', 'Receipt #', 'Date', 'Customer', 'Amount', 'Method', 'Type', 'Status', 'Reference', 'Cashier'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.receiptNumber,
      `"${formatDate(p.createdAt, true)}"`,
      `"${p.customerName}"`,
      p.amount,
      p.method,
      p.type,
      p.status,
      `"${p.reference}"`,
      `"${p.cashierName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexustech_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transaction ledger exported to CSV');
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <QrCode className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Payment Gateway & Register Ledger</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-100">
              {filteredPayments.length} Transactions
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Audit trail for credit card terminals, cash receipts, and digital wallet authorizations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference #, customer name, transaction ID..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Credit / Debit Card</option>
              <option value="mobile_digital">Mobile / Digital</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Transaction Types</option>
              <option value="payment">Sales Payments</option>
              <option value="refund">Returns & Refunds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Receipt #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Authorization Reference</th>
                <th className="p-3.5">Cashier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((txn) => {
                const isRefund = txn.type === 'refund';

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {txn.id}
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      {txn.receiptNumber}
                    </td>

                    <td className="p-3.5 text-slate-500">
                      {formatDate(txn.createdAt, true)}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800">
                      {txn.customerName}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 capitalize font-medium text-slate-700">
                        {getMethodIcon(txn.method)}
                        <span>{txn.method.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold">
                      <span className={isRefund ? 'text-rose-600' : 'text-slate-900'}>
                        {isRefund ? `-${formatCurrency(txn.amount)}` : formatCurrency(txn.amount)}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        txn.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : txn.status === 'refunded'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {txn.status}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                      {txn.reference}
                    </td>

                    <td className="p-3.5 text-slate-700 font-medium">
                      {txn.cashierName}
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <FileText className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <p className="font-bold text-xs text-slate-600">No payment transactions found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your payment method or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
