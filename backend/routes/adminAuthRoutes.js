const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to create default admin if not exists
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASS || 'password';
    
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log('Creating default admin...');
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
      console.log('✓ Default admin created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// @route   POST api/admin/auth/login
// @desc    Admin login - separate from user login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Ensure default admin exists (auto-create if missing)
    await ensureDefaultAdmin();

    // Check for admin - explicitly select password field
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
    }

    // Check if account is locked
    if (admin.isLocked) {
      console.log('Admin account is locked:', email);
      return res.status(403).json({ 
        message: 'Account is locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      console.log('Admin account is inactive:', email);
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    console.log('Admin found, checking password...');
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for admin:', email);
      // Increment login attempts
      await admin.incLoginAttempts();
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Admin login successful for:', email);

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.updateOne({
        $set: { loginAttempts: 0, lastLoginAt: new Date() },
        $unset: { lockedUntil: 1 }
      });
    } else {
      await admin.updateOne({ $set: { lastLoginAt: new Date() } });
    }

    // Create JWT token
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role,
        type: 'admin' // Important: distinguish from user tokens
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mindSyncSecretKey',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            profilePicture: admin.profilePicture,
            type: 'admin' // Important: for frontend to distinguish
          }
        });
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/auth/register
// @desc    Register new admin (only super-admin can do this)
// @access  Private - Super Admin only
router.post('/register', adminAuth, async (req, res) => {
  try {
    // Check if requesting admin is super-admin
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can create new admin accounts' });
    }

    const { email, username, password, firstName, lastName, role, phone } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please provide email, username, and password' });
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new admin
    admin = new Admin({
      email,
      username,
      password,
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      role: role || 'moderator',
      phone,
      isActive: true,
      isEmailVerified: true
    });

    await admin.save();

    res.status(201).json({ 
      message: 'Admin created successfully', 
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/auth/profile
// @desc    Get admin profile
// @access  Private - Admin
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/auth/profile
// @desc    Update admin profile
// @access  Private - Admin
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone, profilePicture } = req.body;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Update fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone) admin.phone = phone;
    if (profilePicture) admin.profilePicture = profilePicture;

    await admin.save();
    
    res.json({
      message: 'Profile updated successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        phone: admin.phone,
        profilePicture: admin.profilePicture
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/auth/change-password
// @desc    Change admin password
// @access  Private - Admin
router.put('/change-password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/auth/list
// @desc    Get all admins (super-admin only)
// @access  Private - Super Admin
router.get('/list', adminAuth, async (req, res) => {
  try {
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can view all admins' });
    }

    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({ admins, total: admins.length });
  } catch (error) {
    console.error('Get admins list error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/auth/:id/toggle-status
// @desc    Toggle admin active status (super-admin only)
// @access  Private - Super Admin
router.put('/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can modify admin status' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deactivating yourself
    if (admin.id === req.admin.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ 
      message: `Admin account ${admin.isActive ? 'activated' : 'deactivated'}`,
      admin: {
        id: admin.id,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/auth/init
// @desc    Initialize admin (create default admin if not exists)
// @access  Public (for initial setup only)
router.post('/init', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASS || 'password';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(200).json({ 
        message: 'Admin already exists',
        admin: {
          email: existingAdmin.email,
          username: existingAdmin.username,
          role: existingAdmin.role
        }
      });
    }

    // Create new admin
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

    res.status(201).json({ 
      message: 'Admin initialized successfully',
      admin: {
        email: admin.email,
        username: admin.username,
        role: admin.role
      },
      instructions: {
        login: 'POST /api/admin/auth/login',
        credentials: {
          email: adminEmail,
          password: 'Check your .env file'
        }
      }
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
