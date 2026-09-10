const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

// @route GET /api/companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isVisible: true }).sort({ createdAt: 1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/companies/all (Admin view)
router.get('/all', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: 1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
