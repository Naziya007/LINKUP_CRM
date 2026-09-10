'use client';

import React, { useState } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronUp, HiGlobeAlt } from 'react-icons/hi2';

export interface SEOFields {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

interface SeoFormSectionProps {
  seo: SEOFields;
  onChange: (seo: SEOFields) => void;
  defaultExpanded?: boolean;
}

export default function SeoFormSection({ seo, onChange, defaultExpanded = false }: SeoFormSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const updateField = (key: keyof SEOFields, value: string) => {
    onChange({ ...seo, [key]: value });
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden mt-4 shadow-xs">

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <HiGlobeAlt className="w-5 h-5 text-cyan-600" />
          <span className="font-bold text-sm text-slate-900">SEO & Social Meta Tags</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Optional</span>
        </div>
        {expanded ? <HiOutlineChevronUp className="w-4 h-4 text-slate-500" /> : <HiOutlineChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={seo.metaTitle || ''}
                onChange={(e) => updateField('metaTitle', e.target.value)}
                placeholder="Page Title | Linkup Group"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Canonical URL</label>
              <input
                type="text"
                value={seo.canonicalUrl || ''}
                onChange={(e) => updateField('canonicalUrl', e.target.value)}
                placeholder="https://linkupgroup.com/page"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={seo.metaDescription || ''}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              placeholder="Brief description for search engines..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
            <input
              type="text"
              value={seo.metaKeywords || ''}
              onChange={(e) => updateField('metaKeywords', e.target.value)}
              placeholder="comma, separated, keywords"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-cyan-700 mb-2 uppercase tracking-wider">Open Graph (Facebook / LinkedIn)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OG Title</label>
                <input
                  type="text"
                  value={seo.ogTitle || ''}
                  onChange={(e) => updateField('ogTitle', e.target.value)}
                  placeholder="Open Graph Title"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OG Image URL</label>
                <input
                  type="text"
                  value={seo.ogImage || ''}
                  onChange={(e) => updateField('ogImage', e.target.value)}
                  placeholder="https://.../og-image.jpg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-cyan-700 mb-2 uppercase tracking-wider">Twitter / X Card</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X Title</label>
                <input
                  type="text"
                  value={seo.twitterTitle || ''}
                  onChange={(e) => updateField('twitterTitle', e.target.value)}
                  placeholder="Twitter Card Title"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X Image URL</label>
                <input
                  type="text"
                  value={seo.twitterImage || ''}
                  onChange={(e) => updateField('twitterImage', e.target.value)}
                  placeholder="https://.../twitter-image.jpg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


