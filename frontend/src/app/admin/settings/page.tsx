'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { HiOutlineCog, HiCheckCircle } from 'react-icons/hi';

export default function SettingsAdminPage() {
  const [formData, setFormData] = useState({
    siteTitle: 'Linkup Group Central CMS',
    contactEmail: 'admin@linkupgroup.com',
    supportPhone: '+91 9876543210',
    maintenanceMode: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminFetch('/settings');
        if (res.success && res.data) {
          setFormData(res.data);
        }
      } catch {
        // Default values
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMessage('Global CMS settings updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HiOutlineCog className="w-7 h-7 text-cyan-600" />
            <span>Global Settings</span>
          </h1>
          <p className="text-base text-slate-600 mt-1">System-wide CMS configuration and contact information</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 text-sm font-extrabold flex items-center gap-2.5 shadow-sm">
          <HiCheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-base font-bold text-slate-800 mb-2">CMS Platform Title</label>
          <input
            type="text"
            value={formData.siteTitle}
            onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-bold text-slate-800 mb-2">Central Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-800 mb-2">Support Phone</label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="mMode"
            checked={formData.maintenanceMode}
            onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
            className="w-6 h-6 rounded bg-slate-50 border-2 border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="mMode" className="text-base font-extrabold text-slate-800 cursor-pointer">
            Enable CMS Maintenance Mode
          </label>
        </div>

        <div className="pt-5 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
