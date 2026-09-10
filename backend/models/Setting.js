const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'Linkup Group Admin CMS' },
  contactEmail: { type: String, default: 'admin@linkupgroup.com' },
  supportPhone: { type: String, default: '+91 9876543210' },
  maintenanceMode: { type: Boolean, default: false },
  allowedAdminDomains: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
