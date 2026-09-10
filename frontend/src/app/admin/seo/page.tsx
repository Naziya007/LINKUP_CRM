'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminFetch } from '@/lib/adminApi';
import SeoFormSection, { SEOFields } from '@/components/admin/SeoFormSection';
import { HiGlobeAlt, HiCheckCircle } from 'react-icons/hi2';

const PAGE_SLUGS = [
  { slug: 'home', title: 'Homepage SEO' },
  { slug: 'about', title: 'About Us Page SEO' },
  { slug: 'services', title: 'Services Overview SEO' },
  { slug: 'projects', title: 'Projects / Portfolio SEO' },
  { slug: 'contact', title: 'Contact Us SEO' },
  { slug: 'blog', title: 'Blog & Insights SEO' },
];

export default function SeoAdminPage() {
  const { selectedCompany } = useAdminAuth();
  const [activePageSlug, setActivePageSlug] = useState('home');
  const [seoData, setSeoData] = useState<SEOFields>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSeoForPage = async () => {
    if (!selectedCompany?._id) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminFetch(`/seo?companyId=${selectedCompany._id}&pageSlug=${activePageSlug}`);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSeoData(res.data[0]);
      } else {
        setSeoData({
          metaTitle: `${selectedCompany.name} | Official Website`,
          metaDescription: `Discover premier services offered by ${selectedCompany.name}.`,
          canonicalUrl: `https://linkupgroup.com/${selectedCompany.slug}/${activePageSlug}`
        });
      }
    } catch {
      setSeoData({
        metaTitle: `${selectedCompany.name} | Official Website`,
        metaDescription: `Discover premier services offered by ${selectedCompany.name}.`,
        canonicalUrl: `https://linkupgroup.com/${selectedCompany.slug}/${activePageSlug}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoForPage();
  }, [selectedCompany, activePageSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await adminFetch('/seo', {
        method: 'POST',
        body: JSON.stringify({
          companyId: selectedCompany?._id,
          pageSlug: activePageSlug,
          ...seoData
        })
      });
      setMessage('SEO configuration updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HiGlobeAlt className="w-7 h-7 text-cyan-600" />
            <span>Company SEO & Meta Tag Management</span>
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Configure OpenGraph, Twitter Cards, Meta Titles & Description for <span className="text-cyan-700 font-bold text-lg">{selectedCompany?.name}</span>
          </p>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 overflow-x-auto pb-3">
        {PAGE_SLUGS.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActivePageSlug(p.slug)}
            className={`px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all cursor-pointer ${
              activePageSlug === p.slug
                ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 font-extrabold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white border-2 border-transparent font-bold'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 text-sm font-extrabold flex items-center gap-2.5 shadow-sm">
          <HiCheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* SEO Form */}
      <form onSubmit={handleSave} className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-3">
          Meta Settings for &quot;{PAGE_SLUGS.find(p => p.slug === activePageSlug)?.title}&quot;
        </h3>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-lg font-medium">Loading SEO settings...</div>
        ) : (
          <SeoFormSection
            seo={seoData}
            onChange={(newSeo) => setSeoData(newSeo)}
            defaultExpanded={true}
          />
        )}

        <div className="flex justify-end pt-4 border-t-2 border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            {saving ? 'Updating SEO...' : 'Save SEO Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
