'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminFetch } from '@/lib/adminApi';
import ImageUploadInput from '@/components/admin/ImageUploadInput';
import SeoFormSection, { SEOFields } from '@/components/admin/SeoFormSection';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineStar,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineTag,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

interface CompanyInfo {
  _id: string;
  name: string;
  code: string;
  slug?: string;
}

interface ServiceItem {
  _id?: string;
  companyId: string | CompanyInfo;
  serviceName: string;
  title?: string;
  titleLines?: string[];
  slug: string;
  heading?: string;
  text?: string;
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  deliverables?: string[];
  image: { url: string; publicId: string };
  imageUrl?: string;
  imageAlt?: string;
  serviceLink?: string;
  featured: boolean;
  isVisible: boolean;
  displayOrder: number;
  seo?: SEOFields;
}

export default function ServicesAdminPage() {
  const { selectedCompany, companies } = useAdminAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);

  const [titleLinesInput, setTitleLinesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [deliverablesInput, setDeliverablesInput] = useState('');

  const [formData, setFormData] = useState<ServiceItem>({
    companyId: '',
    serviceName: '',
    title: '',
    titleLines: [],
    slug: '',
    heading: '',
    text: '',
    shortDescription: '',
    fullDescription: '',
    tags: [],
    deliverables: [],
    image: { url: '', publicId: '' },
    imageUrl: '',
    imageAlt: '',
    serviceLink: '',
    featured: false,
    isVisible: true,
    displayOrder: 0,
    seo: {}
  });

  useEffect(() => {
    if (selectedCompany?._id) {
      setCompanyFilter(selectedCompany._id);
    }
  }, [selectedCompany]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const activeFilter = companyFilter || selectedCompany?._id || companies[0]?._id || '';
      const res = await adminFetch(`/services?companyId=${activeFilter}&includeHidden=true`);
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch {
      setServices([
        {
          _id: '1',
          companyId: companies[0]?._id || 'web-1',
          serviceName: 'Website Strategy & UX',
          title: 'Website Strategy & UX',
          titleLines: ['Website Strategy', '& UX'],
          slug: 'website-strategy-ux',
          heading: 'Strategic Wireframing & Site Architecture',
          text: 'Data-driven site architecture, strategic wireframing, and user journeys built around real customer decisions.',
          shortDescription: 'Data-driven site architecture, strategic wireframing, and user journeys built around real customer decisions.',
          fullDescription: 'Data-driven site architecture, strategic wireframing, and user journeys built around real customer decisions.',
          tags: ['UX Design', 'Strategy', 'Architecture'],
          deliverables: ['Positioning & conversion goals', 'Site maps & user flows', 'Content direction & wireframes'],
          imageUrl: '/assets/media/service_website_strategy.jpg',
          imageAlt: 'Website Strategy & UX',
          image: { url: '/assets/media/service_website_strategy.jpg', publicId: '' },
          serviceLink: '',
          featured: true,
          isVisible: true,
          displayOrder: 1,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [companyFilter]);

  const handleOpenModal = (item?: ServiceItem) => {
    if (item) {
      setEditingItem(item);
      const compId = typeof item.companyId === 'object' ? item.companyId._id : item.companyId;
      const sName = item.serviceName || item.title || '';
      setFormData({
        ...item,
        companyId: compId || companies[0]?._id || '',
        serviceName: sName,
        title: item.title || sName,
        slug: item.slug || '',
        heading: item.heading || '',
        text: item.text || item.shortDescription || '',
        shortDescription: item.shortDescription || item.text || '',
        fullDescription: item.fullDescription || item.text || '',
        imageUrl: item.imageUrl || item.image?.url || '',
        imageAlt: item.imageAlt || item.serviceName || '',
        image: item.image || { url: item.imageUrl || '', publicId: '' },
        serviceLink: item.serviceLink || '',
        featured: item.featured ?? false,
        isVisible: item.isVisible ?? true,
        displayOrder: item.displayOrder ?? 0,
        seo: item.seo || {}
      });
      setTitleLinesInput((item.titleLines || []).join(', '));
      setTagsInput((item.tags || []).join(', '));
      setDeliverablesInput((item.deliverables || []).join(', '));
    } else {
      setEditingItem(null);
      const defaultCompId = (companyFilter || selectedCompany?._id || companies[0]?._id) || '';
      setFormData({
        companyId: defaultCompId,
        serviceName: '',
        title: '',
        titleLines: [],
        slug: '',
        heading: '',
        text: '',
        shortDescription: '',
        fullDescription: '',
        tags: [],
        deliverables: [],
        image: { url: '', publicId: '' },
        imageUrl: '',
        imageAlt: '',
        serviceLink: '',
        featured: false,
        isVisible: true,
        displayOrder: services.length + 1,
        seo: {}
      });
      setTitleLinesInput('');
      setTagsInput('');
      setDeliverablesInput('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const titleLinesArray = titleLinesInput.split(',').map(t => t.trim()).filter(Boolean);
      const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const deliverablesArray = deliverablesInput.split(',').map(d => d.trim()).filter(Boolean);
      const nameVal = formData.serviceName || formData.title || '';
      const textVal = formData.text || formData.shortDescription || '';
      const imgUrlVal = formData.imageUrl || formData.image?.url || '';

      const payload = {
        ...formData,
        companyId: formData.companyId || companies[0]?._id,
        serviceName: nameVal,
        title: nameVal,
        titleLines: titleLinesArray,
        slug: formData.slug || nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        text: textVal,
        shortDescription: textVal,
        fullDescription: formData.fullDescription || textVal,
        tags: tagsArray,
        deliverables: deliverablesArray,
        imageUrl: imgUrlVal,
        image: { url: imgUrlVal, publicId: formData.image?.publicId || '' }
      };

      if (editingItem?._id) {
        await adminFetch(`/services/${editingItem._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/services', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await adminFetch(`/services/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ isVisible: !currentStatus }) });
      setServices(services.map(s => s._id === id ? { ...s, isVisible: !currentStatus } : s));
    } catch {
      setServices(services.map(s => s._id === id ? { ...s, isVisible: !currentStatus } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Soft-delete this service?')) return;
    try {
      await adminFetch(`/services/${id}`, { method: 'DELETE' });
      setServices(services.filter(s => s._id !== id));
    } catch {
      setServices(services.filter(s => s._id !== id));
    }
  };

  const filteredServices = services.filter(s => {
    const nameMatch = (s.serviceName || s.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const slugMatch = (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const tagsMatch = (s.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return nameMatch || slugMatch || tagsMatch;
  });

  const getCompanyName = (comp: string | CompanyInfo) => {
    if (typeof comp === 'object' && comp?.name) return comp.name;
    const found = companies.find(c => c._id === comp);
    return found ? found.name : 'Linkup Group';
  };

  const getCompanyCode = (comp: string | CompanyInfo) => {
    if (typeof comp === 'object' && comp?.code) return comp.code;
    const found = companies.find(c => c._id === comp);
    return found ? found.code : 'CMS';
  };

  return (
    <div className="space-y-6 text-base">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Services Management</h1>
          <p className="text-base text-slate-600 mt-1 font-bold">
            Manage services for <span className="text-cyan-700 font-extrabold text-lg">{getCompanyName(companyFilter)}</span>
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl text-base flex items-center gap-2.5 shadow-md cursor-pointer"
        >
          <HiOutlinePlus className="w-6 h-6" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Controls: Search, Filter, and Grid/Table View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-sm w-full max-w-full">
        <div className="relative flex-1 w-full min-w-0">
          <HiOutlineSearch className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by name, slug, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-base font-extrabold shrink-0">
            <HiOutlineBuildingOffice2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
            <span>Select Company:</span>
          </div>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-slate-50 border-2 border-slate-300 hover:border-cyan-600 text-cyan-800 font-extrabold text-xs sm:text-base rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-cyan-600 cursor-pointer w-full sm:w-auto min-w-0 truncate"
          >
            {companies.map((c) => (
              <option key={c._id} value={c._id} className="bg-white text-slate-900 font-bold text-sm sm:text-base py-1">
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-center bg-slate-100 p-1 rounded-xl border border-slate-300 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-initial p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Card Grid View"
            >
              <HiOutlineViewGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-initial p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              title="Table View"
            >
              <HiOutlineViewList className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid Cards vs Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-600 text-xl font-bold bg-white rounded-2xl border-2 border-slate-200">
          Loading services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center text-slate-600 text-xl font-bold bg-white rounded-2xl border-2 border-slate-200">
          No services found.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id || service.slug || service.serviceName}
              className="bg-white border-2 border-slate-200 hover:border-cyan-500 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-200">
                  {service.image?.url || service.imageUrl ? (
                    <img
                      src={service.image?.url || service.imageUrl}
                      alt={service.imageAlt || service.serviceName || service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">
                      NO IMAGE PROVIDED
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-3.5 py-1.5 rounded-xl text-sm font-black bg-white/90 backdrop-blur-md text-cyan-800 border border-cyan-200 shadow-md">
                    {getCompanyCode(service.companyId)} — {getCompanyName(service.companyId)}
                  </span>

                  {service.featured && (
                    <span className="absolute top-3 right-3 p-2 rounded-full bg-amber-500 text-white shadow-md">
                      <HiOutlineStar className="w-5 h-5 fill-white" />
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-cyan-800 font-extrabold bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
                      /{service.slug}
                    </span>
                    <span className="text-sm text-slate-600 font-bold">
                      Order: #{service.displayOrder}
                    </span>
                  </div>

                  <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-snug">
                    {service.serviceName || service.title}
                  </h3>

                  {/* Service Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.tags.map((tag, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-extrabold border border-indigo-200 flex items-center gap-1">
                          <HiOutlineTag className="w-3 h-3 text-indigo-500" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-base text-slate-600 font-bold leading-relaxed line-clamp-3">
                    {service.text || service.shortDescription || service.fullDescription || 'No description provided.'}
                  </p>

                  {/* Deliverables List */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Deliverables</span>
                      <div className="space-y-1">
                        {service.deliverables.map((deliv, idx) => (
                          <div key={idx} className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => toggleVisibility(service._id!, service.isVisible)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-extrabold transition-colors cursor-pointer ${
                    service.isVisible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {service.isVisible ? <HiOutlineEye className="w-5 h-5" /> : <HiOutlineEyeOff className="w-5 h-5" />}
                  <span>{service.isVisible ? 'Visible' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="p-3 rounded-xl bg-slate-100 text-slate-800 hover:text-cyan-700 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
                    title="Edit Service"
                  >
                    <HiOutlinePencil className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id!)}
                    className="p-3 rounded-xl bg-slate-100 text-slate-800 hover:text-red-600 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
                    title="Delete Service"
                  >
                    <HiOutlineTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-base min-w-[640px]">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-extrabold border-b border-slate-200 text-sm">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-center">Featured</th>
                <th className="p-4 text-center">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredServices.map((service) => (
                <tr key={service._id || service.slug || service.serviceName} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-black text-slate-900">{service.serviceName || service.title}</td>
                  <td className="p-4 font-extrabold text-cyan-700">{getCompanyName(service.companyId)}</td>
                  <td className="p-4 font-mono text-cyan-800">/{service.slug}</td>
                  <td className="p-4 text-center font-bold">{service.featured ? '⭐ Yes' : 'No'}</td>
                  <td className="p-4 text-center font-bold">{service.isVisible ? 'Visible' : 'Hidden'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(service)} className="p-2.5 bg-slate-100 rounded-xl text-slate-800 hover:bg-slate-200">
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(service._id!)} className="p-2.5 bg-slate-100 rounded-xl text-red-600 hover:bg-red-50">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto pt-6 pb-12">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl my-auto max-h-[88vh] overflow-hidden relative">
            {/* Sticky Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-30 shadow-sm">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                {editingItem ? 'Edit Service Form' : 'Add New Service Form'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close Form"
              >
                <HiOutlineX className="w-8 h-8 stroke-[2.5]" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-7 space-y-6 overflow-y-auto flex-1 text-base">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="block text-base font-black uppercase tracking-wider text-cyan-700 mb-2 flex items-center gap-2.5">
                  <HiOutlineBuildingOffice2 className="w-6 h-6" />
                  <span>Assigned Linkup Company *</span>
                </label>
                <select
                  required
                  value={typeof formData.companyId === 'string' ? formData.companyId : formData.companyId?._id}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full bg-white border-2 border-slate-300 text-slate-900 font-extrabold text-lg rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyan-600 cursor-pointer shadow-sm"
                >
                  {companies.map((c) => (
                    <option key={c._id} value={c._id} className="bg-white text-slate-900 py-1.5 font-bold text-base">
                      {c.name} ({c.code}) - {c.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Service Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceName || formData.title || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        serviceName: name,
                        title: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      });
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="e.g. Website Strategy & UX"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-cyan-800 font-mono font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="website-strategy-ux"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Title Lines (comma separated)</label>
                  <input
                    type="text"
                    value={titleLinesInput}
                    onChange={(e) => setTitleLinesInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="Website Strategy, & UX"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="UX Design, Strategy, Architecture"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-extrabold text-slate-800 mb-2">Summary Text / Description</label>
                <textarea
                  rows={3}
                  value={formData.text || formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value, shortDescription: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600 leading-relaxed"
                  placeholder="Data-driven site architecture, strategic wireframing..."
                />
              </div>

              <div>
                <label className="block text-base font-extrabold text-slate-800 mb-2">Deliverables (comma separated)</label>
                <input
                  type="text"
                  value={deliverablesInput}
                  onChange={(e) => setDeliverablesInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                  placeholder="Positioning & conversion goals, Site maps & user flows, Content direction & wireframes"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Image URL / Asset Path</label>
                  <input
                    type="text"
                    value={formData.imageUrl || formData.image?.url || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, image: { url: e.target.value, publicId: formData.image?.publicId || '' } })}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base font-mono text-cyan-800 font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="/assets/media/service_website_strategy.jpg"
                  />
                </div>
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Image Alt Text</label>
                  <input
                    type="text"
                    value={formData.imageAlt || ''}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                    placeholder="Website Strategy & UX"
                  />
                </div>
              </div>

              <ImageUploadInput
                label="Service Image (Cloudinary)"
                value={formData.image}
                onChange={(image) => setFormData({ ...formData, image, imageUrl: image.url })}
                folder="linkup_services"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-base font-extrabold text-slate-800 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-6 h-6 rounded bg-slate-50 border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-base font-extrabold text-slate-800 cursor-pointer">
                    Featured Service
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-6 h-6 rounded bg-slate-50 border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isVisible" className="text-base font-extrabold text-slate-800 cursor-pointer">
                    Visible on Website
                  </label>
                </div>
              </div>

              <SeoFormSection
                seo={formData.seo || {}}
                onChange={(seo) => setFormData({ ...formData, seo })}
              />

              <div className="pt-5 border-t border-slate-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-extrabold rounded-xl border border-slate-300 cursor-pointer"
                >
                  Cancel / Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-base rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
