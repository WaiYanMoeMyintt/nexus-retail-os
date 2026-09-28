'use client';

import React, { useState } from 'react';
import { usePOS, ROLE_PERMISSIONS_MAP } from '@/context/POSContext';
import { Employee, EmployeeRole } from '@/types';
import { 
  Users, 
  Shield, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Percent, 
  Building2, 
  Key, 
  UserCheck, 
  Sparkles,
  Award,
  TrendingUp,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export const EmployeesView: React.FC = () => {
  const { 
    employees, 
    currentUser, 
    branches, 
    switchCurrentUser, 
    permissions 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'directory' | 'rbac'>('directory');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesAchieved = employees.reduce((sum, e) => sum + e.salesAchieved, 0);
  const totalSalesTargets = employees.reduce((sum, e) => sum + e.salesTarget, 0);
  const averageTargetAttainment = totalSalesTargets > 0 ? (totalSalesAchieved / totalSalesTargets) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Employees & Role-Based Access Control (RBAC)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Staff management, monthly sales targets & commission calculations, and permission boundary matrix.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium pl-1">Active Staff Session:</span>
          <strong className="text-slate-900 px-2 py-0.5 rounded-lg bg-white shadow-2xs">
            {currentUser.name} ({currentUser.role})
          </strong>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Team</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{employees.length} <span className="text-xs font-normal text-slate-500">members</span></div>
          <div className="text-xs text-slate-500 mt-1">Across {branches.length} branches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Team Sales Volume</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ${totalSalesAchieved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total revenue generated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Target Attainment</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{averageTargetAttainment.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Overall quota progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">RBAC Roles</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">7 <span className="text-xs font-normal text-slate-500">tiers</span></div>
          <div className="text-xs text-slate-500 mt-1">Granular capability checks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Directory ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            RBAC Permission Capabilities Matrix
          </button>
        </div>

        {activeTab === 'directory' && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search staff, role, branch..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const isSelf = emp.id === currentUser.id;
            const progress = emp.salesTarget > 0 ? Math.min(100, (emp.salesAchieved / emp.salesTarget) * 100) : 100;
            const commissionEarned = (emp.salesAchieved * emp.commissionRate) / 100;

            return (
              <div key={emp.id} className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isSelf ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
              }`}>
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700 overflow-hidden border border-slate-200">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                          {isSelf && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 mt-1 inline-block">
                          {emp.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{emp.branchName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>PIN Code: •••• ({emp.pinCode})</span>
                    </div>
                  </div>

                  {emp.salesTarget > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Sales Quota Target:</span>
                        <span className="font-bold text-slate-900">${emp.salesTarget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Achieved:</span>
                        <span className="font-bold text-emerald-600">${emp.salesAchieved.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <span>Commission ({emp.commissionRate}%):</span>
                        <span className="font-bold text-teal-700">${commissionEarned.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">ID: {emp.id}</span>
                  {!isSelf ? (
                    <button
                      onClick={() => switchCurrentUser(emp.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Impersonate / Switch Role
                    </button>
                  ) : (
                    <span className="text-xs text-teal-600 font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Current Session
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RBAC Capabilities Matrix Tab */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm">Role-Based Permission Boundary Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Defines what each retail staff role is authorized to perform in the system.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Permission Capability</th>
                  <th className="px-3 py-3 text-center">OWNER</th>
                  <th className="px-3 py-3 text-center">ADMIN</th>
                  <th className="px-3 py-3 text-center">MANAGER</th>
                  <th className="px-3 py-3 text-center">CASHIER</th>
                  <th className="px-3 py-3 text-center">SALESPERSON</th>
                  <th className="px-3 py-3 text-center">INVENTORY</th>
                  <th className="px-3 py-3 text-center">ACCOUNTANT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: 'canAccessPOS', label: 'Access POS Register & Create Sales' },
                  { key: 'canEditProductCost', label: 'Edit Product Cost / Supplier Purchase Price' },
                  { key: 'canDeleteProduct', label: 'Delete Products from Catalog' },
                  { key: 'canApproveRefund', label: 'Approve & Issue Refunds / Returns' },
                  { key: 'canManagePurchases', label: 'Create POs & Receive Supplier Goods' },
                  { key: 'canApproveTransfers', label: 'Approve Inter-Branch Stock Transfers' },
                  { key: 'canViewReports', label: 'View Business Intelligence & Profit Reports' },
                  { key: 'canManageEmployees', label: 'Manage Employees & Access Controls' },
                  { key: 'canModifyDiscounts', label: 'Create & Modify Promotion Rules' },
                  { key: 'canManageSettings', label: 'Modify Store Legal & System Settings' },
                  { key: 'canViewCostBasis', label: 'View COGS & Margin Basis in Inventory' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {row.label}
                    </td>
                    {(['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'SALESPERSON', 'INVENTORY_STAFF', 'ACCOUNTANT'] as EmployeeRole[]).map(role => {
                      const permMap = ROLE_PERMISSIONS_MAP[role];
                      const isAllowed = permMap[row.key as keyof typeof permMap];

                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          {isAllowed ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
