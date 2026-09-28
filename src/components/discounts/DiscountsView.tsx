'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { DiscountPromo } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { 
  Tag, 
  Plus, 
  Percent, 
  DollarSign, 
  Calendar, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  Power,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export const DiscountsView: React.FC = () => {
  const { discounts, addDiscount, toggleDiscountStatus, deleteDiscount } = usePOS();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(50);
  const [appliesTo, setAppliesTo] = useState<'all' | 'category' | 'brand'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      toast.error('Coupon code and title are required');
      return;
    }

    addDiscount({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || `${value}${type === 'percentage' ? '%' : '$'} discount coupon`,
      type,
      value: Number(value),
      minOrderAmount: Number(minSpend),
      appliesTo,
      targetValue: targetValue.trim() || undefined,
      startDate,
      endDate,
      isActive: true
    });

    setIsCreateModalOpen(false);
    setCode('');
    setTitle('');
    setDescription('');
  };

  const handleCopyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success(`Coupon code ${c} copied to clipboard!`);
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Discounts, Coupons & Promo Campaigns</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-100">
              {discounts.length} Active Deals
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Configure percentage discounts, instant cashback keys, and brand-specific voucher campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo</span>
        </button>
      </div>

      {/* Promo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((disc) => (
          <div 
            key={disc.id} 
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-2xs transition-all ${
              disc.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
            }`}
          >
            <div className="space-y-3">
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    disc.type === 'percentage' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {disc.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{disc.title}</h3>
                    <span className="text-[10px] text-slate-400">Min spend: {formatCurrency(disc.minOrderAmount)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDiscountStatus(disc.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    disc.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                  }`}
                  title={disc.isActive ? 'Deactivate promo' : 'Activate promo'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coupon Code Pill */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <span className="font-mono font-black text-xs text-blue-700 tracking-wider">
                  {disc.code}
                </span>
                <button
                  onClick={() => handleCopyCode(disc.code)}
                  className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Description & Value */}
              <div className="space-y-1 text-xs">
                <p className="text-slate-600 font-medium">{disc.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Valid: {formatDate(disc.startDate)} - {formatDate(disc.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold font-mono text-[11px]">
                {disc.usageCount} times redeemed
              </span>

              <button
                onClick={() => deleteDiscount(disc.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Delete promotion"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Promo Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Create New Promotion / Coupon</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Flash Sale"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={minSpend}
                    onChange={(e) => setMinSpend(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for orders above $100"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Create & Activate Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
