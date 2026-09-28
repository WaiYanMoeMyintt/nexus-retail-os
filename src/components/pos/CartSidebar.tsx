'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingCart, 
  Trash2, 
  User, 
  UserPlus, 
  Tag, 
  Percent, 
  Plus, 
  Minus, 
  Store, 
  Truck, 
  Package, 
  X,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
  FileText,
  Bookmark,
  Sparkles,
  Smartphone,
  ChevronDown,
  Clock,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { QuickAddCustomerModal } from './QuickAddCustomerModal';
import { toast } from 'sonner';

interface CartSidebarProps {
  onOpenPaymentModal: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
  onOpenPaymentModal, 
  isMobileDrawer = false, 
  onCloseMobileDrawer 
}) => {
  const { 
    cartTabs,
    activeCartId,
    setActiveCartId,
    createCartTab,
    closeCartTab,
    parkCart,
    resumeParkedCart,
    cart, 
    cartCustomer, 
    setCartCustomer, 
    customers, 
    devices,
    activeBranchId,
    cartSummary, 
    updateCartQty, 
    removeFromCart, 
    applyCartItemDiscount, 
    appliedCoupon, 
    applyCouponCode, 
    removeCoupon, 
    clearCart,
    fulfillmentType,
    setFulfillmentType,
    permissions,
    settings
  } = usePOS();

  const [couponInput, setCouponInput] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [activeDiscountItemId, setActiveDiscountItemId] = useState<string | null>(null);
  const [itemDiscountVal, setItemDiscountVal] = useState<number>(0);
  const [itemDiscountType, setItemDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const parkedCarts = cartTabs.filter(t => t.isParked);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleOpenItemDiscount = (item: any) => {
    setActiveDiscountItemId(item.id);
    setItemDiscountVal(item.discount || 0);
    setItemDiscountType(item.discountType || 'percentage');
  };

  const handleSaveItemDiscount = () => {
    if (activeDiscountItemId) {
      applyCartItemDiscount(activeDiscountItemId, itemDiscountVal, itemDiscountType);
      setActiveDiscountItemId(null);
    }
  };

  const handleParkOrder = () => {
    if (cart.length === 0) return;
    const note = prompt('Enter a note for this parked cart (e.g. customer stepping to ATM):');
    parkCart(activeCartId, note || undefined);
  };

  return (
    <div className={`flex flex-col bg-white border-l border-slate-200 h-full ${
      isMobileDrawer ? 'w-full' : 'w-96 shrink-0'
    }`}>
      {/* Multi-Cart Tab Switcher */}
      <div className="bg-slate-100/90 px-3 pt-2.5 border-b border-slate-200/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {cartTabs.filter(t => !t.isParked).map((tab) => {
            const isActive = tab.id === activeCartId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveCartId(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-white text-indigo-700 border-t-2 border-t-indigo-600 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                <span>{tab.name}</span>
                {tab.items.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
                {cartTabs.filter(t => !t.isParked).length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeCartTab(tab.id);
                    }}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={createCartTab}
            title="Open another register cart"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Parked Carts indicator */}
        {parkedCarts.length > 0 && (
          <button
            type="button"
            onClick={() => setShowParkedModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer mb-1 shadow-2xs"
          >
            <Bookmark className="w-3 h-3 text-amber-700" />
            <span>{parkedCarts.length} Parked</span>
          </button>
        )}
      </div>

      {/* Sidebar Top Controls */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-3">
        {/* Customer Selector & Quick Add */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={cartCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find(c => c.id === e.target.value);
                setCartCustomer(found || null);
              }}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold transition-all"
            >
              <option value="">Walk-in Guest</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier} • {c.loyaltyPoints} pts)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCustomerModal(true)}
            title="Register new customer"
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              title="Clear cart"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Fulfillment Switcher (In-Store, Pickup, Delivery) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl text-center">
          <button
            type="button"
            onClick={() => setFulfillmentType('in_store_pos')}
            className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              fulfillmentType === 'in_store_pos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3 h-3 text-indigo-600" />
            <span>Store</span>
          </button>

          <button
            type="button"
            onClick={() => setFulfillmentType('pickup')}
            className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              fulfillmentType === 'pickup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3 h-3 text-indigo-600" />
            <span>Pickup</span>
          </button>

          <button
            type="button"
            onClick={() => setFulfillmentType('delivery')}
            className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              fulfillmentType === 'delivery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>Delivery</span>
          </button>
        </div>
      </div>

      {/* Auto-Bundle Discounts Active Notification */}
      {cartSummary.autoBundleDiscountTotal > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3.5 py-1.5 flex items-center gap-2 text-xs text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Bundle Promo Applied: <strong>20% OFF Case</strong> (-${cartSummary.autoBundleDiscountTotal.toFixed(2)})
          </span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">Register ticket is empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Tap products from catalog or scan IMEI barcode to add to cart
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;
            let discountedLineTotal = lineTotal;
            if (item.discount > 0) {
              if (item.discountType === 'percentage') {
                discountedLineTotal -= (lineTotal * item.discount) / 100;
              } else {
                discountedLineTotal -= Math.min(lineTotal, item.discount * item.quantity);
              }
            }

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex gap-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={item.productName}>
                        {item.productName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      {item.variantSummary}
                    </div>

                    {/* IMEI serial tag if serialized */}
                    {item.selectedSerial && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 w-fit border border-indigo-100/80">
                        <QrCode className="w-2.5 h-2.5" />
                        <span>IMEI: {item.selectedSerial}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-0.5 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer text-xs font-bold shadow-2xs active:scale-90 transition-all"
                      title="Decrease quantity"
                    >
                      <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-black text-slate-900 w-5 text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer text-xs font-bold shadow-2xs active:scale-90 transition-all"
                      title="Increase quantity"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Price & Line Discount Trigger */}
                  <div className="text-right">
                    <div className="font-black text-xs text-slate-900 font-mono">
                      {formatCurrency(discountedLineTotal)}
                    </div>
                    {item.discount > 0 && (
                      <div className="text-[10px] text-slate-400 line-through font-mono">
                        {formatCurrency(lineTotal)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenItemDiscount(item)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 justify-end font-bold cursor-pointer transition-colors"
                    >
                      <Percent className="w-2.5 h-2.5" />
                      <span>{item.discount > 0 ? `-${item.discount}${item.discountType === 'percentage' ? '%' : '$'}` : 'Discount'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Item Discount Form */}
                {activeDiscountItemId === item.id && (
                  <div className="mt-2 p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 text-[11px]">Apply Line Discount</span>
                      <button
                        onClick={() => setActiveDiscountItemId(null)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={itemDiscountVal || ''}
                        onChange={(e) => setItemDiscountVal(parseFloat(e.target.value) || 0)}
                        placeholder="Value"
                        className="w-full px-2 py-1 text-xs bg-white rounded-lg border border-slate-300 font-bold focus:outline-hidden focus:border-indigo-500"
                      />
                      <select
                        value={itemDiscountType}
                        onChange={(e) => setItemDiscountType(e.target.value as any)}
                        className="px-2 py-1 text-xs bg-white rounded-lg border border-slate-300 font-bold focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveItemDiscount}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Order Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/90 space-y-3 shrink-0">
        {/* Coupon Code Input */}
        <div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">{appliedCoupon.code}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `$${appliedCoupon.value} OFF`})
                </span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Promo coupon..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full pl-8.5 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 uppercase placeholder:normal-case font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!couponInput.trim()}
                className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* Calculation Table */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Subtotal</span>
            <span className="font-bold text-slate-900 font-mono">{formatCurrency(cartSummary.subtotal)}</span>
          </div>

          {cartSummary.totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Total Discounts</span>
              <span className="font-mono">-{formatCurrency(cartSummary.totalDiscount)}</span>
            </div>
          )}

          {fulfillmentType === 'delivery' && (
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Shipping Delivery Fee</span>
              <span className="font-mono font-bold">{formatCurrency(cartSummary.shippingFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Estimated Tax ({settings.taxRate}%)</span>
            <span className="font-mono">{formatCurrency(cartSummary.taxAmount)}</span>
          </div>

          <div className="flex justify-between items-baseline text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable</span>
            <span className="text-lg font-black text-indigo-600 font-mono">
              {formatCurrency(cartSummary.grandTotal)}
            </span>
          </div>

          {/* Profit & Margin live preview for managers/owners */}
          {permissions.canViewCostBasis && cart.length > 0 && (
            <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-dashed border-slate-200">
              <span>Est. Gross Profit: <strong className="text-emerald-600 font-mono">{formatCurrency(cartSummary.grossProfit)}</strong></span>
              <span>Margin: <strong className="text-slate-700 font-mono">{cartSummary.grossMarginPercent.toFixed(1)}%</strong></span>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={onOpenPaymentModal}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer ${
              cart.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 active:scale-[0.98]'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Proceed to Checkout • {formatCurrency(cartSummary.grandTotal)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleParkOrder}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Park / Hold Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal for Quick Customer Register */}
      {showAddCustomerModal && (
        <QuickAddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onCustomerAdded={(newCust) => setCartCustomer(newCust)}
        />
      )}

      {/* Modal for Parked Carts Drawer */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Parked Held Orders ({parkedCarts.length})</h3>
              </div>
              <button onClick={() => setShowParkedModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {parkedCarts.map(pc => (
                <div key={pc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{pc.name} ({pc.items.length} items)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{pc.parkNote || 'No notes'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {pc.parkedAt ? new Date(pc.parkedAt).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resumeParkedCart(pc.id);
                      setShowParkedModal(false);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
