'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminApi';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText
} from 'react-icons/hi';

interface BlogItem {
  _id?: string;
  companyId: string | { _id: string; name: string; code: string };
  id?: string;
  title: string;
  slug: string;
  category: string;
  featuredImage?: { url: string; publicId: string };
  image?: string;
  imageUrl?: string;
  shortDescription?: string;
  excerpt?: string;
  content: string | string[];
  author: string;
  authorRole?: string;
  readTime?: string;
  highlights?: string[];
  tags?: string[];
  publishDate?: string;
  date?: string;
  status: 'Draft' | 'Publish' | 'Hide';
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch(`/blogs/${encodeURIComponent(slug)}`);
        if (res.success && res.data) {
          setBlog(res.data);
        } else {
          setError('Blog article not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const renderBlogContent = (content: string | string[]) => {
    let rawItems: string[] = [];
    if (Array.isArray(content)) {
      rawItems = content;
    } else if (typeof content === 'string') {
      rawItems = content.split(/\n\n+/);
    }

    if (!rawItems || rawItems.length === 0) {
      return <div className="text-slate-500 italic py-4">No content provided for this blog article.</div>;
    }

    // Group rawItems into structured blocks (Headings, Lists, Images, Paragraphs)
    const blocks: { type: 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'p'; items: string[] }[] = [];

    rawItems.forEach((item) => {
      const trimmed = item.trim();
      if (!trimmed) return;

      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        blocks.push({ type: 'image', items: [imgMatch[2], imgMatch[1] || 'Article image'] });
      } else if (trimmed.startsWith('<img')) {
        const srcMatch = trimmed.match(/src=["'](.*?)["']/);
        const altMatch = trimmed.match(/alt=["'](.*?)["']/);
        if (srcMatch && srcMatch[1]) {
          blocks.push({ type: 'image', items: [srcMatch[1], altMatch ? altMatch[1] : 'Article image'] });
        }
      } else if (trimmed.startsWith('### ')) {
        blocks.push({ type: 'h3', items: [trimmed.replace(/^###\s+/, '')] });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ type: 'h2', items: [trimmed.replace(/^##\s+/, '')] });
      } else if (trimmed.startsWith('# ')) {
        blocks.push({ type: 'h1', items: [trimmed.replace(/^#\s+/, '')] });
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const bulletLines = trimmed.split('\n').map(l => l.replace(/^[\*\-]\s+/, '').trim()).filter(Boolean);
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === 'list') {
          lastBlock.items.push(...bulletLines);
        } else {
          blocks.push({ type: 'list', items: bulletLines });
        }
      } else {
        blocks.push({ type: 'p', items: [trimmed] });
      }
    });

    return (
      <div className="space-y-6 text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
        {blocks.map((block, idx) => {
          if (block.type === 'h1') {
            return (
              <h1 key={idx} className="text-3xl sm:text-4xl font-black text-slate-950 mt-10 mb-4 tracking-tight">
                {block.items[0]}
              </h1>
            );
          }
          if (block.type === 'h2') {
            return (
              <h2 key={idx} className="text-2xl sm:text-3xl font-black text-cyan-950 border-b-2 border-cyan-100 pb-3 mt-10 mb-4 tracking-tight">
                {block.items[0]}
              </h2>
            );
          }
          if (block.type === 'h3') {
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-8 mb-3">
                {block.items[0]}
              </h3>
            );
          }
          if (block.type === 'image') {
            return (
              <figure key={idx} className="my-8 space-y-2">
                <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950">
                  <img src={block.items[0]} alt={block.items[1]} className="w-full h-auto object-cover max-h-[600px]" />
                </div>
                {block.items[1] && block.items[1] !== 'Article image' && (
                  <figcaption className="text-center text-xs font-bold text-slate-500 italic">
                    📷 {block.items[1]}
                  </figcaption>
                )}
              </figure>
            );
          }
          if (block.type === 'list') {
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 my-6 shadow-sm">
                <ul className="space-y-3 pl-2">
                  {block.items.map((bullet, i) => {
                    const formattedBullet = bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>');
                    return (
                      <li key={i} className="flex items-start gap-3 text-slate-800 font-medium">
                        <span className="w-2 h-2 rounded-full bg-cyan-600 mt-2.5 flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: formattedBullet }} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }
          const formatted = block.items[0].replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>');
          return <p key={idx} className="leading-relaxed text-slate-800 font-normal" dangerouslySetInnerHTML={{ __html: formatted }} />;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-bold text-sm">Loading full article content...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <HiOutlineDocumentText className="w-16 h-16 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Article Not Found</h2>
          <p className="text-slate-600 text-sm">{error || 'The requested blog post could not be retrieved.'}</p>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-900 hover:bg-cyan-950 text-white font-extrabold text-sm transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span>Back to Blogs Overview</span>
          </Link>
        </div>
      </div>
    );
  }

  const imgUrl = blog.featuredImage?.url || blog.image || blog.imageUrl;
  const companyName = typeof blog.companyId === 'object' ? blog.companyId.name : '';

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Controls Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span>Back to Blogs</span>
          </Link>

          <div className="flex items-center gap-3">
            {companyName && (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
                🏢 {companyName}
              </span>
            )}
            <span
              className={`text-xs font-black px-3.5 py-1.5 rounded-full border uppercase tracking-wider ${
                blog.status === 'Publish'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : blog.status === 'Draft'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {blog.status}
            </span>
          </div>
        </div>

        {/* Main Article Container */}
        <article className="bg-white border-2 border-slate-200/80 rounded-3xl overflow-hidden shadow-xl">
          {/* Header Banner */}
          {imgUrl && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-b border-slate-200 overflow-hidden">
              <img
                src={imgUrl}
                alt={blog.title}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-8">
            {/* Category & Title */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-900 border border-cyan-200">
                  {blog.category}
                </span>
                {blog.readTime && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    <HiOutlineClock className="w-4 h-4 text-cyan-700" />
                    {blog.readTime}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-tight tracking-tight">
                {blog.title}
              </h1>

              {/* Author & Publishing Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-900 text-white flex items-center justify-center font-black text-xs">
                    {blog.author?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <span className="text-slate-900 font-extrabold">{blog.author}</span>
                    {blog.authorRole && <span className="text-xs text-slate-500 block font-medium">{blog.authorRole}</span>}
                  </div>
                </div>

                <span className="text-slate-300">•</span>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <HiOutlineCalendar className="w-5 h-5 text-cyan-700" />
                  <span>Published: {blog.publishDate || blog.date}</span>
                </div>
              </div>
            </div>

            {/* Excerpt / Summary Box */}
            {(blog.shortDescription || blog.excerpt) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-cyan-50/70 border-2 border-cyan-200/80 text-cyan-950">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-800 block mb-1">Executive Summary</span>
                <p className="text-base sm:text-lg font-bold leading-relaxed italic">
                  "{blog.shortDescription || blog.excerpt}"
                </p>
              </div>
            )}

            {/* Key Highlights */}
            {blog.highlights && blog.highlights.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-cyan-950 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg">
                <h3 className="text-lg font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <HiOutlineCheckCircle className="w-6 h-6 text-cyan-400" />
                  <span>Key Article Highlights</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blog.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 text-sm font-bold">
                      <span className="text-cyan-400 font-black text-base leading-none">✓</span>
                      <span className="leading-snug">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complete Full Article Body */}
            <div className="pt-2">
              {renderBlogContent(blog.content)}
            </div>

            {/* Tags Footer */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <HiOutlineTag className="w-4 h-4 text-cyan-700" />
                  <span>Article Tags</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Bottom Back Button */}
        <div className="flex justify-center pt-4">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-900 hover:bg-cyan-950 text-white font-black text-base shadow-lg hover:shadow-xl transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
            <span>Return to Blogs Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
