'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminApi';
import {
  HiOutlineArrowLeft,
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

interface ServiceFAQ {
  question: string;
  answer: string;
}

interface LocationServiceDetail {
  _id?: string;
  parentServiceId?: string | { _id: string; serviceName: string; title?: string; slug: string };
  companyId?: string | { _id: string; name: string; code: string; slug?: string };
  location: string;
  isLocationService?: boolean;
  serviceName: string;
  title?: string;
  slug: string;
  heading?: string;
  text?: string;
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  deliverables?: string[];
  faqs?: ServiceFAQ[];
  image?: { url: string; publicId: string };
  imageUrl?: string;
  imageAlt?: string;
  featured?: boolean;
  isVisible?: boolean;
  displayOrder?: number;
  status?: 'Publish' | 'Draft' | 'Hide';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
  };
}

export default function LocationServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { slug, locationSlug } = unwrappedParams;

  const [service, setService] = useState<LocationServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationSlug) return;

    const fetchLocationService = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch(`/services/${encodeURIComponent(locationSlug)}`);
        if (res.success && res.data) {
          setService(res.data);
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: derive location from slug & parent service
      const detectedCity = ['noida', 'gurgaon', 'delhi', 'faridabad', 'ghaziabad'].find(c =>
        locationSlug.toLowerCase().includes(c)
      ) || 'Noida';
      const cityFormatted = detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1);
      const parentName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const title = `${parentName} in ${cityFormatted}`;

      setService({
        _id: `${slug}_${detectedCity}`,
        parentServiceId: { _id: slug, serviceName: parentName, title: parentName, slug: slug },
        companyId: { _id: 'comp-1', name: 'Linkup Group', code: 'CMS' },
        location: cityFormatted,
        isLocationService: true,
        serviceName: title,
        title: title,
        slug: locationSlug,
        heading: `Premier ${parentName} in ${cityFormatted}`,
        shortDescription: `Tailored ${parentName} solutions specifically optimized for businesses in ${cityFormatted} and Delhi NCR.`,
        fullDescription: `Comprehensive ${parentName} delivered by our specialist team in ${cityFormatted}. We combine in-depth regional insight with industry-leading expertise to drive measurable growth for our ${cityFormatted} clients.`,
        deliverables: [
          `Targeted ${cityFormatted} market analysis & strategy`,
          'Full-scale execution & technical deployment',
          'Dedicated regional support and continuous optimization'
        ],
        faqs: [
          {
            question: `Do you provide in-person meetings for clients in ${cityFormatted}?`,
            answer: `Yes, our strategy and execution team is available for on-site meetings throughout ${cityFormatted} and Delhi NCR.`
          },
          {
            question: `What is the delivery timeline for ${cityFormatted} projects?`,
            answer: `Typical project delivery is 2 to 4 weeks depending on the agreed scope and deliverables.`
          }
        ],
        image: { url: '/assets/media/service_website_strategy.jpg', publicId: '' },
        imageUrl: '/assets/media/service_website_strategy.jpg',
        isVisible: true,
        status: 'Publish',
        seo: {
          metaTitle: `${title} | Linkup Group`,
          metaDescription: `Best ${parentName} in ${cityFormatted}. Expert digital services for businesses in ${cityFormatted} and Delhi NCR.`,
          metaKeywords: `${parentName} ${cityFormatted}, ${cityFormatted} ${parentName}, best ${parentName} ${cityFormatted}`
        }
      });
      setLoading(false);
    };

    fetchLocationService();
  }, [locationSlug]);

  const renderServiceContent = (content: string | undefined) => {
    if (!content) {
      return <div className="text-slate-500 italic py-4">No content provided for this location service.</div>;
    }

    const rawItems = content.split(/\n\n+/);
    const blocks: { type: 'h1' | 'h2' | 'h3' | 'list' | 'image' | 'p'; items: string[] }[] = [];

    rawItems.forEach((item) => {
      const trimmed = item.trim();
      if (!trimmed) return;

      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        blocks.push({ type: 'image', items: [imgMatch[2], imgMatch[1] || 'Location image'] });
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

  const getCompanyName = () => {
    if (!service) return 'Linkup Group';
    if (typeof service.companyId === 'object' && service.companyId?.name) {
      return service.companyId.name;
    }
    return 'Linkup Group';
  };

  const getParentServiceTitle = () => {
    if (!service) return 'Main Service';
    if (typeof service.parentServiceId === 'object' && service.parentServiceId) {
      return service.parentServiceId.serviceName || service.parentServiceId.title || 'Main Service';
    }
    return 'Main Service';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-bold text-sm">Loading location service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 flex flex-col items-center justify-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <HiOutlineLocationMarker className="w-16 h-16 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Location Service Not Found</h2>
          <p className="text-slate-600 text-sm">{error || 'The requested regional service could not be retrieved.'}</p>
          <Link
            href={`/admin/services/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-900 hover:bg-cyan-950 text-white font-extrabold text-sm transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span>Back to Parent Service</span>
          </Link>
        </div>
      </div>
    );
  }

  const imgUrl = service.image?.url || service.imageUrl;
  const currentStatus = service.status || (service.isVisible ? 'Publish' : 'Hide');

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <Link
            href={`/admin/services/${slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span>Back to {getParentServiceTitle()}</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-black text-xs shadow-sm">
              <HiOutlineLocationMarker className="w-4 h-4" />
              <span>{service.location}</span>
            </span>
            <span
              className={`text-xs font-black px-3.5 py-1.5 rounded-full border uppercase tracking-wider ${
                currentStatus === 'Publish'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Main Location Service Article Container */}
        <article className="bg-white border-2 border-slate-200/80 rounded-3xl overflow-hidden shadow-xl">
          {/* Header Banner Image */}
          {imgUrl && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-b border-slate-200 overflow-hidden">
              <img
                src={imgUrl}
                alt={service.serviceName || service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-black border border-white/20 flex items-center gap-1.5">
                <HiOutlineLocationMarker className="w-4 h-4 text-cyan-400" />
                <span>Regional Service — {service.location}</span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-8">
            {/* Heading & Title */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-900 border border-cyan-200">
                  {service.location} Region
                </span>
                <span className="font-mono text-cyan-700 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  /services/{slug}/{service.slug}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Parent: <span className="font-extrabold text-slate-800">{getParentServiceTitle()}</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-tight tracking-tight">
                {service.serviceName || service.title}
              </h1>

              {service.heading && (
                <p className="text-lg font-bold text-cyan-800">
                  {service.heading}
                </p>
              )}
            </div>

            {/* Overview Summary Box */}
            {(service.shortDescription || service.text) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-cyan-50/70 border-2 border-cyan-200/80 text-cyan-950">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-800 block mb-1">
                  Overview for {service.location}
                </span>
                <p className="text-base sm:text-lg font-bold leading-relaxed italic">
                  &ldquo;{service.shortDescription || service.text}&rdquo;
                </p>
              </div>
            )}

            {/* Key Deliverables */}
            {service.deliverables && service.deliverables.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-cyan-950 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg">
                <h3 className="text-lg font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <HiOutlineCheckCircle className="w-6 h-6 text-cyan-400" />
                  <span>Key Deliverables ({service.location})</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10 text-sm font-bold">
                      <span className="text-cyan-400 font-black text-base leading-none">✓</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Service Body Content */}
            <div className="pt-2">
              {renderServiceContent(service.fullDescription || service.text)}
            </div>

            {/* Location FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
                  <HiOutlineQuestionMarkCircle className="w-6 h-6 text-cyan-600" />
                  <span>Frequently Asked Questions ({service.location})</span>
                </div>
                <div className="space-y-3">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-base text-slate-900">Q: {faq.question}</h4>
                      <p className="font-medium text-slate-700 text-base leading-relaxed pl-3 border-l-2 border-cyan-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local SEO Metadata Box */}
            {service.seo && Object.values(service.seo).some(Boolean) && (
              <div className="pt-8 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                  <HiOutlineGlobeAlt className="w-5 h-5 text-cyan-600" />
                  <span>Local SEO Metadata ({service.location})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {service.seo.metaTitle && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-0.5">Meta Title</span>
                      <span className="font-extrabold text-slate-900">{service.seo.metaTitle}</span>
                    </div>
                  )}
                  {service.seo.metaDescription && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-0.5">Meta Description</span>
                      <span className="font-medium text-slate-800">{service.seo.metaDescription}</span>
                    </div>
                  )}
                  {service.seo.metaKeywords && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                      <span className="font-bold text-slate-500 block mb-0.5">Local Keywords</span>
                      <span className="font-medium text-slate-800">{service.seo.metaKeywords}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags Footer */}
            {service.tags && service.tags.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <HiOutlineTag className="w-4 h-4 text-cyan-700" />
                  <span>Service Tags</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
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
            href={`/admin/services/${slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-900 hover:bg-cyan-950 text-white font-black text-base shadow-lg hover:shadow-xl transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
            <span>Return to {getParentServiceTitle()}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
