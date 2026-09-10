'use client';

import React, { useState } from 'react';
import { uploadImage } from '@/lib/adminApi';
import { HiOutlineCloudUpload, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

interface ImageUploadInputProps {
  label: string;
  value: { url: string; publicId: string };
  onChange: (image: { url: string; publicId: string }) => void;
  folder?: string;
}

export default function ImageUploadInput({ label, value, onChange, folder = 'linkup_cms' }: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const res = await uploadImage(file, folder);
      onChange({ url: res.url, publicId: res.publicId });
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange({ url: '', publicId: '' });
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      {value?.url ? (
        <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3 shadow-xs">
          {/* Image Preview */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-slate-200 flex-shrink-0 shadow-xs">
            <img src={value.url} alt="Uploaded preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{value.url}</p>
            <p className="text-[11px] text-cyan-700 font-mono mt-0.5 font-semibold">ID: {value.publicId || 'N/A'}</p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all flex items-center gap-1 font-bold text-xs cursor-pointer shadow-xs"
            title="Remove Image"
          >
            <HiOutlineX className="w-4 h-4 stroke-[2.5]" />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <div className="relative border border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-5 text-center bg-white transition-colors shadow-xs">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineCloudUpload className="w-5 h-5" />
              )}
            </div>
            <div className="text-xs text-slate-700 font-bold">
              {uploading ? 'Uploading to Cloudinary...' : 'Click or drag image to upload'}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">PNG, JPG, WEBP up to 10MB</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
    </div>
  );

}
