'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { OrderDetailModal } from './OrderDetailModal';
import { ReceiptModal } from '../pos/ReceiptModal';
import { RefundModal } from './RefundModal';
import { 
  Search, 
  Eye, 
  Printer, 
  RotateCcw, 
  CheckCircle, 
  Download,
  DollarSign,
  TrendingUp,
  Building2,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  X,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    globalSearch, 
    setGlobalSearch, 
    branches 
  } = usePOS();

  // Filter state
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'in_store_pos' | 'delivery' | 'pickup'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [refundOrderTarget, setRefundOrderTarget] = useState<Order | null>(null);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  // Filter logic
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return orders.filter(o => {
      // Branch filter
      if (selectedBranchFilter !== 'all' && o.branchId !== selectedBranchFilter) return false;
      
      // Order status filter
      if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
      
      // Payment status filter
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;

      // Fulfillment filter
      if (fulfillmentFilter !== 'all') {
        const type = o.fulfillmentType || 'in_store_pos';
        if (fulfillmentFilter === 'in_store_pos' && type !== 'in_store_pos') return false;
        if (fulfillmentFilter === 'delivery' && type !== 'delivery') return false;
        if (fulfillmentFilter === 'pickup' && type !== 'pickup') return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(o.createdAt);
        if (dateFilter === 'today' && orderDate < oneDayAgo) return false;
        if (dateFilter === 'week' && orderDate < oneWeekAgo) return false;
        if (dateFilter === 'month' && orderDate < oneMonthAgo) return false;
      }

      // Search query filter
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchId = o.id.toLowerCase().includes(q);
        const matchReceipt = o.receiptNumber.toLowerCase().includes(q);
        const matchCustomer = o.customer?.name.toLowerCase().includes(q) || false;
        const matchPhone = o.customer?.phone.includes(q) || false;
        const matchEmail = o.customer?.email?.toLowerCase().includes(q) || false;
        const matchItem = o.items.some(i => 
          i.productName.toLowerCase().includes(q) || 
          i.sku.toLowerCase().includes(q) ||
          (i.selectedSerial && i.selectedSerial.toLowerCase().includes(q))
        );
        const matchBranch = o.branchName.toLowerCase().includes(q);
        const matchCashier = o.cashierName.toLowerCase().includes(q);
        return matchId || matchReceipt || matchCustomer || matchPhone || matchEmail || matchItem || matchBranch || matchCashier;
      }

      return true;
    });
  }, [orders, selectedBranchFilter, statusFilter, paymentFilter, fulfillmentFilter, dateFilter, globalSearch]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalVolume = filteredOrders.reduce((sum, o) => o.paymentStatus === 'paid' ? sum + o.grandTotal : sum, 0);
    const paidCount = filteredOrders.filter(o => o.paymentStatus === 'paid').length;
    const refundedOrders = filteredOrders.filter(o => o.paymentStatus === 'refunded');
    const refundedCount = refundedOrders.length;
    const refundedVolume = refundedOrders.reduce((sum, o) => sum + (o.refundAmount || o.grandTotal), 0);
    const avgOrderValue = paidCount > 0 ? totalVolume / paidCount : 0;
    const totalItemsFulfilled = filteredOrders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    return { 
      totalVolume, 
      paidCount, 
      refundedCount, 
      refundedVolume,
      avgOrderValue,
      totalItemsFulfilled
    };
  }, [filteredOrders]);

  // Count orders per branch for badges
  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    branches.forEach(b => {
      counts[b.id] = orders.filter(o => o.branchId === b.id).length;
    });
    return counts;
  }, [orders, branches]);

  const handleCopyReceipt = (receiptNum: string) => {
    navigator.clipboard.writeText(receiptNum);
    setCopiedReceiptId(receiptNum);
    toast.success(`Receipt #${receiptNum} copied to clipboard`);
    setTimeout(() => setCopiedReceiptId(null), 2000);
  };

  const handleResetFilters = () => {
    setSelectedBranchFilter('all');
    setStatusFilter('all');
    setPaymentFilter('all');
    setFulfillmentFilter('all');
    setDateFilter('all');
    setGlobalSearch('');
    toast.info('All filters reset — showing all transactions');
  };

  const handleExportCSV = () => {
    const headers = [
      'Order ID', 
      'Receipt #', 
      'Store Branch', 
      'Branch Code',
      'Date & Time', 
      'Customer Name', 
      'Customer Phone', 
      'Items Count', 
      'Line Items Details',
      'Subtotal', 
      'Discount', 
      'Tax', 
      'Grand Total', 
      'Payment Method', 
      'Payment Status', 
      'Order Status',
      'Fulfillment Type',
      'Cashier Name'
    ];

    const rows = filteredOrders.map(o => [
      o.id,
      o.receiptNumber,
      `"${o.branchName}"`,
      `"${branches.find(b => b.id === o.branchId)?.code || ''}"`,
      `"${formatDate(o.createdAt, true)}"`,
      `"${o.customer ? o.customer.name : 'Walk-in Guest'}"`,
      `"${o.customer?.phone || 'N/A'}"`,
      o.items.length,
      `"${o.items.map(i => `${i.quantity}x ${i.productName} (${i.variantSummary || ''})`).join('; ')}"`,
      o.subtotal.toFixed(2),
      o.discountTotal.toFixed(2),
      o.taxTotal.toFixed(2),
      o.grandTotal.toFixed(2),
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      o.fulfillmentType || 'in_store_pos',
      `"${o.cashierName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexustech_sales_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredOrders.length} order records to CSV`);
  };

  const hasActiveFilters = selectedBranchFilter !== 'all' || 
    statusFilter !== 'all' || 
    paymentFilter !== 'all' || 
    fulfillmentFilter !== 'all' || 
    dateFilter !== 'all' || 
    globalSearch.trim() !== '';

  return (
    <div ref={containerRef} className="space-y-5 pb-12 w-full max-w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Orders & Sales Transactions
            </h1>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/70 shadow-2xs">
              {filteredOrders.length} of {orders.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Audit register receipts, examine itemized details, reprint customer invoices, and process refunds.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View mode toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-indigo-50/60 text-slate-800 hover:text-indigo-600 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Gross Revenue</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono truncate">
              {formatCurrency(stats.totalVolume)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block truncate">
              {selectedBranchFilter === 'all' ? 'All 4 locations' : `${branches.find(b => b.id === selectedBranchFilter)?.code} store volume`}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60 shadow-2xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Paid Orders Count */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Paid Orders</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight font-mono truncate">
              {stats.paidCount} <span className="text-xs font-bold text-slate-500">Orders</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 block truncate flex items-center gap-1">
              <CheckCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">{stats.totalItemsFulfilled} units fulfilled</span>
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60 shadow-2xs">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between group hover:border-blue-200 transition-all">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Average Ticket</span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight font-mono truncate">
              {formatCurrency(stats.avgOrderValue)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block truncate">
              Per settled register ticket
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Processed Refunds */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between group hover:border-rose-200 transition-all">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">Refunds Issued</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight font-mono truncate">
              {stats.refundedCount} <span className="text-xs font-bold text-slate-500">Refunds</span>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 block truncate">
              {stats.refundedVolume > 0 ? `${formatCurrency(stats.refundedVolume)} total refunded` : '0 return volume'}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/60 shadow-2xs">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Outlet Selection Pills */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1.5 shrink-0 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Outlet:</span>
        </span>

        <button
          onClick={() => setSelectedBranchFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedBranchFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
          }`}
        >
          <span>🏢 All</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            selectedBranchFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {branchCounts.all}
          </span>
        </button>

        {branches.map(b => {
          const isSelected = selectedBranchFilter === b.id;
          const count = branchCounts[b.id] || 0;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBranchFilter(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <span>{b.code}</span>
              <span className="hidden md:inline">• {b.name.split(' ')[0]}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table & Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/60 space-y-3">
          <div className="flex flex-col md:flex-row gap-2.5">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search receipt #, order ID, customer, phone, IMEI, SKU..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium transition-all shadow-2xs"
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
              {/* Payment Status Dropdown */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer shadow-2xs truncate"
              >
                <option value="all">💳 Payment (All)</option>
                <option value="paid">✅ Paid</option>
                <option value="refunded">🔄 Refunded</option>
                <option value="pending">⏳ Pending</option>
              </select>

              {/* Order Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer shadow-2xs truncate"
              >
                <option value="all">📦 Order (All)</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Fulfillment Filter */}
              <select
                value={fulfillmentFilter}
                onChange={(e) => setFulfillmentFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer shadow-2xs truncate"
              >
                <option value="all">🚚 Channel (All)</option>
                <option value="in_store_pos">🏬 In-Store</option>
                <option value="delivery">📦 Delivery</option>
                <option value="pickup">🛍️ Pickup</option>
              </select>

              {/* Date Range Dropdown */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer shadow-2xs truncate"
              >
                <option value="all">📅 Date (All)</option>
                <option value="today">Today</option>
                <option value="week">Past 7d</option>
                <option value="month">Past 30d</option>
              </select>
            </div>
          </div>

          {/* Quick Active Filter Chips if any */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] font-bold text-slate-400">Active:</span>
              
              {selectedBranchFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span>Branch: {branches.find(b => b.id === selectedBranchFilter)?.code}</span>
                  <button onClick={() => setSelectedBranchFilter('all')} className="hover:text-blue-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              {paymentFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>Payment: {paymentFilter}</span>
                  <button onClick={() => setPaymentFilter('all')} className="hover:text-emerald-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="hover:text-purple-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              {fulfillmentFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span>Fulfillment: {fulfillmentFilter.replace('_', ' ')}</span>
                  <button onClick={() => setFulfillmentFilter('all')} className="hover:text-amber-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              {dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Timeframe: {dateFilter}</span>
                  <button onClick={() => setDateFilter('all')} className="hover:text-slate-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              {globalSearch.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span>&quot;{globalSearch}&quot;</span>
                  <button onClick={() => setGlobalSearch('')} className="hover:text-indigo-900 cursor-pointer ml-0.5 font-bold">×</button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* View Mode: Cards (Mobile & Compact View) */}
        {viewMode === 'cards' && (
          <div className="p-4">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center max-w-sm mx-auto space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
                <p className="text-xs text-slate-500">Try adjusting your filters or keyword query.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredOrders.map(ord => {
                  const branchObj = branches.find(b => b.id === ord.branchId);
                  const isCopied = copiedReceiptId === ord.receiptNumber;

                  return (
                    <div key={ord.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-3 hover:bg-white hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 font-mono text-xs">{ord.receiptNumber}</span>
                          <button
                            onClick={() => handleCopyReceipt(ord.receiptNumber)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                          ord.paymentStatus === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : ord.paymentStatus === 'refunded'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ord.paymentStatus === 'paid' ? 'bg-emerald-500' :
                            ord.paymentStatus === 'refunded' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {ord.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-y border-slate-200/60 py-2">
                        <div>
                          <span className="text-slate-900 font-bold block">{ord.customer ? ord.customer.name : 'Walk-in Guest'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(ord.createdAt, false)} • {branchObj?.code}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900 font-mono text-sm block">{formatCurrency(ord.grandTotal)}</span>
                          <span className="text-[10px] text-slate-400">{ord.items.length} items • {ord.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Purchased thumbnails preview */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {ord.items.slice(0, 3).map((it, idx) => (
                            <img key={idx} src={it.image} alt={it.productName} className="w-7 h-7 rounded-lg object-cover border border-white shadow-2xs" />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-600 truncate flex-1 font-medium">
                          {ord.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReceiptOrder(ord)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {ord.paymentStatus === 'paid' && (
                          <button
                            onClick={() => setRefundOrderTarget(ord)}
                            className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl cursor-pointer"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View Mode: Responsive Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50/90 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase text-[10px] tracking-wider whitespace-nowrap">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Receipt / Channel</th>
                  <th className="py-3 px-3 sm:px-4">Outlet</th>
                  <th className="py-3 px-3 sm:px-4">Date & Time</th>
                  <th className="py-3 px-3 sm:px-4">Customer & Staff</th>
                  <th className="py-3 px-3 sm:px-4">Purchased Items</th>
                  <th className="py-3 px-3 sm:px-4">Payment Info</th>
                  <th className="py-3 px-3 sm:px-4">Grand Total</th>
                  <th className="py-3 px-3 sm:px-4">Status</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                          <ShoppingBag className="w-7 h-7" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">No Orders Found Matching Criteria</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          We couldn&apos;t find any transactions matching your active filters.
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Reset All Filters & View All Orders
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const branchObj = branches.find(b => b.id === ord.branchId);
                    const isCopied = copiedReceiptId === ord.receiptNumber;

                    return (
                      <tr key={ord.id} className="hover:bg-indigo-50/30 transition-colors group">
                        {/* Receipt & Channel */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 font-mono text-xs">{ord.receiptNumber}</span>
                            <button
                              onClick={() => handleCopyReceipt(ord.receiptNumber)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-0.5"
                              title="Copy Receipt #"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">#{ord.id.split('-').pop()}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] font-semibold text-indigo-600 capitalize">
                              {(ord.fulfillmentType || 'in_store_pos').replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Store Outlet */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-bold">
                            <Building2 className="w-3 h-3" />
                            <span>{branchObj?.code || 'HQ-01'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[110px]" title={ord.branchName}>
                            {ord.branchName.split(' ')[0]}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="text-slate-700 font-semibold block text-xs">
                            {formatDate(ord.createdAt, false)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Customer & Staff */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                              {ord.customer ? ord.customer.name : 'Walk-in Guest'}
                            </span>
                            {ord.customer?.tier && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {ord.customer.tier}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Staff: <span className="text-slate-600">{ord.cashierName.split(' ')[0]}</span>
                          </div>
                        </td>

                        {/* Purchased Items with thumbnails */}
                        <td className="py-3 px-3 sm:px-4 min-w-[200px] max-w-[260px]">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {ord.items.slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx} 
                                className="w-6 h-6 rounded-md overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 relative"
                                title={`${item.quantity}x ${item.productName}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                {item.quantity > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-slate-900/90 text-white text-[7px] font-black px-0.5 rounded-tl leading-none">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                            ))}
                            {ord.items.length > 3 && (
                              <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/80 text-[9px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                                +{ord.items.length - 3}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-700 font-semibold block truncate text-[11px]" title={ord.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}>
                            {ord.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="capitalize font-bold text-slate-800 block text-xs flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ord.paymentMethod.replace('_', ' ')}</span>
                          </span>
                          {ord.paymentDetails?.cardLast4 && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              •••• {ord.paymentDetails.cardLast4} ({ord.paymentDetails.cardType || 'Card'})
                            </span>
                          )}
                          {ord.paymentDetails?.provider && !ord.paymentDetails.cardLast4 && (
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {ord.paymentDetails.provider}
                            </span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="font-black text-slate-900 tracking-tight text-sm font-mono block">
                            {formatCurrency(ord.grandTotal)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {ord.items.reduce((sum, i) => sum + i.quantity, 0)} units total
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-2xs ${
                            ord.paymentStatus === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/90' 
                              : ord.paymentStatus === 'refunded'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/90'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/90'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              ord.paymentStatus === 'paid' ? 'bg-emerald-500' :
                              ord.paymentStatus === 'refunded' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            <span>{ord.paymentStatus}</span>
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                              title="View Itemized Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setReceiptOrder(ord)}
                              className="p-1 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {ord.paymentStatus === 'paid' && (
                              <button
                                onClick={() => setRefundOrderTarget(ord)}
                                className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Process Refund"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
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
        )}
      </div>

      {/* Itemized Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Direct Receipt Print Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* Direct Refund Modal */}
      {refundOrderTarget && (
        <RefundModal
          order={refundOrderTarget}
          onClose={() => setRefundOrderTarget(null)}
          onRefundComplete={() => {
            setRefundOrderTarget(null);
            toast.success(`Refund completed for order #${refundOrderTarget.receiptNumber}`);
          }}
        />
      )}
    </div>
  );
};
