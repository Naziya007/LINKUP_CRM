const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
