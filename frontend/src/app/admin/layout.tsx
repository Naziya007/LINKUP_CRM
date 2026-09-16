'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import FaqSection from '@/components/admin/FaqSection';
import { shouldShowPageFaqs } from '@/lib/pageFaqs';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const showFaqSection = shouldShowPageFaqs(pathname ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center gap-6 p-4 [&_input]:text-slate-900 [&_textarea]:text-slate-900 [&_select]:text-slate-900 [&_option]:text-slate-900 [&_option]:bg-white">
          {children}
          {showFaqSection && (
            <div className="w-full max-w-md">
              <FaqSection className="mt-0" />
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex text-sm leading-normal [&_input]:text-slate-900 [&_textarea]:text-slate-900 [&_select]:text-slate-900 [&_option]:text-slate-900 [&_option]:bg-white">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {children}
              {showFaqSection && <FaqSection />}
            </main>
          </div>
        </div>
      )}
    </AdminAuthProvider>
  );
}
