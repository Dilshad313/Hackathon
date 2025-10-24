const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdminCollection = async () => {
  try {
    console.log('=================================');
    console.log('Seeding Admin Collection');
    console.log('=================================\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dilud279:Dilshad786@cluster0.jd0la.mongodb.net/soulsync';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASS || 'password';

    console.log('Admin credentials from .env:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('');

    // Check if admin already exists in Admin collection
    let existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠ Admin already exists in Admin collection');
      console.log('Deleting old admin to create fresh one...\n');
      await Admin.deleteOne({ email: adminEmail });
    }

    // Check if username 'admin' exists
    const existingUsername = await Admin.findOne({ username: 'admin' });
    if (existingUsername && existingUsername.email !== adminEmail) {
      console.log('Clearing existing admin username...');
      await Admin.deleteOne({ username: 'admin' });
    }

    // Create new admin in Admin collection
    const admin = new Admin({
      email: adminEmail,
      username: 'admin',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super-admin',
      isActive: true,
      isEmailVerified: true,
      assignedSections: ['users', 'doctors', 'hospitals', 'courses', 'forum', 'all']
    });

    await admin.save();
    console.log('✓ Admin created successfully in Admin collection!\n');

    // Verify the password can be compared
    const savedAdmin = await Admin.findOne({ email: adminEmail }).select('+password');
    const isPasswordValid = await bcrypt.compare(adminPassword, savedAdmin.password);
    
    console.log('Verification:');
    console.log('- Email:', savedAdmin.email);
    console.log('- Username:', savedAdmin.username);
    console.log('- Role:', savedAdmin.role);
    console.log('- Active:', savedAdmin.isActive);
    console.log('- Password Valid:', isPasswordValid ? '✓ Yes' : '✗ No');
    console.log('');

    if (isPasswordValid) {
      console.log('=================================');
      console.log('✓ Admin seeding successful!');
      console.log('=================================\n');
      console.log('Login with:');
      console.log('Endpoint: POST /api/admin/auth/login');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('');
      console.log('Example request:');
      console.log('curl -X POST http://localhost:5000/api/admin/auth/login \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log(`  -d '{"email":"${adminEmail}","password":"${adminPassword}"}'`);
      console.log('');
    } else {
      console.log('✗ Warning: Password verification failed!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error seeding admin collection:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

seedAdminCollection();
