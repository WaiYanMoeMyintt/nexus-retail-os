'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Layers,
  History,
  Smartphone,
  ShieldAlert,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const InventoryView: React.FC = () => {
  const { 
    products, 
    stockMovements, 
    adjustStock, 
    globalSearch, 
    setGlobalSearch,
    activeBranchId,
    activeBranch,
    branches,
    setActiveBranchId
  } = usePOS();

  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranchId || 'all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'low_stock'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProdForAdjust, setSelectedProdForAdjust] = useState<string | undefined>(undefined);
  const [selectedVarForAdjust, setSelectedVarForAdjust] = useState<string | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  // Sync with active branch context from Navbar
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId);
    }
  }, [activeBranchId]);

  // Compute Inventory Valuation for selected branch context
  const valuation = useMemo(() => {
    let totalUnits = 0;
    let totalCostBasis = 0;
    let totalRetailValue = 0;

    products.forEach(p => {
      p.variants.forEach(v => {
        const units = selectedBranchFilter === 'all' 
          ? v.stock 
          : (v.branchStocks?.[selectedBranchFilter] ?? (selectedBranchFilter === 'branch-1' ? v.stock : 0));
        totalUnits += units;
        totalCostBasis += v.costPrice * units;
        totalRetailValue += v.price * units;
      });
    });

    const potentialGrossMargin = totalRetailValue - totalCostBasis;
    const marginPercent = totalRetailValue > 0 ? ((potentialGrossMargin / totalRetailValue) * 100).toFixed(1) : '0';

    return {
      totalUnits,
      totalCostBasis,
      totalRetailValue,
      potentialGrossMargin,
      marginPercent
    };
  }, [products, selectedBranchFilter]);

  // Flattened variant inventory rows
  const variantRows = useMemo(() => {
    const rows: { product: any; variant: any; localStock: number }[] = [];

    products.forEach(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return;

      p.variants.forEach(v => {
        const localStock = selectedBranchFilter === 'all' 
          ? v.stock 
          : (v.branchStocks?.[selectedBranchFilter] ?? (selectedBranchFilter === 'branch-1' ? v.stock : 0));

        if (activeTab === 'low_stock' && localStock > v.lowStockThreshold) return;

        if (globalSearch.trim()) {
          const q = globalSearch.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchSku = v.sku.toLowerCase().includes(q);
          const matchBarcode = v.barcode.includes(q);
          const matchColor = v.color.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku && !matchBarcode && !matchColor) return;
        }

        rows.push({ product: p, variant: v, localStock });
      });
    });

    return rows;
  }, [products, selectedCategory, selectedBranchFilter, activeTab, globalSearch]);

  const handleOpenAdjustment = (productId?: string, variantId?: string) => {
    setSelectedProdForAdjust(productId);
    setSelectedVarForAdjust(variantId);
    setIsAdjustModalOpen(true);
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">POS Sale</span>;
      case 'restock':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Restock (+)</span>;
      case 'refund_return':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Refund Return</span>;
      case 'damaged_writeoff':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Damaged / Scrap</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Audit Count</span>;
    }
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Inventory Valuation & Stock Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time multi-variant tracking, low-stock reorder thresholds, and ledger movements.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdjustment()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Valuation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Units in Stock</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {valuation.totalUnits} <span className="text-xs font-bold text-slate-400">units</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{products.length} catalog models tracked</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inventory Cost Basis</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(valuation.totalCostBasis)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Wholesale investment</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Retail Market Value</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {formatCurrency(valuation.totalRetailValue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Expected sales potential</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Unrealized Gross Margin</span>
            <div className="text-2xl font-black text-indigo-600 font-mono">
              {valuation.marginPercent}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Spread: <strong className="text-slate-800 font-bold">{formatCurrency(valuation.potentialGrossMargin)}</strong>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs and Filter Control */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Tab Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 px-4 pt-3 pb-2 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stock Matrix</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {variantRows.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('low_stock')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'low_stock'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Low Stock Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab('movements')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Movement Log</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'movements' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {stockMovements.length}
              </span>
            </button>
          </div>

          {/* Store Switcher & Search inside table */}
          {activeTab !== 'movements' && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Locations (Total)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU or barcode..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content depending on tab */}
        {activeTab === 'inventory' || activeTab === 'low_stock' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-[24%] min-w-[210px]">Product & Variant Specs</th>
                  <th className="p-3.5 w-[14%] min-w-[130px]">Variant SKU</th>
                  <th className="p-3.5 w-[10%] min-w-[100px]">Condition</th>
                  <th className="p-3.5 w-[9%] min-w-[85px]">Unit Cost</th>
                  <th className="p-3.5 w-[9%] min-w-[90px]">Retail Price</th>
                  <th className="p-3.5 w-[11%] min-w-[105px]">
                    {selectedBranchFilter === 'all' ? 'Network Total' : `${branches.find(b => b.id === selectedBranchFilter)?.code} Store Stock`}
                  </th>
                  <th className="p-3.5 w-[9%] min-w-[85px]">Network Total</th>
                  <th className="p-3.5 w-[6%] min-w-[70px]">Threshold</th>
                  <th className="p-3.5 text-right w-[14%] min-w-[130px]">Quick Restock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variantRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs text-slate-400">
                      No stock items found matching criteria.
                    </td>
                  </tr>
                ) : (
                  variantRows.map(({ product, variant, localStock }) => {
                    const isOut = localStock <= 0;
                    const isLow = localStock > 0 && localStock <= variant.lowStockThreshold;

                    return (
                      <tr key={variant.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={variant.image || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{product.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                                {variant.color} {variant.storage ? `• ${variant.storage}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-slate-600 font-bold whitespace-nowrap">
                          {variant.sku}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg inline-block whitespace-nowrap">
                            {variant.condition}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-slate-500 font-medium whitespace-nowrap">
                          {formatCurrency(variant.costPrice)}
                        </td>

                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(variant.price)}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                              0 Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
                              {localStock} Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {localStock} Units
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-semibold text-slate-600 whitespace-nowrap">
                          {variant.stock} units
                        </td>

                        <td className="p-3.5 text-slate-500 font-mono whitespace-nowrap">
                          ≤ {variant.lowStockThreshold}
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => adjustStock(product.id, variant.id, 5, 'Quick +5 Restock', 'restock')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => adjustStock(product.id, variant.id, 10, 'Quick +10 Restock', 'restock')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleOpenAdjustment(product.id, variant.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Movement Audit Log */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Delta</th>
                  <th className="p-3.5">Previous → New Stock</th>
                  <th className="p-3.5">Reason / Reference</th>
                  <th className="p-3.5">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-slate-500">
                      {formatDate(mov.createdAt, true)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{mov.productName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{mov.variantSku}</span>
                    </td>
                    <td className="p-3.5">
                      {getMovementBadge(mov.type)}
                    </td>
                    <td className="p-3.5 font-bold font-mono">
                      <span className={mov.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {mov.previousStock} → <strong className="text-slate-900">{mov.newStock}</strong>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {mov.reason}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {mov.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isAdjustModalOpen && (
        <StockAdjustmentModal
          onClose={() => setIsAdjustModalOpen(false)}
          preselectedProductId={selectedProdForAdjust}
          preselectedVariantId={selectedVarForAdjust}
        />
      )}
    </div>
  );
};
