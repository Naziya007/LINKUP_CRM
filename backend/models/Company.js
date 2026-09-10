const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g. SOCIAL, WEB, LEGAL, FINSERV
  description: { type: String },
  logo: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Company || mongoose.model('Company', CompanySchema);
