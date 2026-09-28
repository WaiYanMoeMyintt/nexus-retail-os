'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Product, BrandName, CategoryName } from '@/types';
import { X, Save, Trash2, Edit3, Plus } from 'lucide-react';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const { updateProduct } = usePOS();

  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState<BrandName>(product.brand);
  const [category, setCategory] = useState<CategoryName>(product.category);
  const [basePrice, setBasePrice] = useState<number>(product.basePrice);
  const [costPrice, setCostPrice] = useState<number>(product.costPrice);
  const [image, setImage] = useState(product.image);
  const [description, setDescription] = useState(product.description);
  const [variants, setVariants] = useState(product.variants);

  const handleUpdateVariant = (idx: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct({
      ...product,
      name: name.trim(),
      brand,
      category,
      basePrice: Number(basePrice),
      costPrice: Number(costPrice),
      image: image.trim(),
      description: description.trim(),
      variants: variants.map(v => ({
        ...v,
        price: Number(v.price),
        costPrice: Number(v.costPrice),
        stock: Number(v.stock),
        lowStockThreshold: Number(v.lowStockThreshold)
      }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Product: {product.name}</h2>
              <span className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Sony', 'Anker', 'Spigen', 'Belkin', 'JBL', 'Bose'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Base Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Base Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Variants Table */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs mb-2">Variant Stock & Prices</h3>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-4 gap-2 text-xs items-center">
                  <div>
                    <span className="font-bold text-slate-800 block">{v.color}</span>
                    <span className="text-[10px] text-slate-500">{v.storage || v.condition}</span>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 font-semibold block">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 font-semibold block">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 font-semibold block">Low Threshold</label>
                    <input
                      type="number"
                      value={v.lowStockThreshold}
                      onChange={(e) => handleUpdateVariant(idx, 'lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs bg-white rounded border border-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
