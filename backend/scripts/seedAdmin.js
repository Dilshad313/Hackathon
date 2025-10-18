const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASS;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASS must be set in .env file');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      
      // Update password if needed
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      
      console.log('Admin user updated successfully');
      console.log('Email:', adminEmail);
      console.log('Role:', existingAdmin.role);
    } else {
      // Create new admin user
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
      console.log('Admin user created successfully');
      console.log('Email:', adminEmail);
      console.log('Username: admin');
      console.log('Role:', adminUser.role);
    }

    console.log('\nYou can now login with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
