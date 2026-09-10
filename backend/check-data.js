require('dotenv').config();
const connectDB = require('./config/db');
const Company = require('./models/Company');
const Service = require('./models/Service');
const Project = require('./models/Project');
const Testimonial = require('./models/Testimonial');
const FAQ = require('./models/FAQ');
const Blog = require('./models/Blog');

async function checkData() {
  await connectDB();
  console.log('--- DB DATA CHECK ---');
  const companies = await Company.find();
  console.log(`Companies Count: ${companies.length}`);
  companies.forEach(c => console.log(`- ${c.name} (id: ${c._id})`));

  const projects = await Project.find({ isDeleted: false }).populate('companyId');
  console.log(`\nProjects Count: ${projects.length}`);
  projects.forEach(p => console.log(`- Project: "${p.projectTitle}" | Company: ${p.companyId?.name || p.companyId}`));

  const services = await Service.find({ isDeleted: false }).populate('companyId');
  console.log(`\nServices Count: ${services.length}`);
  services.forEach(s => console.log(`- Service: "${s.serviceName}" | Company: ${s.companyId?.name || s.companyId}`));

  process.exit(0);
}

checkData();
