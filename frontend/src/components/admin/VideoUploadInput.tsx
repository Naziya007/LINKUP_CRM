'use client';

import React, { useState } from 'react';
import { uploadImage } from '@/lib/adminApi';
import { HiOutlineVideoCamera, HiOutlineTrash, HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';

interface VideoUploadInputProps {
  label: string;
  value: { url: string; publicId: string };
  onChange: (video: { url: string; publicId: string }) => void;
  folder?: string;
}

export default function VideoUploadInput({ label, value, onChange, folder = 'linkup_project_videos' }: VideoUploadInputProps) {
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
      setError(err.message || 'Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange({ url: '', publicId: '' });
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
        <HiOutlineVideoCamera className="w-4 h-4 text-cyan-600" />
        <span>{label}</span>
      </label>

      {value?.url ? (
        <div className="relative group rounded-2xl border-2 border-slate-200 bg-slate-900 p-3 space-y-3 shadow-sm">
          {/* Video Preview Player */}
          <div className="w-full h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 relative">
            <video
              src={value.url}
              autoPlay
              muted
              loop
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono font-bold text-cyan-300 truncate">{value.url}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {value.publicId || 'N/A'}</p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5 font-extrabold text-xs cursor-pointer shadow-sm flex-shrink-0"
              title="Remove Video"
            >
              <HiOutlineX className="w-4 h-4 stroke-[2.5]" />
              <span>Remove Video</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-5 text-center bg-slate-50 hover:bg-cyan-50/50 transition-colors shadow-sm">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 border border-cyan-200">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineCloudUpload className="w-6 h-6" />
              )}
            </div>
            <div className="text-sm text-slate-800 font-extrabold">
              {uploading ? 'Uploading Video to Cloudinary...' : 'Click or drag video file to upload'}
            </div>
            <p className="text-xs text-slate-500 font-bold">MP4, WEBM, MOV, AVI up to 50MB</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-bold mt-1">{error}</p>}
    </div>
  );
}
