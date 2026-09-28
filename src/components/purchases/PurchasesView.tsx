'use client';

import React, { useState, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { Supplier, PurchaseOrder, PurchaseOrderItem } from '@/types';
import { 
  Truck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Package, 
  QrCode, 
  ArrowDownRight, 
  XCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export const PurchasesView: React.FC = () => {
  const { 
    suppliers, 
    purchaseOrders, 
    branches, 
    products, 
    activeBranchId, 
    createPurchaseOrder, 
    receivePurchaseOrderItems, 
    recordSupplierPayment,
    permissions 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modals state
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [isSupplierPayModalOpen, setIsSupplierPayModalOpen] = useState(false);
  
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // New PO Form State
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poBranchId, setPoBranchId] = useState(activeBranchId);
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; variantId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '', variantId: products[0]?.variants[0]?.id || '', quantity: 10, unitCost: products[0]?.variants[0]?.costPrice || 800 }
  ]);

  // Receiving Form State (maps PO Item ID to quantity and comma-separated IMEIs)
  const [receivingInputs, setReceivingInputs] = useState<Record<string, { qty: number; imeis: string }>>({});
  const [payAmount, setPayAmount] = useState('');

  // Computed Supplier AP Debts & Total Purchases
  const totalAPDebt = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.balanceDebt, 0);
  }, [suppliers]);

  const totalPurchasesVolume = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);
  }, [purchaseOrders]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchSearch = 
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.branchName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = selectedStatus === 'all' || po.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, selectedStatus]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const handleOpenReceiving = (po: PurchaseOrder) => {
    setSelectedPO(po);
    const initialInputs: Record<string, { qty: number; imeis: string }> = {};
    po.items.forEach(item => {
      const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
      initialInputs[item.id] = { qty: remaining, imeis: '' };
    });
    setReceivingInputs(initialInputs);
    setIsReceivingModalOpen(true);
  };

  const handleExecuteReceiving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const payload = Object.entries(receivingInputs).map(([poItemId, input]) => {
      const imeiList = input.imeis
        .split('\n')
        .flatMap(line => line.split(','))
        .map(s => s.trim())
        .filter(Boolean);

      return {
        poItemId,
        quantityReceived: Number(input.qty),
        imeis: imeiList.length > 0 ? imeiList : undefined
      };
    }).filter(i => i.quantityReceived > 0);

    if (payload.length === 0) {
      toast.warning('Please enter received quantities greater than 0');
      return;
    }

    receivePurchaseOrderItems(selectedPO.id, payload);
    setIsReceivingModalOpen(false);
  };

  const handleOpenSupplierPay = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPayAmount(supplier.balanceDebt.toString());
    setIsSupplierPayModalOpen(true);
  };

  const handleExecuteSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }

    recordSupplierPayment(selectedSupplier.id, amountNum);
    setIsSupplierPayModalOpen(false);
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === poSupplierId);
    const br = branches.find(b => b.id === poBranchId);

    if (!sup || !br) {
      toast.error('Select valid supplier and branch');
      return;
    }

    const itemsFormatted: PurchaseOrderItem[] = poItems.map((item, idx) => {
      const prod = products.find(p => p.id === item.productId);
      const variant = prod?.variants.find(v => v.id === item.variantId);
      return {
        id: `poi-new-${Date.now()}-${idx}`,
        productId: item.productId,
        variantId: item.variantId,
        productName: prod?.name || 'Device',
        variantSummary: `${variant?.color || ''} ${variant?.storage || ''}`.trim(),
        quantityOrdered: item.quantity,
        quantityReceived: 0,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      };
    });

    const totalCost = itemsFormatted.reduce((sum, i) => sum + i.totalCost, 0);

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      branchId: br.id,
      branchName: br.name,
      items: itemsFormatted,
      status: 'ORDERED',
      totalCost,
      paymentStatus: 'UNPAID',
      paidAmount: 0,
      expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: poNotes
    });

    setIsNewPOModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Purchasing & Supplier Management</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Purchase orders, goods receipt with IMEI scan registration, and accounts payable debt ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewPOModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Accounts Payable Debt</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            ${totalAPDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Outstanding supplier balances</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total PO Volume</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ${totalPurchasesVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Lifetime purchase volume</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Suppliers</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{suppliers.length} <span className="text-xs font-normal text-slate-500">vendors</span></div>
          <div className="text-xs text-slate-500 mt-1">Verified mobile distributors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Awaiting Delivery</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {purchaseOrders.filter(p => p.status === 'ORDERED' || p.status === 'PARTIALLY_RECEIVED').length} <span className="text-xs font-normal text-slate-500">POs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">In shipment / dock bay</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'suppliers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Supplier Directory ({suppliers.length})
            </button>
          </div>

          {/* Search bar & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search POs or suppliers..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {activeTab === 'orders' && (
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Fully Received</option>
                <option value="DRAFT">Draft</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">PO Number & Date</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5">Receiving Branch</th>
                  <th className="px-4 py-3.5">Items & Quantity</th>
                  <th className="px-4 py-3.5">Total Cost</th>
                  <th className="px-4 py-3.5">PO Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No purchase orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map(po => {
                    const totalQtyOrdered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
                    const totalQtyReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);

                    return (
                      <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold font-mono text-slate-900">{po.poNumber}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(po.orderedDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{po.supplierName}</div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">By: {po.createdBy}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {po.branchName}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">
                            {totalQtyReceived} / {totalQtyOrdered} units received
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {po.items.map(i => `${i.quantityOrdered}x ${i.productName}`).join(', ')}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">${po.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                          <div className={`text-[11px] font-semibold ${po.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            Payment: {po.paymentStatus}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            po.status === 'RECEIVED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : po.status === 'PARTIALLY_RECEIVED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {po.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {po.status !== 'RECEIVED' ? (
                            <button
                              onClick={() => handleOpenReceiving(po)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Receive & Scan IMEIs
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Fully Stocked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Supplier Directory */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {supplier.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{supplier.name}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    ★ {supplier.rating.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: <strong className="text-slate-800">{supplier.contactPerson}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terms: <strong className="text-slate-800">{supplier.paymentTerms}</strong></span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">AP Balance Debt:</span>
                    <div className={`font-bold text-sm ${supplier.balanceDebt > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      ${supplier.balanceDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Total Purchased:</span>
                    <div className="font-bold text-sm text-slate-800">
                      ${supplier.totalPurchased.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{supplier.activeOrdersCount} Active POs</span>
                <button
                  onClick={() => handleOpenSupplierPay(supplier)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Pay Balance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goods Receiving & IMEI Registration Modal */}
      {isReceivingModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Goods Receiving: PO #{selectedPO.poNumber}</h3>
                <p className="text-xs text-slate-500">Supplier: {selectedPO.supplierName} • Destination: {selectedPO.branchName}</p>
              </div>
              <button onClick={() => setIsReceivingModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReceiving} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Enter received quantities. For phones and serialized electronics, paste or scan IMEIs (one per line or comma-separated). Discrete <strong>DeviceItem</strong> records will be generated automatically into the inventory vault.
                </div>
              </div>

              <div className="space-y-4">
                {selectedPO.items.map(item => {
                  const input = receivingInputs[item.id] || { qty: 0, imeis: '' };
                  const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);

                  return (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{item.productName}</h4>
                          <span className="text-xs text-slate-500">{item.variantSummary} • Ordered: {item.quantityOrdered} • Already Recv: {item.quantityReceived}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-700">${item.unitCost.toFixed(2)}/unit</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Receiving Qty (Max {remaining})</label>
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            value={input.qty}
                            onChange={e => {
                              const val = Math.max(0, Math.min(remaining, parseInt(e.target.value) || 0));
                              setReceivingInputs(prev => ({
                                ...prev,
                                [item.id]: { ...input, qty: val }
                              }));
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Scan/Input IMEIs ({input.qty} required)</label>
                          <textarea
                            rows={2}
                            value={input.imeis}
                            onChange={e => setReceivingInputs(prev => ({
                              ...prev,
                              [item.id]: { ...input, imeis: e.target.value }
                            }))}
                            placeholder="Paste scanned IMEIs: 359482109845120, 359482109845121..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Confirm Goods Receipt & Register IMEIs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {isSupplierPayModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Record Payment to {selectedSupplier.name}</h3>
              <button onClick={() => setIsSupplierPayModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSupplierPayment} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="text-slate-500">Current Outstanding AP Debt:</div>
                <div className="text-lg font-bold text-rose-600 mt-0.5">${selectedSupplier.balanceDebt.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierPayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New PO Modal */}
      {isNewPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Create New Purchase Order</h3>
              <button onClick={() => setIsNewPOModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Supplier *</label>
                  <select
                    value={poSupplierId}
                    onChange={e => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.paymentTerms})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Receiving Branch *</label>
                  <select
                    value={poBranchId}
                    onChange={e => setPoBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order Notes / Instructions</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
                  placeholder="e.g. Q4 Flagship stock reorder, priority shipment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Order Line Items</h4>
                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
                      <div className="col-span-3">
                        <select
                          value={item.productId}
                          onChange={e => {
                            const pId = e.target.value;
                            const prod = products.find(p => p.id === pId);
                            const updated = [...poItems];
                            updated[idx].productId = pId;
                            updated[idx].variantId = prod?.variants[0]?.id || '';
                            updated[idx].unitCost = prod?.variants[0]?.costPrice || 500;
                            setPoItems(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const updated = [...poItems];
                            updated[idx].quantity = parseInt(e.target.value) || 1;
                            setPoItems(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500">Unit Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={e => {
                            const updated = [...poItems];
                            updated[idx].unitCost = parseFloat(e.target.value) || 0;
                            setPoItems(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500">Total Line</label>
                        <div className="font-bold text-xs text-indigo-700 py-1">
                          ${(item.quantity * item.unitCost).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPOModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
