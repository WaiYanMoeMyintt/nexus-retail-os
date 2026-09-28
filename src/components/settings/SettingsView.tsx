'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { StoreSettings } from '@/types';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Store, 
  Printer, 
  Volume2, 
  FileText, 
  ShieldAlert,
  Percent,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetDemoData, 
    exportDataJSON, 
    importDataJSON 
  } = usePOS();

  const [formData, setFormData] = useState<StoreSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const handleChange = (field: keyof StoreSettings, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleDownloadBackup = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexustech_pos_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Complete system backup downloaded');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Store Configuration & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage store profile, tax rules, receipt templates, and system backup archives.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Profile & Identity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Store Profile & Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={formData.storeTagline}
                onChange={(e) => handleChange('storeTagline', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.storeEmail}
                onChange={(e) => handleChange('storeEmail', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => handleChange('storePhone', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Store Street Address</label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => handleChange('storeAddress', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City, State & Postal</label>
              <input
                type="text"
                value={formData.storeCity}
                onChange={(e) => handleChange('storeCity', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Taxation & POS Policies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">Tax Rates & Terminal Hardware</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Default Sales Tax Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tax ID / EIN</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Thermal Receipt Width</label>
              <select
                value={formData.thermalPrinterWidth}
                onChange={(e) => handleChange('thermalPrinterWidth', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="80mm">80mm (Standard POS)</option>
                <option value="58mm">58mm (Compact Mobile)</option>
              </select>
            </div>
          </div>

          {/* Sound & Alert Toggles */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Register Audio & Beep Effects</span>
                <span className="text-[11px] text-slate-500">Play audio tones on barcode scan, error alerts, and successful checkout</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleChange('enableSoundEffects', !formData.enableSoundEffects)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                formData.enableSoundEffects ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                formData.enableSoundEffects ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Section 3: Receipt Customization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-slate-900 text-sm">Receipt Header & Return Policy Disclaimer</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Receipt Header Greeting</label>
              <input
                type="text"
                value={formData.receiptHeader}
                onChange={(e) => handleChange('receiptHeader', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Receipt Footer Warranty Disclaimer</label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 4: Data Management & Backup */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h2 className="font-bold text-slate-900 text-sm">Data Persistence & Backup Archives</h2>
        </div>

        <p className="text-xs text-slate-500">
          Export an offline JSON snapshot of your products, orders, stock movements, and customer accounts, or restore from a previous backup.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all mock data to factory state?')) {
                resetDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Mock Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
