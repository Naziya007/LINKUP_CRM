'use client';

import React, { useCallback, useEffect, useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminFetch } from '@/lib/adminApi';
import FaqFormModal, { FaqFormValues } from '@/components/admin/FaqFormModal';
import { PageFaqSlug, getPageFaqLabel, resolvePageFaqSlug } from '@/lib/pageFaqs';
import {
  HiChevronDown,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineQuestionMarkCircle,
  HiOutlineTrash
} from 'react-icons/hi';

export interface PageFaqItem {
  _id?: string;
  companyId: string;
  pageSlug: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface FaqSectionProps {
  /** Override the route based page key. Defaults to the current route. */
  pageSlug?: PageFaqSlug;
  /** Section heading. Defaults to "Frequently Asked Questions". */
  heading?: string;
  /** Extra classes for spacing overrides, e.g. "mt-0". */
  className?: string;
}

/**
 * Page level "F & Q" block rendered at the bottom of every page.
 *
 * Loads the F & Q records that belong to the current page from the API and
 * allows adding, editing, hiding and deleting them in place — one shared
 * component serves every page, so no page duplicates this code.
 */
export default function FaqSection({
  pageSlug,
  heading = 'Frequently Asked Questions',
  className = ''
}: FaqSectionProps) {
  const pathname = usePathname();
  const headingId = useId();
  const baseId = useId();
  const { selectedCompany } = useAdminAuth();

  const slug = pageSlug ?? resolvePageFaqSlug(pathname ?? '');
  const pageLabel = getPageFaqLabel(slug);
  const companyId = selectedCompany?._id;

  const [faqs, setFaqs] = useState<PageFaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PageFaqItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    if (!companyId) {
      setFaqs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/faqs?companyId=${companyId}&pageSlug=${encodeURIComponent(slug)}&includeHidden=true`
      );
      const items: PageFaqItem[] = res.success && Array.isArray(res.data) ? res.data : [];
      // Keep only this page's own F & Q, so an entry created on one page can
      // never show up on any other page.
      setFaqs(items.filter((item) => item.pageSlug === slug));
    } catch (err: any) {
      setFaqs([]);
      setError(err?.message || 'Could not load the F & Q for this page.');
    } finally {
      setLoading(false);
    }
  }, [companyId, slug]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpenModal = (item?: PageFaqItem) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (values: FaqFormValues) => {
    if (!companyId) return;
    setSaving(true);
    try {
      const payload = { ...values, companyId, pageSlug: slug };
      if (editingItem?._id) {
        await adminFetch(`/faqs/${editingItem._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/faqs', { method: 'POST', body: JSON.stringify(payload) });
      }
      handleCloseModal();
      await fetchFaqs();
    } catch (err: any) {
      alert(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this F & Q?')) return;
    setBusyId(id);
    try {
      await adminFetch(`/faqs/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    } finally {
      setBusyId(null);
      await fetchFaqs();
    }
  };

  const handleToggleVisibility = async (item: PageFaqItem) => {
    if (!item._id) return;
    setBusyId(item._id);
    try {
      await adminFetch(`/faqs/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isVisible: !item.isVisible })
      });
      await fetchFaqs();
    } catch (err: any) {
      alert(err?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const toggleOpen = (index: number) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section
      aria-labelledby={headingId}
      className={`mt-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 ${className}`}
    >
      {/* Heading + add action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b-2 border-slate-200">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="flex items-center gap-2.5 text-base sm:text-xl font-black text-slate-900 tracking-tight"
          >
            <HiOutlineQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 shrink-0" />
            <span>{heading}</span>
          </h2>
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
            {pageLabel} · {loading ? '...' : `${faqs.length} ${faqs.length === 1 ? 'question' : 'questions'}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          disabled={!companyId}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add F & Q</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-bold mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-slate-500 text-sm sm:text-base font-medium">Loading F & Q...</div>
      ) : faqs.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-sm sm:text-base font-medium border border-dashed border-slate-300 rounded-2xl">
          No F & Q added for this page yet. Click &quot;Add F & Q&quot; to create one.
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const isBusy = busyId === faq._id;

            return (
              <li
                key={faq._id ?? `${faq.question}-${index}`}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 sm:p-4">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleOpen(index)}
                    className="flex-1 min-w-0 flex items-start sm:items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="flex-1 min-w-0 font-extrabold text-sm sm:text-base text-slate-900 leading-snug break-words">
                      <span className="text-cyan-700">Q:</span> {faq.question}
                    </span>
                    <HiChevronDown
                      aria-hidden="true"
                      className={`w-5 h-5 shrink-0 text-cyan-700 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span
                      className={`text-[11px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                        faq.isVisible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {faq.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(faq)}
                      disabled={isBusy}
                      title={faq.isVisible ? 'Hide from website' : 'Show on website'}
                      className="p-2 rounded-xl bg-white text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {faq.isVisible ? (
                        <HiOutlineEyeOff className="w-5 h-5" />
                      ) : (
                        <HiOutlineEye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(faq)}
                      title="Edit F & Q"
                      className="p-2 rounded-xl bg-white text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq._id)}
                      disabled={isBusy}
                      title="Delete F & Q"
                      className="p-2 rounded-xl bg-white text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={buttonId} className="px-3 sm:px-4 pb-4">
                    <p className="font-medium text-slate-700 text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-cyan-600 break-words">
                      <span className="font-black text-cyan-700">A:</span> {faq.answer}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isModalOpen && (
        <FaqFormModal
          title={editingItem ? 'Edit F & Q' : 'Add New F & Q'}
          pageLabel={pageLabel}
          saving={saving}
          initialValues={{
            question: editingItem?.question ?? '',
            answer: editingItem?.answer ?? '',
            displayOrder: editingItem?.displayOrder ?? faqs.length + 1,
            isVisible: editingItem?.isVisible ?? true
          }}
          onClose={handleCloseModal}
          onSubmit={handleSave}
        />
      )}
    </section>
  );
}