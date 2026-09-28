'use client';

import React, { useState, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { Order, DeviceStatus } from '@/types';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeftRight, 
  DollarSign, 
  QrCode, 
  FileText, 
  User, 
  Building2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export const ReturnsView: React.FC = () => {
  const { 
    orders, 
    devices, 
    products, 
    refundOrder, 
    processExchange, 
    permissions 
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Return / Exchange Modals State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Return Form State
  const [returnReason, setReturnReason] = useState('Customer changed mind / unopened');
  const [returnCondition, setReturnCondition] = useState<'Grade A (Restock)' | 'Defective / Damaged (Quarantine)'>('Grade A (Restock)');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'store_credit'>('card');

  // Exchange Form State
  const [exchangeImei, setExchangeImei] = useState('');
  const [exchangeReplacementVariantId, setExchangeReplacementVariantId] = useState('');
  const [exchangeReason, setExchangeReason] = useState('Screen digitizer fault within 14-day warranty');

  // Historical Returns / Refunds list
  const refundedOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'refunded' || o.orderStatus === 'exchanged');
  }, [orders]);

  const totalRefundedAmount = useMemo(() => {
    return refundedOrders.reduce((sum, o) => sum + (o.refundAmount || o.grandTotal), 0);
  }, [refundedOrders]);

  const handleOpenRefund = (order: Order) => {
    setSelectedOrder(order);
    setIsReturnModalOpen(true);
  };

  const handleOpenExchange = (order: Order) => {
    setSelectedOrder(order);
    const firstPhoneItem = order.items.find(i => i.selectedSerial);
    setExchangeImei(firstPhoneItem?.selectedSerial || '');
    // Default replacement variant to same or first available
    setExchangeReplacementVariantId(firstPhoneItem?.variantId || '');
    setIsExchangeModalOpen(true);
  };

  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const returnToStock = returnCondition === 'Grade A (Restock)';
    refundOrder(selectedOrder.id, returnReason, returnToStock, refundMethod);
    setIsReturnModalOpen(false);
  };

  const handleExecuteExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !exchangeReplacementVariantId) {
      toast.error('Select replacement device');
      return;
    }

    processExchange(selectedOrder.id, exchangeImei, exchangeReplacementVariantId, exchangeReason);
    setIsExchangeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Returns, Refunds & Exchanges Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Product inspection, IMEI device return tracking, restock vs quarantine disposition, and warranty exchanges.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Returns Settled</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            ${totalRefundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total refunded or credited</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Return Transactions</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{refundedOrders.length} <span className="text-xs font-normal text-slate-500">records</span></div>
          <div className="text-xs text-slate-500 mt-1">Full audit provenance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Quarantined / Defective</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {devices.filter(d => d.status === 'DAMAGED' || d.status === 'RETURNED').length} <span className="text-xs font-normal text-slate-500">IMEIs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Pending vendor RMA / repair</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Return Policy Window</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">14 Days</div>
          <div className="text-xs text-slate-500 mt-1">Guaranteed replacement</div>
        </div>
      </div>

      {/* Lookup & Process Returns */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Look Up Order for Return / Exchange</h3>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order ID (#ORD-2026-...), receipt #, customer name, or phone IMEI..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-3">
          {orders
            .filter(o => o.orderStatus === 'completed')
            .filter(o => 
              o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (o.customer?.name && o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
              o.items.some(i => i.selectedSerial && i.selectedSerial.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .slice(0, 5)
            .map(order => (
              <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-sm">{order.receiptNumber}</span>
                    <span className="text-xs text-slate-500">• {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-semibold">Eligible</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Customer: <strong className="text-slate-800">{order.customer?.name || 'Walk-in Customer'}</strong> • Total: <strong className="text-slate-800">${order.grandTotal.toFixed(2)}</strong>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Items: {order.items.map(i => `${i.quantity}x ${i.productName} ${i.selectedSerial ? `(IMEI: ${i.selectedSerial})` : ''}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenExchange(order)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Exchange Unit
                  </button>
                  <button
                    onClick={() => handleOpenRefund(order)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Process Refund
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Returns & Exchanges Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Return & Exchange Audit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Receipt # & Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Refund / Exchange Value</th>
                <th className="px-4 py-3.5">Reason & Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refundedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No return or refund records logged yet.
                  </td>
                </tr>
              ) : (
                refundedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-slate-900">{order.receiptNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {order.refundedAt ? new Date(order.refundedAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 text-xs">{order.customer?.name || 'Walk-in Guest'}</div>
                      <div className="text-xs text-slate-400">{order.branchName}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        order.orderStatus === 'exchanged' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">${(order.refundAmount || order.grandTotal).toFixed(2)}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-700">{order.refundReason || order.notes || 'Warranty replacement / Return'}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Refund Modal */}
      {isReturnModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Refund: {selectedOrder.receiptNumber}</h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteRefund} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="text-slate-500">Refund Amount:</div>
                <div className="text-xl font-bold text-rose-600 mt-0.5">${selectedOrder.grandTotal.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Condition Disposition</label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value as 'Grade A (Restock)' | 'Defective / Damaged (Quarantine)')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Grade A (Restock)">Grade A - Unopened / Pristine (Restock into Inventory)</option>
                  <option value="Defective / Damaged (Quarantine)">Defective / Damaged (Mark Damaged in Vault)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Payment Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as 'cash' | 'card' | 'store_credit')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="card">Original Payment Method (Card Refund)</option>
                  <option value="cash">Cash Tender</option>
                  <option value="store_credit">Store Credit Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Reason</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Confirm Refund & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Exchange Modal */}
      {isExchangeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Exchange Replacement: {selectedOrder.receiptNumber}</h3>
              <button onClick={() => setIsExchangeModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteExchange} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Returned Defective IMEI</label>
                <input
                  type="text"
                  value={exchangeImei}
                  onChange={e => setExchangeImei(e.target.value)}
                  placeholder="e.g. 359482109845110"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Replacement Product Model</label>
                <select
                  value={exchangeReplacementVariantId}
                  onChange={e => setExchangeReplacementVariantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Select Replacement Item...</option>
                  {products.flatMap(p => p.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {p.brand} {p.name} - {v.color} {v.storage} (Stock: {v.stock})
                    </option>
                  )))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exchange Reason</label>
                <input
                  type="text"
                  required
                  value={exchangeReason}
                  onChange={e => setExchangeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Confirm Exchange & Issue Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
