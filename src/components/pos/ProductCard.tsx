'use client';

import React from 'react';
import { Product } from '@/types';
import { usePOS } from '@/context/POSContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus, Layers, Check, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { cart, addToCart, updateCartQty, activeBranchId, activeBranch } = usePOS();

  // Find if any variant of this product is already in the cart
  const cartItemsForProduct = cart.filter(c => c.productId === product.id);
  const totalCartQty = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
  const isItemInCart = totalCartQty > 0;

  // Price calculations
  const prices = product.variants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const isSinglePrice = minPrice === maxPrice;

  // Branch-specific stock vs Regional network stock
  const branchStock = product.variants.reduce((sum, v) => {
    const stock = v.branchStocks?.[activeBranchId] ?? (activeBranchId === 'branch-1' ? v.stock : 0);
    return sum + stock;
  }, 0);
  const totalStock = product.totalStock;
  const isOutOfStock = branchStock <= 0;
  const isLowStock = branchStock > 0 && branchStock <= 3;

  const handleCardClick = () => {
    onSelectProduct(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length === 1 && !isOutOfStock) {
      addToCart(product, product.variants[0], 1);
    } else {
      onSelectProduct(product);
    }
  };

  const handleQuickMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItemsForProduct.length === 1) {
      updateCartQty(cartItemsForProduct[0].id, -1);
    } else {
      onSelectProduct(product);
    }
  };

  const getCategoryFallback = (cat: string) => {
    switch (cat) {
      case 'smartphones':
        return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80';
      case 'earbuds':
        return 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=80';
      case 'smartwatches':
        return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80';
      case 'chargers':
      case 'powerbanks':
        return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80';
      case 'cases':
        return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=800&auto=format&fit=crop&q=80';
      case 'screen-protectors':
        return 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80';
      case 'cables':
        return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80';
      case 'gadgets':
      default:
        return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80';
    }
  };

  const [imgSrc, setImgSrc] = React.useState(product.image || getCategoryFallback(product.category));
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(product.image || getCategoryFallback(product.category));
    setHasError(false);
  }, [product.image, product.category]);

  const handleImgError = () => {
    const fallback = getCategoryFallback(product.category);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer select-none ${
        isItemInCart
          ? 'border-indigo-500/80 shadow-md ring-2 ring-indigo-500/20 bg-indigo-50/10'
          : 'border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Product Photo Container */}
        <div className="relative w-full aspect-4/3 bg-slate-100/80 rounded-xl overflow-hidden mb-2.5 ring-1 ring-slate-900/5 shadow-2xs group-hover:shadow-xs transition-all">
          {!hasError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imgSrc}
              alt={product.name}
              onError={handleImgError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
              <Layers className="w-8 h-8 stroke-1 text-slate-400" />
            </div>
          )}

          {/* Brand Tag (Top Left) */}
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-white/95 text-slate-800 shadow-2xs border border-slate-200/80 uppercase tracking-wider">
            {product.brand}
          </span>

          {/* Status Badge (Top Right: In Cart > Out of Stock at Store > Low Stock) */}
          <div className="absolute top-2 right-2">
            {isItemInCart ? (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-indigo-600 text-white shadow-xs flex items-center gap-1 animate-in fade-in zoom-in-95">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>{totalCartQty}</span>
              </span>
            ) : isOutOfStock ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                {totalStock > 0 ? `0 at ${activeBranch.code}` : 'Out of Stock'}
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                {branchStock} left ({activeBranch.code})
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                {branchStock} in stock
              </span>
            )}
          </div>

          {/* Variant count pill (Bottom Left) */}
          {product.variants.length > 1 && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white/95 backdrop-blur-xs text-indigo-700 border border-indigo-100 shadow-2xs flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>{product.variants.length} Options</span>
            </span>
          )}
        </div>

        {/* Title & SKU / Specs */}
        <div className="space-y-1">
          <h3 
            className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 min-h-[2rem] group-hover:text-indigo-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
            {product.variants[0]?.storage && (
              <span className="font-semibold text-slate-500">{product.variants[0].storage}</span>
            )}
            {product.variants[0]?.storage && <span>•</span>}
            <span className="truncate">{product.sku}</span>
          </p>
        </div>
      </div>

      {/* Price & Action Control Row */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 min-w-0">
        {/* Price display */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-black text-slate-900 tracking-tight truncate block">
            {formatCurrency(minPrice)}
          </span>
          {!isSinglePrice && (
            <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">
              to {formatCurrency(maxPrice)}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="shrink-0">
          {product.variants.length > 1 ? (
            // Multi-variant product: Open specs modal
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              title="Configure options & variants"
              className={`h-7 px-2.5 rounded-xl flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isItemInCart
                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-95'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/90 shadow-2xs active:scale-95'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Options</span>
            </button>
          ) : isItemInCart ? (
            // Single-variant item in cart: Stepper control
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-0.5 bg-indigo-50 text-indigo-700 p-0.5 rounded-xl border border-indigo-200 shadow-2xs"
            >
              <button
                type="button"
                onClick={handleQuickMinus}
                title="Decrease quantity"
                className="w-5.5 h-5.5 rounded-lg flex items-center justify-center bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs transition-all active:scale-90 cursor-pointer"
              >
                <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
              <span className="w-4.5 text-center text-xs font-black">
                {totalCartQty}
              </span>
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={isOutOfStock}
                title="Increase quantity"
                className="w-5.5 h-5.5 rounded-lg flex items-center justify-center bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            // Single-variant item not in cart: Quick add button
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200/90 shadow-2xs active:scale-95'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
