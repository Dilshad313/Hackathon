const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdminLogin = async () => {
  try {
    console.log('=================================');
    console.log('Admin Login Fix Script');
    console.log('=================================\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dilud279:Dilshad786@cluster0.jd0la.mongodb.net/soulsync';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASS || 'password';

    console.log('Checking for admin user...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('');

    // Step 1: Check if admin exists
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!admin) {
      console.log('✗ Admin user not found in database');
      console.log('Creating new admin user...\n');
      
      // Check if username 'admin' is taken
      const existingUsername = await User.findOne({ username: 'admin' });
      if (existingUsername) {
        console.log('Clearing existing "admin" username...');
        await User.deleteOne({ username: 'admin' });
      }

      // Create new admin
      admin = new User({
        email: adminEmail,
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });

      await admin.save();
      console.log('✓ Admin user created successfully!\n');
    } else {
      console.log('✓ Admin user found in database\n');
      
      // Check admin properties
      console.log('Current admin details:');
      console.log('- Email:', admin.email);
      console.log('- Username:', admin.username);
      console.log('- Role:', admin.role);
      console.log('- Active:', admin.isActive);
      console.log('- Email Verified:', admin.isEmailVerified);
      console.log('');

      // Check if role is correct
      if (admin.role !== 'admin') {
        console.log('✗ Role is not "admin", fixing...');
        admin.role = 'admin';
      }

      // Check if active
      if (!admin.isActive) {
        console.log('✗ Account is not active, fixing...');
        admin.isActive = true;
      }

      // Test password
      console.log('Testing password...');
      const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
      
      if (!isPasswordValid) {
        console.log('✗ Password does not match, resetting password...');
        admin.password = adminPassword;
        await admin.save();
        console.log('✓ Password reset successfully!\n');
      } else {
        console.log('✓ Password is correct!\n');
        await admin.save();
      }
    }

    // Final verification
    console.log('=================================');
    console.log('Final Verification');
    console.log('=================================\n');

    const verifiedAdmin = await User.findOne({ email: adminEmail }).select('+password');
    const passwordCheck = await bcrypt.compare(adminPassword, verifiedAdmin.password);

    console.log('Admin Details:');
    console.log('- Email:', verifiedAdmin.email);
    console.log('- Username:', verifiedAdmin.username);
    console.log('- Role:', verifiedAdmin.role);
    console.log('- Active:', verifiedAdmin.isActive);
    console.log('- Password Valid:', passwordCheck ? '✓ Yes' : '✗ No');
    console.log('');

    if (verifiedAdmin.role === 'admin' && verifiedAdmin.isActive && passwordCheck) {
      console.log('=================================');
      console.log('✓ Admin login is now fixed!');
      console.log('=================================\n');
      console.log('You can login with:');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('');
      console.log('Login URL: http://localhost:5000/api/users/login');
      console.log('Admin Dashboard: /admin/dashboard');
      console.log('');
    } else {
      console.log('✗ There are still issues with the admin account');
      console.log('Please check the details above');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error fixing admin login:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

fixAdminLogin();
