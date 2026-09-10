'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 [&_input]:text-slate-900 [&_textarea]:text-slate-900 [&_select]:text-slate-900 [&_option]:text-slate-900 [&_option]:bg-white">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex text-sm leading-normal [&_input]:text-slate-900 [&_textarea]:text-slate-900 [&_select]:text-slate-900 [&_option]:text-slate-900 [&_option]:bg-white">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </AdminAuthProvider>
  );
}
