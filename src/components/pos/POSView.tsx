'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { Product, CategoryName, BrandName } from '@/types';
import { ProductCard } from './ProductCard';
import { VariantModal } from './VariantModal';
import { CartSidebar } from './CartSidebar';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { useHorizontalScroll } from '@/lib/useHorizontalScroll';
import { 
  Search, 
  ScanLine, 
  Layers, 
  Smartphone, 
  Headphones, 
  Watch, 
  Zap, 
  BatteryMedium, 
  Shield, 
  Cable, 
  Radio, 
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Star,
  Flame,
  Clock,
  ArrowUpAZ,
  ArrowDownZA,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  Check,
  RotateCcw,
  LayoutGrid,
  Grid2X2
} from 'lucide-react';

export type SortOption = 
  | 'featured' 
  | 'price_asc' 
  | 'price_desc' 
  | 'name_asc' 
  | 'name_desc' 
  | 'stock_desc' 
  | 'stock_asc' 
  | 'bestsellers' 
  | 'rating' 
  | 'newest';

interface POSViewProps {
  isMobileCartOpen?: boolean;
  onCloseMobileCart?: () => void;
}

export const POSView: React.FC<POSViewProps> = ({ isMobileCartOpen, onCloseMobileCart }) => {
  const { 
    products, 
    globalSearch, 
    setGlobalSearch, 
    lastCompletedOrder, 
    setLastCompletedOrder,
    activeBranchId,
    activeBranch,
    branches,
    setActiveBranchId
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<BrandName | 'all'>('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const gridRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Horizontal mouse-wheel and navigation hooks for Category & Brand tab strips
  const { 
    containerRef: categoryScrollRef, 
    canScrollLeft: canCategoryScrollLeft, 
    canScrollRight: canCategoryScrollRight, 
    scrollLeftBy: scrollCategoryLeft, 
    scrollRightBy: scrollCategoryRight,
    dragProps: categoryDragProps
  } = useHorizontalScroll<HTMLDivElement>({ wheelSpeed: 1.2, scrollStep: 300 });

  const { 
    containerRef: brandScrollRef, 
    canScrollLeft: canBrandScrollLeft, 
    canScrollRight: canBrandScrollRight, 
    scrollLeftBy: scrollBrandLeft, 
    scrollRightBy: scrollBrandRight,
    dragProps: brandDragProps
  } = useHorizontalScroll<HTMLDivElement>({ wheelSpeed: 1.2, scrollStep: 220 });

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category cards configuration
  const categories = [
    { id: 'all', label: 'All Items', icon: Layers, sublabel: 'Complete Catalog' },
    { id: 'smartphones', label: 'Smartphones', icon: Smartphone, sublabel: 'Flagships & 5G' },
    { id: 'earbuds', label: 'Audio & Buds', icon: Headphones, sublabel: 'Hi-Res ANC' },
    { id: 'smartwatches', label: 'Smartwatches', icon: Watch, sublabel: 'GPS & LTE' },
    { id: 'chargers', label: 'GaN Chargers', icon: Zap, sublabel: 'Fast Charging' },
    { id: 'powerbanks', label: 'Power Banks', icon: BatteryMedium, sublabel: 'High Capacity' },
    { id: 'cases', label: 'Cases & Covers', icon: Shield, sublabel: 'MagSafe Armor' },
    { id: 'screen-protectors', label: 'Screen Glass', icon: Shield, sublabel: '9H Tempered' },
    { id: 'cables', label: 'Cables', icon: Cable, sublabel: 'Type-C & 240W' },
    { id: 'gadgets', label: 'Smart Gadgets', icon: Radio, sublabel: 'Speakers & Hubs' },
  ];

  const brands: (BrandName | 'all')[] = [
    'all',
    'Apple',
    'Samsung',
    'Google',
    'Xiaomi',
    'OnePlus',
    'Sony',
    'Anker',
    'Spigen',
    'Belkin',
    'JBL',
    'Bose',
    'Pitaka'
  ];

  const sortOptionsList: { id: SortOption; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'featured', label: 'Featured & Recommended', icon: Sparkles, description: 'Default curated showcase' },
    { id: 'price_asc', label: 'Price: Low to High', icon: ArrowDownNarrowWide, description: 'Affordable to premium' },
    { id: 'price_desc', label: 'Price: High to Low', icon: ArrowUpWideNarrow, description: 'Premium flagships first' },
    { id: 'name_asc', label: 'Name: A to Z', icon: ArrowUpAZ, description: 'Alphabetical order' },
    { id: 'name_desc', label: 'Name: Z to A', icon: ArrowDownZA, description: 'Reverse alphabetical' },
    { id: 'bestsellers', label: 'Best Sellers', icon: Flame, description: 'Highest sales velocity' },
    { id: 'rating', label: 'Customer Rating', icon: Star, description: 'Top user reviews' },
    { id: 'newest', label: 'Newest Arrivals', icon: Clock, description: 'Recently added items' },
    { id: 'stock_desc', label: 'Stock: High to Low', icon: Layers, description: 'Highest store inventory' },
    { id: 'stock_asc', label: 'Stock: Low to High', icon: RotateCcw, description: 'Critical stock reorder priority' },
  ];

  const currentSortObj = sortOptionsList.find(s => s.id === sortBy) || sortOptionsList[0];

  const branchTotalUnits = useMemo(() => {
    return products.reduce((total, p) => {
      return total + p.variants.reduce((sum, v) => sum + (v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0)), 0);
    }, 0);
  }, [products, activeBranchId]);

  // Filtering and Sorting logic
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      const branchStock = p.variants.reduce((sum, v) => sum + (v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0)), 0);
      if (stockFilter === 'in_stock' && branchStock <= 0) return false;
      if (stockFilter === 'low_stock' && (branchStock <= 0 || branchStock > 3)) return false;

      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        const matchVariant = p.variants.some(v => 
          v.sku.toLowerCase().includes(q) || 
          v.color.toLowerCase().includes(q) ||
          (v.storage && v.storage.toLowerCase().includes(q)) ||
          v.barcode.includes(q) ||
          (v.serialNumbers && v.serialNumbers.some(s => s.includes(q)))
        );
        return matchName || matchBrand || matchSku || matchBarcode || matchVariant;
      }

      return true;
    });

    // Helper to calculate min price
    const getMinPrice = (p: Product) => Math.min(...p.variants.map(v => v.price));
    // Helper to calculate store stock
    const getStock = (p: Product) => p.variants.reduce((sum, v) => sum + (v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0)), 0);

    // Apply sorting
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return getMinPrice(a) - getMinPrice(b);
        case 'price_desc':
          return getMinPrice(b) - getMinPrice(a);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'bestsellers':
          return (b.salesCount || 0) - (a.salesCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'stock_desc':
          return getStock(b) - getStock(a);
        case 'stock_asc':
          return getStock(a) - getStock(b);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [products, selectedCategory, selectedBrand, stockFilter, globalSearch, activeBranchId, sortBy]);

  // GSAP animation on view filter/sort change
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.group');
      if (cards.length > 0) {
        gsapAnimations.staggerEntrance(cards, 0.025);
      }
    }
  }, [selectedCategory, selectedBrand, stockFilter, activeBranchId, sortBy]);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || stockFilter !== 'all' || globalSearch.trim() !== '' || sortBy !== 'featured';

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setStockFilter('all');
    setGlobalSearch('');
    setSortBy('featured');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/70">
      {/* Center Main POS Catalog Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Control Bar & Category Grid */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200/80 space-y-3 shrink-0 shadow-2xs">
          {/* Active Store Context Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-100 rounded-xl text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 font-medium">Terminal:</span>
              <span className="font-extrabold text-slate-900">{activeBranch.name}</span>
              <span className="font-mono font-bold bg-white text-blue-700 px-1.5 py-0.2 rounded border border-blue-200/60 text-[10px]">
                {activeBranch.code}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded-md text-[11px]">
                {branchTotalUnits} units in stock
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Switch Store:</span>
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value)}
                className="text-[11px] font-bold bg-white text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer shadow-2xs hover:border-blue-400 transition-colors"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 1: Header title, Item count badge & Barcode / IMEI Scanner */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                Catalog & Register
              </h2>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100/80 shrink-0">
                {filteredProducts.length} Items Available
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear all active filters and search"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Grid Density Toggle (Comfortable vs Compact) */}
              <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setGridDensity('comfortable')}
                  title="Comfortable Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    gridDensity === 'comfortable' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridDensity('compact')}
                  title="Compact Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    gridDensity === 'compact' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
              </div>

              {/* Barcode Scanner Button */}
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
                <span className="hidden sm:inline">Barcode / IMEI Scanner</span>
                <span className="sm:hidden">Scanner</span>
              </button>
            </div>
          </div>

          {/* Row 2: Category Selector Cards with Mouse-Wheel Horizontal Scroll & Arrow Controls */}
          <div className="relative group/category-nav">
            {/* Left Scroll Navigation Button */}
            {canCategoryScrollLeft && (
              <button
                type="button"
                onClick={() => scrollCategoryLeft(320)}
                aria-label="Scroll categories left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-10 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-r-xl shadow-md border border-l-0 border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Left Fade Gradient */}
            {canCategoryScrollLeft && (
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-5" />
            )}

            {/* Category Scroll Container */}
            <div 
              ref={categoryScrollRef}
              {...categoryDragProps}
              className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'all' 
                  ? products.length 
                  : products.filter(p => p.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-2xl border text-left transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/60'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold leading-tight">{cat.label}</span>
                      <span className={`block text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Fade Gradient */}
            {canCategoryScrollRight && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-5" />
            )}

            {/* Right Scroll Navigation Button */}
            {canCategoryScrollRight && (
              <button
                type="button"
                onClick={() => scrollCategoryRight(320)}
                aria-label="Scroll categories right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-10 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-l-xl shadow-md border border-r-0 border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row 3: Brand Filter Chips, Stock Filter & Sorting Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
            {/* Brands scrollable list with navigation */}
            <div className="relative flex items-center flex-1 min-w-0 group/brand-nav">
              {canBrandScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollBrandLeft(200)}
                  aria-label="Scroll brands left"
                  className="absolute left-0 z-10 w-6 h-7 bg-white/95 text-slate-700 rounded-r shadow-xs border border-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}

              <div 
                ref={brandScrollRef}
                {...brandDragProps}
                className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-1 min-w-0 cursor-grab active:cursor-grabbing select-none"
              >
                <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mr-1 shrink-0">Brand:</span>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                      selectedBrand === b
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b === 'all' ? 'All Brands' : b}
                  </button>
                ))}
              </div>

              {canBrandScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollBrandRight(200)}
                  aria-label="Scroll brands right"
                  className="absolute right-0 z-10 w-6 h-7 bg-white/95 text-slate-700 rounded-l shadow-xs border border-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right Controls: Stock Segmented Switch & Sort Selector */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end shrink-0">
              {/* Quick stock status segmented switch */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600 shrink-0">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  All Stock
                </button>
                <button
                  onClick={() => setStockFilter('in_stock')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockFilter === 'in_stock' ? 'bg-white text-emerald-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  In Stock
                </button>
                <button
                  onClick={() => setStockFilter('low_stock')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    stockFilter === 'low_stock' ? 'bg-white text-amber-700 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  Low Stock
                </button>
              </div>

              {/* Comprehensive Sort Dropdown */}
              <div className="relative shrink-0" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    sortBy !== 'featured'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/10'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-slate-400 font-semibold">Sort:</span>
                  <span className="truncate max-w-[110px]">{currentSortObj.label}</span>
                </button>

                {/* Dropdown Menu */}
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Sort Products</span>
                      {sortBy !== 'featured' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('featured');
                            setIsSortDropdownOpen(false);
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1 space-y-0.5">
                      {sortOptionsList.map((option) => {
                        const Icon = option.icon;
                        const isSelected = sortBy === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSortBy(option.id);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-900 font-extrabold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="block text-xs leading-tight">{option.label}</span>
                                <span className="block text-[10px] text-slate-400 font-medium">{option.description}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid Area with Smooth Mouse Scrolling */}
        <div 
          className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain transition-all"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredProducts.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try adjusting your search keywords, category, brand, or stock filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-3 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div 
              ref={gridRef}
              className={
                gridDensity === 'compact'
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1900px]:grid-cols-6 gap-2.5 sm:gap-3"
                  : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1900px]:grid-cols-5 gap-3 sm:gap-3.5"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProductForModal(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Desktop Cart / Order Summary Sidebar */}
      <div className="hidden lg:block">
        <CartSidebar
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {/* Mobile Cart Bottom Sheet */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white animate-in slide-in-from-right duration-300">
            <CartSidebar
              isMobileDrawer
              onCloseMobileDrawer={onCloseMobileCart}
              onOpenPaymentModal={() => {
                onCloseMobileCart?.();
                setIsPaymentModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProductForModal && (
        <VariantModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {isReceiptModalOpen && (
        <ReceiptModal
          order={lastCompletedOrder}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setLastCompletedOrder(null);
          }}
        />
      )}

      {isScannerModalOpen && (
        <BarcodeScannerModal
          onClose={() => setIsScannerModalOpen(false)}
        />
      )}
    </div>
  );
};
