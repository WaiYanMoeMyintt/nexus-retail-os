'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { QuickAddCustomerModal } from '../pos/QuickAddCustomerModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award, 
  ChevronRight, 
  Sparkles, 
  X, 
  Clock, 
  DollarSign 
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, orders, globalSearch, setGlobalSearch, updateCustomer } = usePOS();

  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (selectedTier !== 'all' && c.tier !== selectedTier) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        return matchName || matchEmail || matchPhone;
      }
      return true;
    });
  }, [customers, selectedTier, globalSearch]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customer?.id === selectedCustomer.id);
  }, [selectedCustomer, orders]);

  const getTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'VIP':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-600" /> VIP Elite</span>;
      case 'Gold':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Gold Member</span>;
      case 'Silver':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">Silver Member</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">Bronze</span>;
    }
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Customer CRM & Loyalty Directory</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-100">
              {filteredCustomers.length} Customers
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Track customer lifetime spending, loyalty points, purchasing habits, and contact data.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name, email, or phone number..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Loyalty Tiers</option>
              <option value="VIP">VIP Elite</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={c.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{c.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{c.phone}</span>
                  </div>
                </div>

                {getTierBadge(c.tier)}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.address.city}, {c.address.state}</span>
                </div>
              </div>

              {c.notes && (
                <p className="text-[11px] text-slate-500 italic mt-2.5 line-clamp-1">
                  &quot;{c.notes}&quot;
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
                <span className="font-black text-slate-900 font-mono text-sm">{formatCurrency(c.totalSpent)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Points / Orders</span>
                <span className="font-bold text-blue-600">{c.loyaltyPoints} pts • {c.totalOrders} ord</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer */}
      {mounted && selectedCustomer && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedCustomer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={selectedCustomer.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getTierBadge(selectedCustomer.tier)}
                      <span className="text-xs text-slate-400 font-mono">Member since {formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-5">
                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifetime Spend</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Loyalty Balance</span>
                    <span className="text-sm font-black text-blue-600 mt-0.5 block">
                      {selectedCustomer.loyaltyPoints} Pts
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Orders</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {selectedCustomer.totalOrders}
                    </span>
                  </div>
                </div>

                {/* Contact & Location info */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Contact Data</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex justify-between items-start pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Shipping Address:</span>
                    <span className="text-right text-slate-800 max-w-xs">
                      {selectedCustomer.address.street}, {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zip}
                    </span>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                    Purchase History ({customerOrders.length})
                  </h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {customerOrders.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No orders recorded yet for this customer.
                      </div>
                    ) : (
                      customerOrders.map(ord => (
                        <div key={ord.id} className="p-3 bg-white text-xs flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-900">{ord.receiptNumber}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {formatDate(ord.createdAt, true)} • {ord.items.length} items
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 font-mono block">
                              {formatCurrency(ord.grandTotal)}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-emerald-600">
                              {ord.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <QuickAddCustomerModal
          onClose={() => setIsAddModalOpen(false)}
          onCustomerAdded={(c) => setSelectedCustomer(c)}
        />
      )}
    </div>
  );
};
