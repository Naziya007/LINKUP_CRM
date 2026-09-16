'use client';

import React, { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

export interface FaqFormValues {
  question: string;
  answer: string;
  displayOrder: number;
  isVisible: boolean;
}

interface FaqFormModalProps {
  /** Modal heading, e.g. "Add New F & Q" or "Edit F & Q". */
  title: string;
  /** Page the F & Q belongs to, shown as a subtitle. */
  pageLabel: string;
  initialValues: FaqFormValues;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: FaqFormValues) => void;
}

/**
 * Shared add / edit form for a page level F & Q entry.
 * Used by <FaqSection /> so the form is not duplicated on every page.
 */
export default function FaqFormModal({
  title,
  pageLabel,
  initialValues,
  saving = false,
  onClose,
  onSubmit
}: FaqFormModalProps) {
  const [values, setValues] = useState<FaqFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      question: values.question.trim(),
      answer: values.answer.trim(),
      displayOrder: Number.isFinite(values.displayOrder) ? values.displayOrder : 0,
      isVisible: values.isVisible
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto pt-6 pb-12"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-slate-300 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl my-auto max-h-[88vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3 bg-white sticky top-0 z-30 shadow-sm">
          <div className="min-w-0">
            <h3 className="font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight truncate">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5 truncate">{pageLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close Form"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <HiOutlineX className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Question *</label>
            <input
              type="text"
              required
              value={values.question}
              onChange={(e) => setValues({ ...values, question: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Answer *</label>
            <textarea
              rows={4}
              required
              value={values.answer}
              onChange={(e) => setValues({ ...values, answer: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Display Order</label>
              <input
                type="number"
                value={values.displayOrder}
                onChange={(e) => setValues({ ...values, displayOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 pb-2 sm:pb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.isVisible}
                  onChange={(e) => setValues({ ...values, isVisible: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-50 border-2 border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-sm sm:text-base font-extrabold text-slate-800">Visible on Website</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-bold rounded-xl border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm sm:text-base rounded-xl cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save F & Q'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}