const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const verifyAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;

    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('\n✓ Admin user found in database');
      console.log('Email:', admin.email);
      console.log('Username:', admin.username);
      console.log('Role:', admin.role);
      console.log('Active:', admin.isActive);
      console.log('Email Verified:', admin.isEmailVerified);
      console.log('Created At:', admin.createdAt);
      
      if (admin.role === 'admin') {
        console.log('\n✓ Admin role is correctly set');
      } else {
        console.log('\n✗ Warning: User role is not "admin", it is:', admin.role);
      }
    } else {
      console.log('\n✗ Admin user not found in database');
      console.log('Expected email:', adminEmail);
      console.log('\nPlease run: npm run seed:admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying admin:', error);
    process.exit(1);
  }
};

verifyAdmin();
