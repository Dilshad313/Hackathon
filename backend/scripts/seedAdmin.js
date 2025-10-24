const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dilud279:Dilshad786@cluster0.jd0la.mongodb.net/soulsync';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASS || 'password';

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASS must be set in .env file');
      process.exit(1);
    }

    // Check if admin already exists
    let existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      console.log('Updating admin user...');
      
      // Delete the old admin to recreate with fresh password
      await User.deleteOne({ email: adminEmail });
      console.log('Old admin user deleted');
    }

    // Check if username 'admin' exists
    const existingUsername = await User.findOne({ username: 'admin' });
    if (existingUsername && existingUsername.email !== adminEmail) {
      await User.deleteOne({ username: 'admin' });
      console.log('Existing admin username cleared');
    }

    // Create new admin user (password will be hashed by pre-save hook)
    const adminUser = new User({
      email: adminEmail,
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();
    console.log('\n✓ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Username: admin');
    console.log('Role:', adminUser.role);
    console.log('Active:', adminUser.isActive);

    // Verify the password can be compared
    const savedAdmin = await User.findOne({ email: adminEmail }).select('+password');
    const isPasswordValid = await bcrypt.compare(adminPassword, savedAdmin.password);
    
    if (isPasswordValid) {
      console.log('\n✓ Password verification successful!');
    } else {
      console.log('\n✗ Warning: Password verification failed!');
    }

    console.log('\n=================================');
    console.log('You can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
