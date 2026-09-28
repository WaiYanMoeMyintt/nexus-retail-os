'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  PieChart as PieChartIcon, 
  ShoppingBag, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Building2,
  Users,
  Smartphone,
  Tag,
  CheckCircle2,
  Percent,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { toast } from 'sonner';
import gsap from 'gsap';

export const ReportsView: React.FC = () => {
  const { 
    orders, 
    products, 
    devices, 
    branches, 
    employees, 
    activeBranchId, 
    settings 
  } = usePOS();

  const [reportPeriod, setReportPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<'financial' | 'brands' | 'salespeople' | 'branches' | 'inventory'>('financial');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const animElements = containerRef.current.querySelectorAll('.report-anim');
      if (animElements && animElements.length > 0) {
        gsap.fromTo(
          animElements,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }
  }, [reportPeriod, selectedBranchFilter, selectedReportType]);

  const completedOrders = useMemo(() => {
    return orders.filter(o => {
      const isPaid = o.paymentStatus === 'paid' || o.orderStatus === 'completed';
      const matchesBranch = selectedBranchFilter === 'all' || o.branchId === selectedBranchFilter;
      return isPaid && matchesBranch;
    });
  }, [orders, selectedBranchFilter]);

  // Overall Financials
  const financials = useMemo(() => {
    const grossSales = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalTax = completedOrders.reduce((sum, o) => sum + (o.taxTotal || 0), 0);
    const totalShipping = completedOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
    const totalDiscounts = completedOrders.reduce((sum, o) => sum + (o.discountTotal || 0), 0);
    const netSales = Math.max(0, grossSales - totalTax - totalShipping);
    const cogs = completedOrders.reduce((sum, o) => sum + (o.costTotal || 0), 0);
    const grossProfit = netSales - cogs;
    const profitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    return {
      grossSales,
      netSales,
      totalTax,
      totalShipping,
      cogs,
      grossProfit,
      profitMargin: profitMargin.toFixed(1),
      totalDiscounts,
      orderCount: completedOrders.length,
      avgTicket: completedOrders.length > 0 ? grossSales / completedOrders.length : 0
    };
  }, [completedOrders]);

  // Brand Performance Data
  const brandBreakdown = useMemo(() => {
    const map: Record<string, { units: number; revenue: number; cost: number; profit: number }> = {};
    completedOrders.forEach(o => {
      o.items.forEach(i => {
        if (!map[i.brand]) map[i.brand] = { units: 0, revenue: 0, cost: 0, profit: 0 };
        const rev = i.unitPrice * i.quantity;
        const c = i.costPrice * i.quantity;
        map[i.brand].units += i.quantity;
        map[i.brand].revenue += rev;
        map[i.brand].cost += c;
        map[i.brand].profit += (rev - c);
      });
    });

    return Object.entries(map).map(([brand, data]) => ({
      brand,
      units: data.units,
      revenue: data.revenue,
      profit: data.profit,
      margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0'
    })).sort((a, b) => b.revenue - a.revenue);
  }, [completedOrders]);

  // Salesperson Performance Data
  const salespersonBreakdown = useMemo(() => {
    return employees.map(emp => {
      const staffOrders = completedOrders.filter(o => o.salespersonId === emp.id || o.cashierName.includes(emp.name));
      const sales = staffOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const ordersCount = staffOrders.length;
      const commission = (sales * emp.commissionRate) / 100;
      const targetAttainment = emp.salesTarget > 0 ? (sales / emp.salesTarget) * 100 : 100;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        branch: emp.branchName,
        ordersCount,
        sales,
        commission,
        target: emp.salesTarget,
        targetAttainment: targetAttainment.toFixed(1)
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [employees, completedOrders]);

  // Multi-Branch Performance
  const branchBreakdown = useMemo(() => {
    return branches.map(b => {
      const bOrders = orders.filter(o => o.branchId === b.id && (o.orderStatus === 'completed' || o.paymentStatus === 'paid'));
      const rev = bOrders.reduce((s, o) => s + o.grandTotal, 0);
      const prof = bOrders.reduce((s, o) => s + o.profitTotal, 0);
      const inStockImeis = devices.filter(d => d.branchId === b.id && d.status === 'IN_STOCK').length;

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        ordersCount: bOrders.length,
        revenue: rev,
        profit: prof,
        margin: rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0',
        inStockImeis
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [branches, orders, devices]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Nexus Retail OS - Official Executive Report'],
      ['Generated Date', new Date().toISOString()],
      ['Branch Filter', selectedBranchFilter],
      [''],
      ['Metric', 'Amount ($)'],
      ['Gross Revenue', financials.grossSales.toFixed(2)],
      ['Discounts Granted', financials.totalDiscounts.toFixed(2)],
      ['Sales Tax Collected', financials.totalTax.toFixed(2)],
      ['Net Sales', financials.netSales.toFixed(2)],
      ['COGS (Product Cost)', financials.cogs.toFixed(2)],
      ['Gross Profit', financials.grossProfit.toFixed(2)],
      ['Gross Margin (%)', `${financials.profitMargin}%`],
      ['Total Orders', financials.orderCount],
      ['Average Order Value (AOV)', financials.avgTicket.toFixed(2)]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_pos_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial report exported to CSV successfully!');
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Executive Reports & Profitability Analytics</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time calculations for Net Sales, COGS, Gross Profit, Brand Margins, and Staff Quotas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Report Sub-tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'financial', label: 'Financial Statement' },
            { id: 'brands', label: 'Brand Profitability' },
            { id: 'salespeople', label: 'Sales Commission' },
            { id: 'branches', label: 'Multi-Branch' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReportType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedReportType === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Branch Context & Period Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Store Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={reportPeriod}
            onChange={e => setReportPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Financial Statement Report */}
      {selectedReportType === 'financial' && (
        <div className="space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="report-anim bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-400">Net Sales</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{formatCurrency(financials.netSales)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Excl. tax (${financials.totalTax.toFixed(2)})</div>
            </div>

            <div className="report-anim bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-400">Product COGS</span>
              <div className="text-2xl font-bold text-slate-700 mt-1 font-mono">{formatCurrency(financials.cogs)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total unit purchase cost</div>
            </div>

            <div className="report-anim bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <span className="text-xs font-bold uppercase text-emerald-800">Gross Profit</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{formatCurrency(financials.grossProfit)}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Net Sales - COGS</div>
            </div>

            <div className="report-anim bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-400">Gross Margin %</span>
              <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">{financials.profitMargin}%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Average across all categories</div>
            </div>
          </div>

          {/* Income Statement Table */}
          <div className="report-anim bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="font-bold text-base text-slate-900 mb-4">Official Retail Profit & Loss Breakdown</h3>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between font-semibold">
                <span>Gross Merchandise Value (GMV / Revenue)</span>
                <span className="font-mono text-slate-900">{formatCurrency(financials.grossSales)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-rose-600 font-semibold">
                <span>Less: Total Promotions & Line Discounts</span>
                <span className="font-mono">-{formatCurrency(financials.totalDiscounts)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-600 font-semibold">
                <span>Less: State & Local Sales Tax Collected</span>
                <span className="font-mono">-{formatCurrency(financials.totalTax)}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-3 rounded-lg">
                <span>Equals: Net Sales</span>
                <span className="font-mono text-blue-600">{formatCurrency(financials.netSales)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-700 font-semibold">
                <span>Less: Cost of Goods Sold (Purchase Basis)</span>
                <span className="font-mono text-rose-600">-{formatCurrency(financials.cogs)}</span>
              </div>
              <div className="py-3 flex justify-between text-base font-black text-slate-900 bg-emerald-50 px-3 rounded-xl border border-emerald-200 mt-2">
                <span>Equals: Gross Profit (Net Margin {financials.profitMargin}%)</span>
                <span className="font-mono text-emerald-700">{formatCurrency(financials.grossProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Profitability Report */}
      {selectedReportType === 'brands' && (
        <div className="report-anim bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Brand Profit Contribution & Velocity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Brand Name</th>
                  <th className="px-4 py-3.5">Units Sold</th>
                  <th className="px-4 py-3.5">Gross Revenue</th>
                  <th className="px-4 py-3.5">Gross Profit</th>
                  <th className="px-4 py-3.5">Profit Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brandBreakdown.map(b => (
                  <tr key={b.brand} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{b.brand}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{b.units} units</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{formatCurrency(b.revenue)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">{formatCurrency(b.profit)}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-600">{b.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salesperson Commission Report */}
      {selectedReportType === 'salespeople' && (
        <div className="report-anim bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Staff Sales Quotas & Commission Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Role / Store</th>
                  <th className="px-4 py-3.5">Transactions Settled</th>
                  <th className="px-4 py-3.5">Total Sales Revenue</th>
                  <th className="px-4 py-3.5">Commission Earned</th>
                  <th className="px-4 py-3.5">Target Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salespersonBreakdown.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{emp.name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{emp.role} • {emp.branch.split(' ')[0]}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{emp.ordersCount} orders</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{formatCurrency(emp.sales)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-teal-600">{formatCurrency(emp.commission)}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">{emp.targetAttainment}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-Branch Performance */}
      {selectedReportType === 'branches' && (
        <div className="report-anim bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Store Network Performance Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Branch Location</th>
                  <th className="px-4 py-3.5">Branch Code</th>
                  <th className="px-4 py-3.5">Orders Processed</th>
                  <th className="px-4 py-3.5">Revenue</th>
                  <th className="px-4 py-3.5">Profit</th>
                  <th className="px-4 py-3.5">In-Stock IMEIs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchBreakdown.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{b.name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{b.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{b.ordersCount}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{formatCurrency(b.revenue)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">{formatCurrency(b.profit)}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{b.inStockImeis} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
