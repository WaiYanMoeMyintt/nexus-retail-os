'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { Product, BrandName, CategoryName } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Smartphone, 
  Layers, 
  Download, 
  Check, 
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  Sparkles,
  Barcode,
  TrendingUp,
  Tag,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductsView: React.FC = () => {
  const { products, deleteProduct, globalSearch, setGlobalSearch } = usePOS();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedBrand, setSelectedBrand] = useState<BrandName | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'all'>('all');
  const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      if (stockStatus === 'in_stock' && p.totalStock <= 0) return false;
      if (stockStatus === 'low_stock' && (p.totalStock <= 0 || p.totalStock > 5)) return false;
      if (stockStatus === 'out_of_stock' && p.totalStock > 0) return false;

      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        return matchName || matchBrand || matchSku || matchBarcode;
      }

      return true;
    });
  }, [products, selectedBrand, selectedCategory, stockStatus, globalSearch]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Brand', 'Category', 'SKU', 'Barcode', 'Base Price', 'Cost Price', 'Total Stock', 'Sales Count'];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name}"`,
      p.brand,
      p.category,
      p.sku,
      p.barcode,
      p.basePrice,
      p.costPrice,
      p.totalStock,
      p.salesCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexustech_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Product catalog exported to CSV');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
      toast.success(`Deleted ${name}`);
    }
  };

  // Helper for brand tag colors (pure text, NO emoji)
  const getBrandBadgeClass = (brand: string) => {
    switch (brand) {
      case 'Apple':
        return 'bg-slate-900 text-white';
      case 'Samsung':
        return 'bg-blue-600 text-white';
      case 'Google':
        return 'bg-emerald-600 text-white';
      case 'Xiaomi':
        return 'bg-amber-600 text-white';
      case 'OnePlus':
        return 'bg-rose-600 text-white';
      case 'Sony':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Product & Variant Catalog</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-100">
              {filteredProducts.length} Items
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage flagship smartphones, audio wearables, chargers, and multi-variant specs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, brand, SKU or barcode..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Brands</option>
              {['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Sony', 'Anker', 'Spigen', 'Belkin', 'JBL', 'Bose'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold capitalize focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {['smartphones', 'chargers', 'powerbanks', 'cases', 'screen-protectors', 'smartwatches', 'earbuds', 'cables', 'gadgets'].map(c => (
                <option key={c} value={c}>{c.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt;0)</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold">Showing {filteredProducts.length} of {products.length} catalog items</span>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-[32%] min-w-[280px]">Product & SKU</th>
                  <th className="p-3.5 w-[14%] min-w-[120px]">Brand / Category</th>
                  <th className="p-3.5 w-[10%] min-w-[90px]">Base Price</th>
                  <th className="p-3.5 w-[10%] min-w-[90px]">Cost Price</th>
                  <th className="p-3.5 w-[16%] min-w-[150px]">Variants & Specs</th>
                  <th className="p-3.5 w-[10%] min-w-[95px]">Total Stock</th>
                  <th className="p-3.5 w-[8%] min-w-[75px]">Sales Count</th>
                  <th className="p-3.5 text-right w-[8%] min-w-[70px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isOut = p.totalStock <= 0;
                  const isLow = p.totalStock > 0 && p.totalStock <= 5;
                  const brandClass = getBrandBadgeClass(p.brand);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Product Thumbnail & Details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {/* Modern Borderless Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-all duration-200 shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-slate-900 text-xs block leading-tight truncate group-hover:text-indigo-600 transition-colors">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {p.sku}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #{p.barcode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${brandClass}`}>
                          {p.brand}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5 capitalize">
                          {p.category.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap text-sm">
                        {formatCurrency(p.basePrice)}
                      </td>

                      {/* Cost Price */}
                      <td className="p-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {formatCurrency(p.costPrice)}
                      </td>

                      {/* Variants & Specs */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.variants.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700"
                            >
                              <span className="font-medium">{v.color}</span>
                              {v.storage && <span className="text-slate-400">({v.storage})</span>}
                              <strong className="text-slate-900 font-mono font-bold">x{v.stock}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            0 Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                            {p.totalStock} Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.totalStock} in stock
                          </span>
                        )}
                      </td>

                      {/* Sales Count */}
                      <td className="p-3.5 font-mono text-slate-800 font-bold whitespace-nowrap">
                        {p.salesCount} sold
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Edit product"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Modern Grid Cards Display */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isOut = p.totalStock <= 0;
            const isLow = p.totalStock > 0 && p.totalStock <= 5;
            const brandClass = getBrandBadgeClass(p.brand);

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group">
                <div>
                  {/* Hero Photo Container */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Floating Brand Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${brandClass}`}>
                      {p.brand}
                    </span>

                    {/* Floating Stock Badge */}
                    <div className="absolute top-2 right-2">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-xs">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          {p.totalStock} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                          {p.totalStock} in stock
                        </span>
                      )}
                    </div>

                    {/* Options Count */}
                    {p.variants.length > 1 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{p.variants.length} Options</span>
                      </span>
                    )}
                  </div>

                  {/* Title & SKU */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.category.replace('-', ' ')}</span>
                    <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 min-h-[2rem] group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">{p.sku}</p>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">{formatCurrency(p.basePrice)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Cost: {formatCurrency(p.costPrice)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddProductModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
