require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

async function testConnections() {
  console.log('--- TESTING CONNECTIONS ---');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);

  // 1. Test MongoDB
  try {
    console.log('\n[1/2] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connection SUCCESSFUL! Host:', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB Connection FAILED:', err.message);
  }

  // 2. Test Cloudinary
  try {
    console.log('\n[2/2] Testing Cloudinary credentials...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Ping SUCCESSFUL!', result);
  } catch (err) {
    console.error('❌ Cloudinary Ping FAILED:', err.message);
  }

  process.exit(0);
}

testConnections();
