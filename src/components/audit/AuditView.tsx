'use client';

import React, { useState, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { AuditLogEntry } from '@/types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  User, 
  FileText, 
  Sparkles,
  Smartphone,
  DollarSign,
  Package,
  History,
  RotateCcw,
  Truck,
  Building2,
  Tag
} from 'lucide-react';

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PRODUCT_CREATE: Package,
  PRODUCT_UPDATE: Package,
  PRODUCT_DELETE: Package,
  PRICE_CHANGE: DollarSign,
  STOCK_ADJUST: Package,
  ORDER_CREATE: FileText,
  PAYMENT_RECEIVED: DollarSign,
  REFUND_PROCESSED: RotateCcw,
  EXCHANGE_PROCESSED: RotateCcw,
  DISCOUNT_MODIFY: Tag,
  PO_CREATED: Truck,
  PO_RECEIVED: Truck,
  TRANSFER_REQUEST: Building2,
  TRANSFER_APPROVED: Building2,
  TRANSFER_RECEIVED: Building2,
  IMEI_STATUS_CHANGE: Smartphone,
  WARRANTY_CLAIMED: ShieldCheck,
  REPAIR_UPDATED: History,
  ROLE_CHANGED: User,
  USER_LOGIN: User,
};

export const AuditView: React.FC = () => {
  const { auditLogs } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAction = selectedAction === 'all' || log.action === selectedAction;
      const matchEntity = selectedEntity === 'all' || log.entityType === selectedEntity;

      return matchSearch && matchAction && matchEntity;
    });
  }, [auditLogs, searchQuery, selectedAction, selectedEntity]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">System Activity & Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Immutable chronological ledger of price changes, stock adjustments, IMEI state changes, and staff actions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Audit Logging: Active (Compliance Ready)
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activity by user, action, entity, price diffs, or IMEI..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Actions</option>
            <option value="PRICE_CHANGE">Price Changes</option>
            <option value="ORDER_CREATE">Sales / Orders</option>
            <option value="REFUND_PROCESSED">Refunds</option>
            <option value="EXCHANGE_PROCESSED">Exchanges</option>
            <option value="STOCK_ADJUST">Stock Adjustments</option>
            <option value="PO_RECEIVED">PO Goods Received</option>
            <option value="TRANSFER_APPROVED">Stock Transfers</option>
            <option value="IMEI_STATUS_CHANGE">IMEI Status Changes</option>
            <option value="ROLE_CHANGED">Staff Role Switches</option>
          </select>

          <select
            value={selectedEntity}
            onChange={e => setSelectedEntity(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Entities</option>
            <option value="PRODUCT">Products</option>
            <option value="DEVICE">Devices (IMEI)</option>
            <option value="ORDER">Orders</option>
            <option value="PURCHASE_ORDER">Purchase Orders</option>
            <option value="TRANSFER">Transfers</option>
            <option value="EMPLOYEE">Employees</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">User & Role</th>
                <th className="px-4 py-3.5">Action & Entity</th>
                <th className="px-4 py-3.5">Change Description</th>
                <th className="px-4 py-3.5">Previous → New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No activity logs recorded matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const Icon = ACTION_ICONS[log.action] || FileText;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.userName}
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mt-0.5 inline-block">
                          {log.userRole}
                        </span>
                      </td>

                      {/* Action & Entity */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-slate-100 text-slate-700">
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">
                          {log.entityType}: {log.entityName}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-slate-700 font-medium">{log.description}</p>
                      </td>

                      {/* Value Diff */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {log.previousValue || log.newValue ? (
                          <div className="flex items-center gap-2 text-xs font-mono">
                            {log.previousValue && (
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through">
                                {log.previousValue}
                              </span>
                            )}
                            {log.previousValue && log.newValue && (
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            )}
                            {log.newValue && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                {log.newValue}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
