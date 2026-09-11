'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { HiOutlineBuildingOffice2, HiOutlineChevronDown } from 'react-icons/hi2';
import { HiOutlineExternalLink, HiOutlineMenuAlt2 } from 'react-icons/hi';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { companies, selectedCompany, setSelectedCompany } = useAdminAuth();

  return (
    <header className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3 flex-wrap sm:flex-nowrap">
      {/* Left: Hamburger (mobile) + Company Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
          aria-label="Open sidebar"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-600 text-xs font-bold uppercase tracking-wider flex-shrink-0">
          <HiOutlineBuildingOffice2 className="w-4 h-4 text-cyan-600" />
          <span>Active Company:</span>
        </div>

        <div className="relative">
          <select
            value={selectedCompany?._id || companies[0]?._id || ''}
            onChange={(e) => {
              const comp = companies.find((c) => c._id === e.target.value);
              if (comp) setSelectedCompany(comp);
            }}
            className="appearance-none bg-slate-50 border border-slate-300 hover:border-cyan-600 text-cyan-800 font-bold text-xs sm:text-sm rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer shadow-xs max-w-[130px] sm:max-w-xs truncate"
          >
            {companies.map((company) => (
              <option key={company._id} value={company._id} className="bg-white text-slate-900 font-medium text-xs">
                {company.name}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Status badge + View Website */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Connected</span>
        </div>

        {/* Dot-only status on small screens */}
        <div className="flex md:hidden items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {selectedCompany && (
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-cyan-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-xs"
          >
            <span className="hidden sm:inline">View Website</span>
            <HiOutlineExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </header>
  );

}
