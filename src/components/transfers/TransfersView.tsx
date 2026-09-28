'use client';

import React, { useState, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { StockTransfer, TransferItem } from '@/types';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Building2, 
  XCircle, 
  AlertCircle,
  FileText,
  Package,
  QrCode,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export const TransfersView: React.FC = () => {
  const { 
    stockTransfers, 
    branches, 
    products, 
    devices, 
    activeBranchId, 
    requestStockTransfer, 
    approveStockTransfer, 
    receiveStockTransfer,
    permissions 
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Form State
  const [fromBranchId, setFromBranchId] = useState(branches[3]?.id || branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState(activeBranchId);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferItems, setTransferItems] = useState<{ productId: string; variantId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', variantId: products[0]?.variants[0]?.id || '', quantity: 5 }
  ]);

  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(tr => {
      const matchSearch = 
        tr.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.fromBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.toBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tr.trackingNumber && tr.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = selectedStatus === 'all' || tr.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [stockTransfers, searchQuery, selectedStatus]);

  const pendingApprovals = stockTransfers.filter(t => t.status === 'PENDING_APPROVAL').length;
  const inTransitCount = stockTransfers.filter(t => t.status === 'IN_TRANSIT').length;
  const completedCount = stockTransfers.filter(t => t.status === 'RECEIVED').length;

  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      toast.error('Source branch and destination branch cannot be the same');
      return;
    }

    const itemsFormatted: TransferItem[] = transferItems.map(ti => {
      const prod = products.find(p => p.id === ti.productId);
      const variant = prod?.variants.find(v => v.id === ti.variantId);
      return {
        productId: ti.productId,
        variantId: ti.variantId,
        productName: prod?.name || 'Item',
        variantSummary: `${variant?.color || ''} ${variant?.storage || ''}`.trim(),
        quantity: ti.quantity
      };
    });

    requestStockTransfer(fromBranchId, toBranchId, itemsFormatted, transferNotes);
    setIsRequestModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Multi-Branch Stock Transfers</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Inter-store stock replenishment, warehouse dispatch, manager approvals, and receiving checklists.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Request Stock Transfer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Stores & WH</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{branches.length} <span className="text-xs font-normal text-slate-500">locations</span></div>
          <div className="text-xs text-slate-500 mt-1">Connected network</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Pending Approvals</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{pendingApprovals} <span className="text-xs font-normal text-slate-500">requests</span></div>
          <div className="text-xs text-slate-500 mt-1">Requires manager review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">In-Transit Freight</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{inTransitCount} <span className="text-xs font-normal text-slate-500">transfers</span></div>
          <div className="text-xs text-slate-500 mt-1">En route to destination</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Completed Transfers</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{completedCount} <span className="text-xs font-normal text-slate-500">fulfilled</span></div>
          <div className="text-xs text-slate-500 mt-1">Successfully received</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transfer #, source, destination, tracking #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
        >
          <option value="all">All Transfer Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="RECEIVED">Received & Stocked</option>
        </select>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Transfer # & Date</th>
                <th className="px-4 py-3.5">From Branch (Source)</th>
                <th className="px-4 py-3.5">To Branch (Destination)</th>
                <th className="px-4 py-3.5">Items Transferred</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No stock transfer requests found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => {
                  const totalUnits = transfer.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-slate-900">{transfer.transferNumber}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(transfer.requestDate).toLocaleDateString()} • By: {transfer.requestedBy}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {transfer.fromBranchName}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-600" />
                          {transfer.toBranchName}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{totalUnits} units</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {transfer.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          transfer.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : transfer.status === 'IN_TRANSIT'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : transfer.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {transfer.status.replace('_', ' ')}
                        </span>
                        {transfer.trackingNumber && (
                          <div className="text-[11px] font-mono text-slate-400 mt-1">
                            {transfer.trackingNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {transfer.status === 'PENDING_APPROVAL' && permissions.canApproveTransfers && (
                            <button
                              onClick={() => approveStockTransfer(transfer.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Approve & Dispatch
                            </button>
                          )}

                          {transfer.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => receiveStockTransfer(transfer.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm Receipt & Stock
                            </button>
                          )}

                          {transfer.status === 'RECEIVED' && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Received by {transfer.receivedBy}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Stock Transfer Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Request Inter-Branch Stock Transfer</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source Branch (From) *</label>
                  <select
                    value={fromBranchId}
                    onChange={e => setFromBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Branch (To) *</label>
                  <select
                    value={toBranchId}
                    onChange={e => setToBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Reason / Notes</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="e.g. Replenish flagship inventory before high-traffic launch"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Item to Transfer</h4>
                {transferItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <select
                      value={item.productId}
                      onChange={e => {
                        const prod = products.find(p => p.id === e.target.value);
                        const updated = [...transferItems];
                        updated[idx].productId = e.target.value;
                        updated[idx].variantId = prod?.variants[0]?.id || '';
                        setTransferItems(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-500">Transfer Units</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const updated = [...transferItems];
                            updated[idx].quantity = parseInt(e.target.value) || 1;
                            setTransferItems(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Submit Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
