const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    user = new User({
      email,
      username,
      password,
      firstName,
      lastName
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.role = role || 'patient';

    await user.save();
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
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
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
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
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/users/register-anonymous
// @desc    Create anonymous user
// @access  Public
router.post('/register-anonymous', async (req, res) => {
  try {
    const username = `anonymous_${Date.now()}`;
    
    const user = new User({
      username,
      isAnonymous: true,
      anonymousExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'patient'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mindSyncSecretKey',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role || 'patient',
            isAnonymous: user.isAnonymous
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/users/search
// @desc    Search for users (doctors, hospitals)
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, type, location } = req.query;
    
    let searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (type) {
      if (type === 'doctor') {
        searchQuery.role = 'doctor';
      } else if (type === 'hospital') {
        searchQuery.role = 'hospital';
      }
    }

    const users = await User.find(searchQuery).select('-password');
    
    // If location is provided, we'll need to join with Doctor/Hospital models for distance calculation
    if (location) {
      // This would require more complex geospatial queries based on Doctor/Hospital location data
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/users/health
// @desc    Check user's wellness metrics
// @access  Private
router.get('/health', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent assessments
    // Get recent journal entries
    // Calculate wellness score based on recent activity
    // This is a simplified version - would need more complex logic in real implementation
    
    res.json({
      userId: user.id,
      wellnessScore: 75, // Placeholder - would be calculated based on actual data
      lastAssessment: null, // Would fetch from AssessmentResult model
      lastJournalEntry: null, // Would fetch from JournalEntry model
      upcomingAppointments: 0, // Would fetch from Appointment model
      courseProgress: 0 // Would fetch from Enrollment model
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;