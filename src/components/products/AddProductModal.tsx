'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { BrandName, CategoryName, DeviceCondition } from '@/types';
import { PRODUCT_IMAGES } from '@/data/mockData';
import { generateSKU, generateBarcode } from '@/lib/utils';
import { X, Plus, Trash2, Smartphone, ShieldCheck, Layers, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AddProductModalProps {
  onClose: () => void;
}

interface TempVariant {
  color: string;
  colorHex: string;
  storage?: string;
  ram?: string;
  condition: DeviceCondition;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  serialNumbersStr: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const { addProduct } = usePOS();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState<BrandName>('Apple');
  const [category, setCategory] = useState<CategoryName>('smartphones');
  const [basePrice, setBasePrice] = useState<number>(999);
  const [costPrice, setCostPrice] = useState<number>(750);
  const [imageUrl, setImageUrl] = useState<string>(PRODUCT_IMAGES.iphone16pro);
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);

  const [variants, setVariants] = useState<TempVariant[]>([
    {
      color: 'Titanium Black',
      colorHex: '#1f2937',
      storage: '256GB',
      ram: '8GB',
      condition: 'Brand New',
      price: 999,
      costPrice: 750,
      stock: 10,
      lowStockThreshold: 3,
      serialNumbersStr: '359182938471011, 359182938471012'
    }
  ]);

  const handleAddVariantRow = () => {
    setVariants(prev => [
      ...prev,
      {
        color: 'Natural Silver',
        colorHex: '#e2e8f0',
        storage: '512GB',
        ram: '8GB',
        condition: 'Brand New',
        price: basePrice + 200,
        costPrice: costPrice + 140,
        stock: 5,
        lowStockThreshold: 2,
        serialNumbersStr: ''
      }
    ]);
  };

  const handleRemoveVariantRow = (idx: number) => {
    if (variants.length <= 1) {
      toast.warning('Product must have at least one variant!');
      return;
    }
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateVariant = (idx: number, field: keyof TempVariant, value: any) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const mainSku = generateSKU(brand, name);
    const mainBarcode = generateBarcode();

    const formattedVariants = variants.map((v) => {
      const vSku = generateSKU(brand, name, `${v.color}-${v.storage || 'STD'}`);
      const vBarcode = generateBarcode();
      const serials = v.serialNumbersStr
        ? v.serialNumbersStr.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      return {
        sku: vSku,
        barcode: vBarcode,
        color: v.color,
        colorHex: v.colorHex || '#1e293b',
        storage: v.storage,
        ram: v.ram,
        condition: v.condition,
        price: Number(v.price),
        costPrice: Number(v.costPrice),
        stock: Number(v.stock),
        lowStockThreshold: Number(v.lowStockThreshold) || 3,
        serialNumbers: serials,
        image: imageUrl
      };
    });

    addProduct({
      name: name.trim(),
      brand,
      category,
      basePrice: Number(basePrice),
      costPrice: Number(costPrice),
      image: imageUrl.trim() || PRODUCT_IMAGES.iphone16pro,
      sku: mainSku,
      barcode: mainBarcode,
      description: description.trim() || 'High-performance electronic hardware.',
      featured,
      variants: formattedVariants
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Product to Catalog</h2>
              <p className="text-[11px] text-slate-500">Configure device specs, multi-variant matrix, and retail pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Product / Model Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 16 Pro Max or Galaxy S24 Ultra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Brand *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as BrandName)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                {['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Sony', 'Anker', 'Spigen', 'Belkin', 'JBL', 'Huawei', 'Bose'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryName)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium capitalize"
              >
                {[
                  'smartphones', 'accessories', 'chargers', 'powerbanks', 
                  'cases', 'screen-protectors', 'smartwatches', 'earbuds', 'cables', 'gadgets'
                ].map(c => (
                  <option key={c} value={c}>{c.replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Base Retail Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Base Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Image URL & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                High-Resolution Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Marketing Description & Features
              </label>
              <textarea
                rows={2}
                placeholder="Product highlights, processor specs, camera details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Multi-Variant Matrix Builder */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Product Variants & Inventory Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-500">Configure colorways, storage configurations, and stock counts</p>
              </div>

              <button
                type="button"
                onClick={handleAddVariantRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Variant #{idx + 1}</span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">Color</label>
                      <input
                        type="text"
                        placeholder="Natural Titanium"
                        value={v.color}
                        onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">Storage</label>
                      <input
                        type="text"
                        placeholder="256GB"
                        value={v.storage || ''}
                        onChange={(e) => handleUpdateVariant(idx, 'storage', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">Retail Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">Initial Stock</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">
                      IMEI / Serial Numbers (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 359182938471011, 359182938471012"
                      value={v.serialNumbersStr}
                      onChange={(e) => handleUpdateVariant(idx, 'serialNumbersStr', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-slate-300 font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Create Product & Variants
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
