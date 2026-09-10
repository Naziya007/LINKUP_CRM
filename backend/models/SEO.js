const mongoose = require('mongoose');

const SEOSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  pageSlug: { type: String, required: true, default: 'home' }, // e.g. home, about, services, projects, contact
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  canonicalUrl: { type: String },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  twitterTitle: { type: String },
  twitterDescription: { type: String },
  twitterImage: { type: String }
}, { timestamps: true });

SEOSchema.index({ companyId: 1, pageSlug: 1 }, { unique: true });

module.exports = mongoose.models.SEO || mongoose.model('SEO', SEOSchema);
