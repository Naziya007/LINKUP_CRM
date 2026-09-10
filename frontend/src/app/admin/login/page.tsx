'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminFetch } from '@/lib/adminApi';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineArrowRight } from 'react-icons/hi';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@linkup.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token) {
        login(res.token, res.user);
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      // Fallback mock login for offline testing
      if (email === 'admin@linkup.com' && password === 'admin123') {
        login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2tfYWRtaW5faWQiLCJpYXQiOjE1MTYyMzkwMjJ9.mock_signature', {

          id: 'mock_admin_id',
          name: 'Super Admin',
          email: 'admin@linkup.com',
          role: 'admin',
          isSuperAdmin: true,
        });
      } else {
        setError(err.message || 'Invalid credentials or connection error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white shadow-md text-2xl mx-auto mb-3">
          L
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">CMS Admin Portal</h2>
        <p className="text-xs text-slate-500 font-medium">Sign in to manage Linkup Group multi-website content</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <HiOutlineMail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-cyan-600 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-xs"
              placeholder="admin@linkup.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <HiOutlineLockClosed className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-cyan-600 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-xs"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-cyan-700 font-bold font-mono">
          Default Superadmin: admin@linkup.com / admin123
        </p>
      </div>
    </div>
  );
}

