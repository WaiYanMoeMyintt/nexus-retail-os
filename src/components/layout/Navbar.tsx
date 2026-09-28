'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { 
  Bell, 
  Search, 
  ShoppingCart, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  CreditCard,
  Menu,
  Clock,
  Sparkles,
  User,
  ChevronDown,
  X,
  Building2,
  Shield,
  ShieldCheck,
  Smartphone,
  Tag
} from 'lucide-react';
import { formatTimeAgo, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { GlobalSearchDropdown } from './GlobalSearchDropdown';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  onOpenMobileCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar, onOpenMobileCart }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    cartSummary, 
    globalSearch,
    setGlobalSearch,
    branches,
    activeBranchId,
    activeBranch,
    setActiveBranchId,
    employees,
    currentUser,
    switchCurrentUser,
    smartAlerts,
    dismissSmartAlert,
    setActiveView
  } = usePOS();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read);
  const activeAlerts = smartAlerts.filter(a => !a.isDismissed);
  const totalBadges = unreadNotifs.length + activeAlerts.length;

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentDateTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 shadow-2xs">
      {/* Left: Mobile Sidebar Trigger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search phones, IMEIs, orders, customers, SKUs..."
            value={globalSearch}
            onFocus={() => setIsSearchOpen(true)}
            onClick={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (!isSearchOpen) setIsSearchOpen(true);
            }}
            className="w-full pl-9.5 pr-14 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-hidden font-medium transition-all cursor-text"
          />
          {globalSearch ? (
            <button
              onClick={() => {
                setGlobalSearch('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                searchInputRef.current?.focus();
              }}
              className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-200 px-1.5 py-0.5 rounded-md font-bold cursor-pointer transition-colors"
            >
              Ctrl K
            </button>
          )}

          {/* Interactive Global Search Popover */}
          <GlobalSearchDropdown
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            searchQuery={globalSearch}
            onSearchChange={(query) => {
              setGlobalSearch(query);
              searchInputRef.current?.focus();
            }}
            inputRef={searchInputRef}
          />
        </div>
      </div>

      {/* Right Controls: Branch Switcher + Active Staff Role Switcher + Alerts Bell */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Context Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[140px]">{activeBranch.name.split(' ')[0]} Store</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBranchDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Select Active Branch Context
              </span>
              <div className="space-y-1 mt-1">
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setActiveBranchId(branch.id);
                      setShowBranchDropdown(false);
                      toast.success(`Active Store: ${branch.name}`, {
                        description: `Store inventory, POS register stock & order ledger updated for ${branch.code}.`
                      });
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      branch.id === activeBranchId ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{branch.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{branch.code} • {branch.type}</div>
                    </div>
                    {branch.id === activeBranchId && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Staff Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">{currentUser.name}</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              {currentUser.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Switch Staff Session (RBAC Demo)
              </span>
              <div className="space-y-1 mt-1">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      switchCurrentUser(emp.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      emp.id === currentUser.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.role} • {emp.branchName.split(' ')[0]}</div>
                    </div>
                    {emp.id === currentUser.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Smart Alerts & Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Activity Notifications & Smart Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {totalBadges > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-500 rounded-full border-2 border-white">
                {totalBadges}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-800">Operational Alerts & Feed</span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 p-1">
                {/* Smart Alerts */}
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setActiveView(alert.targetView);
                      setShowNotifs(false);
                    }}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">{alert.actionLabel} →</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{alert.title}</div>
                    <div className="text-[11px] text-slate-500">{alert.message}</div>
                  </div>
                ))}

                {/* Notifications */}
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{notif.title}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{notif.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(notif.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
