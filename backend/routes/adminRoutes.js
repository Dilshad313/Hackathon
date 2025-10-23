const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { Course, Enrollment } = require('../models/Course');
const { ForumPost } = require('../models/Forum');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data with comprehensive statistics
// @access  Private - Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      userCount,
      doctorCount,
      hospitalCount,
      courseCount,
      appointmentCount,
      forumPostCount,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      pendingHospitals,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Hospital.countDocuments(),
      Course.countDocuments(),
      Appointment.countDocuments(),
      ForumPost.countDocuments(),
      Doctor.countDocuments({ adminApprovalStatus: 'pending' }),
      Doctor.countDocuments({ adminApprovalStatus: 'approved' }),
      Doctor.countDocuments({ adminApprovalStatus: 'rejected' }),
      Hospital.countDocuments({ adminApprovalStatus: 'pending' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    // Get recent data
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role createdAt isActive');

    const recentDoctors = await Doctor.find()
      .populate('userId', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('specialization adminApprovalStatus createdAt');

    const recentAppointments = await Appointment.find()
      .populate('patientId', 'username email firstName lastName')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName username email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate growth statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLastMonth = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const newDoctorsLastMonth = await Doctor.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const dashboardData = {
      // Total counts
      totalUsers: userCount,
      totalDoctors: doctorCount,
      totalHospitals: hospitalCount,
      totalCourses: courseCount,
      totalAppointments: appointmentCount,
      totalForumPosts: forumPostCount,
      
      // User statistics
      userStats: {
        active: activeUsers,
        inactive: inactiveUsers,
        newThisMonth: newUsersLastMonth
      },
      
      // Doctor statistics
      doctorStats: {
        pending: pendingDoctors,
        approved: approvedDoctors,
        rejected: rejectedDoctors,
        newThisMonth: newDoctorsLastMonth
      },
      
      // Hospital statistics
      hospitalStats: {
        pending: pendingHospitals
      },
      
      // Recent data
      recentUsers,
      recentDoctors,
      recentAppointments,
      
      // Timestamp
      generatedAt: new Date()
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private - Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/users/add
// @desc    Add a new user
// @access  Private - Admin
router.post('/users/add', adminAuth, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'patient',
      isActive: true
    });

    await user.save();

    res.status(201).json({ 
      message: 'User created successfully', 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private - Admin
router.put('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User status updated to ${user.isActive ? 'active' : 'inactive'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private - Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/doctors
// @desc    Get all doctors with filtering and search
// @access  Private - Admin
router.get('/doctors', adminAuth, async (req, res) => {
  try {
    const { adminApprovalStatus, page = 1, limit = 10, search, specialization } = req.query;

    let query = {};
    
    // Filter by approval status
    if (adminApprovalStatus) {
      query.adminApprovalStatus = adminApprovalStatus;
    }
    
    // Filter by specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Search functionality
    let doctors;
    if (search) {
      // Search in user details
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    doctors = await Doctor.find(query)
      .populate('userId', 'username email firstName lastName phone profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/doctors/add
// @desc    Admin adds a new doctor directly
// @access  Private - Admin
router.post('/doctors/add', adminAuth, async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      phone,
      licenseNumber,
      specialization,
      qualifications,
      yearsOfExperience,
      bio,
      consultationFee,
      languages,
      consultationTypes,
      availability,
      workingHours
    } = req.body;

    // Validate required fields
    if (!email || !username || !password || !licenseNumber || !specialization) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: email, username, password, licenseNumber, specialization' 
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Check if license number already exists
    const existingDoctor = await Doctor.findOne({ licenseNumber });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this license number already exists' });
    }

    // Create user account
    const user = new User({
      email,
      username,
      password,
      firstName,
      lastName,
      phone,
      role: 'doctor',
      isActive: true,
      isEmailVerified: true
    });

    await user.save();

    // Create doctor profile
    const doctor = new Doctor({
      userId: user._id,
      licenseNumber,
      specialization,
      qualifications: qualifications || [],
      yearsOfExperience: yearsOfExperience || 0,
      bio: bio || '',
      consultationFee: consultationFee || { amount: 0, currency: 'USD' },
      languages: languages || ['English'],
      consultationTypes: consultationTypes || ['video', 'audio'],
      availability: availability || {},
      workingHours: workingHours || { startTime: '09:00', endTime: '17:00' },
      adminApprovalStatus: 'approved',
      approvalDate: new Date(),
      isAvailable: true
    });

    await doctor.save();

    // Populate user details for response
    await doctor.populate('userId', 'username email firstName lastName phone');

    res.status(201).json({
      message: 'Doctor added successfully',
      doctor,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/doctors/:id
// @desc    Get single doctor details
// @access  Private - Admin
router.get('/doctors/:id', adminAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'username email firstName lastName phone profilePicture dateOfBirth gender address');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/doctors/:id
// @desc    Update doctor details
// @access  Private - Admin
router.put('/doctors/:id', adminAuth, async (req, res) => {
  try {
    const {
      licenseNumber,
      specialization,
      qualifications,
      yearsOfExperience,
      bio,
      consultationFee,
      languages,
      consultationTypes,
      availability,
      workingHours,
      isAvailable
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if license number is being changed and if it's already taken
    if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
      const existingDoctor = await Doctor.findOne({ licenseNumber });
      if (existingDoctor) {
        return res.status(400).json({ message: 'License number already in use' });
      }
      doctor.licenseNumber = licenseNumber;
    }

    // Update fields
    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (yearsOfExperience !== undefined) doctor.yearsOfExperience = yearsOfExperience;
    if (bio) doctor.bio = bio;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (languages) doctor.languages = languages;
    if (consultationTypes) doctor.consultationTypes = consultationTypes;
    if (availability) doctor.availability = availability;
    if (workingHours) doctor.workingHours = workingHours;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    await doctor.save();
    await doctor.populate('userId', 'username email firstName lastName phone');

    res.json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/admin/doctors/:id
// @desc    Delete doctor
// @access  Private - Admin
router.delete('/doctors/:id', adminAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete doctor profile
    await Doctor.findByIdAndDelete(req.params.id);

    // Update user role back to patient or delete user
    await User.findByIdAndUpdate(doctor.userId, { role: 'patient' });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/doctors/:id/approve
// @desc    Approve or reject doctor
// @access  Private - Admin
router.put('/doctors/:id/approve', adminAuth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.adminApprovalStatus = status;
    doctor.approvalDate = status === 'approved' ? new Date() : null;
    if (status === 'rejected') doctor.rejectionReason = rejectionReason;

    await doctor.save();

    // Update user role based on approval
    if (status === 'approved') {
      await User.findByIdAndUpdate(doctor.userId, { role: 'doctor' });
    }

    res.json({ message: `Doctor ${status}`, doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/hospitals/add
// @desc    Add a new hospital
// @access  Private - Admin
router.post('/hospitals/add', adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, pincode, description } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Please provide name, email, and phone' });
    }

    // Check if hospital email already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital with this email already exists' });
    }

    // Create hospital profile with proper schema structure
    const hospital = new Hospital({
      name,
      email,
      phone,
      address: {
        street: address || 'Not provided',
        city: city || 'Not provided',
        state: state || 'Not provided',
        zipCode: pincode || '000000',
        country: 'India'
      },
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates, can be updated later
      },
      description: description || '',
      adminApprovalStatus: 'approved', // Auto-approve admin-added hospitals
      approvalDate: new Date()
    });
    await hospital.save();

    // Optionally create user account for hospital login (if needed)
    if (password) {
      try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          const user = new User({
            username: email.split('@')[0] + '_hospital',
            email,
            password,
            role: 'hospital',
            isActive: true
          });
          await user.save();
        }
      } catch (userError) {
        console.log('User creation skipped:', userError.message);
      }
    }

    res.status(201).json({ 
      message: 'Hospital added successfully', 
      hospital 
    });
  } catch (error) {
    console.error('Add hospital error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/hospitals
// @desc    Get all hospitals (pending approval)
// @access  Private - Admin
router.get('/hospitals', adminAuth, async (req, res) => {
  try {
    const { adminApprovalStatus = 'pending', page = 1, limit = 10 } = req.query;

    const hospitals = await Hospital.find({ adminApprovalStatus })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Hospital.countDocuments({ adminApprovalStatus });

    res.json({
      hospitals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/hospitals/:id/approve
// @desc    Approve or reject hospital
// @access  Private - Admin
router.put('/hospitals/:id/approve', adminAuth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.adminApprovalStatus = status;
    hospital.approvalDate = status === 'approved' ? new Date() : null;
    if (status === 'rejected') hospital.rejectionReason = rejectionReason;

    await hospital.save();

    res.json({ message: `Hospital ${status}`, hospital });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/admin/courses/add
// @desc    Add a new course
// @access  Private - Admin
router.post('/courses/add', adminAuth, async (req, res) => {
  try {
    const { title, description, category, duration, level, price, thumbnail } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide title, description, and category' });
    }

    // Get admin user info
    const adminUser = await User.findById(req.user.id);
    const instructorName = adminUser ? `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim() : 'Admin';

    // Map frontend category to backend enum
    const categoryMap = {
      'Stress Management': 'stress-management',
      'Anxiety Relief': 'anxiety',
      'Depression Support': 'depression',
      'Mindfulness': 'mindfulness',
      'Meditation': 'mindfulness',
      'Sleep Improvement': 'sleep',
      'Relationship Skills': 'relationships',
      'Self-Esteem': 'self-care',
      'Anger Management': 'anger-management',
      'Trauma Recovery': 'trauma-recovery'
    };

    const mappedCategory = categoryMap[category] || 'general-wellness';

    // Parse duration string to minutes (e.g., "4 weeks" -> 240 minutes estimate)
    let durationMinutes = 60; // default 1 hour
    if (duration) {
      const durationStr = duration.toLowerCase();
      if (durationStr.includes('week')) {
        const weeks = parseInt(durationStr) || 1;
        durationMinutes = weeks * 60; // 1 hour per week
      } else if (durationStr.includes('hour')) {
        durationMinutes = parseInt(durationStr) * 60 || 60;
      } else if (durationStr.includes('min')) {
        durationMinutes = parseInt(durationStr) || 60;
      }
    }

    // Create course with admin as instructor
    const course = new Course({
      title,
      description,
      category: mappedCategory,
      duration: durationMinutes,
      level: (level || 'Beginner').toLowerCase(),
      thumbnail: thumbnail || '',
      instructorId: req.user.id,
      instructorName,
      modules: [
        {
          title: 'Introduction',
          description: 'Course introduction',
          content: 'Welcome to this course!',
          order: 1,
          duration: 10
        }
      ],
      isFree: !price || price === 0,
      price: {
        amount: price || 0,
        currency: 'INR'
      },
      adminApprovalStatus: 'approved', // Auto-approve admin-added courses
      isPublished: true
    });

    await course.save();

    res.status(201).json({ 
      message: 'Course added successfully', 
      course 
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/courses
// @desc    Get all courses (pending approval)
// @access  Private - Admin
router.get('/courses', adminAuth, async (req, res) => {
  try {
    const { adminApprovalStatus = 'pending', page = 1, limit = 10 } = req.query;

    const courses = await Course.find({ adminApprovalStatus })
      .populate('instructorId', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments({ adminApprovalStatus });

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/courses/:id/approve
// @desc    Approve or reject course
// @access  Private - Admin
router.put('/courses/:id/approve', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.adminApprovalStatus = status;
    if (status === 'approved') {
      course.isPublished = true;
    }

    await course.save();

    res.json({ message: `Course ${status}`, course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/forum-posts
// @desc    Get all forum posts for moderation
// @access  Private - Admin
router.get('/forum-posts', adminAuth, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;

    const posts = await ForumPost.find({ status })
      .populate('authorId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments({ status });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/forum-posts/:id/toggle-status
// @desc    Toggle forum post status (active/archived/locked)
// @access  Private - Admin
router.put('/forum-posts/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'archived', 'locked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = status;
    await post.save();

    res.json({ message: `Post status updated to ${status}`, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/admin/forum-posts/:id
// @desc    Delete forum post
// @access  Private - Admin
router.delete('/forum-posts/:id', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/admin/notifications
// @desc    Send system notification to users
// @access  Private - Admin
router.post('/notifications/send', adminAuth, async (req, res) => {
  try {
    const { title, message, targetUsers, type } = req.body;

    // Create notification for specific users or all users
    let userIds = [];
    
    if (targetUsers === 'all') {
      const users = await User.find({ isActive: true }, '_id');
      userIds = users.map(u => u._id);
    } else if (Array.isArray(targetUsers)) {
      userIds = targetUsers;
    } else {
      return res.status(400).json({ message: 'Invalid targetUsers' });
    }

    // Create notifications
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'admin-announcement'
    }));

    await Notification.insertMany(notifications);

    res.json({ 
      message: `Notifications sent successfully to ${notifications.length} users`,
      count: notifications.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// FORUM MODERATION ROUTES
// ============================================

// @route   GET api/admin/forum/posts
// @desc    Get all forum posts for moderation
// @access  Private - Admin
router.get('/forum/posts', adminAuth, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('authorId', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/admin/forum/posts/:id/moderate
// @desc    Moderate forum post (approve/flag/remove)
// @access  Private - Admin
router.put('/forum/posts/:id/moderate', adminAuth, async (req, res) => {
  try {
    const { status, moderationReason } = req.body;

    if (!['active', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = status;
    if (moderationReason) {
      post.moderationReason = moderationReason;
    }
    post.moderatedBy = req.user.id;
    post.moderatedAt = new Date();

    await post.save();

    // Notify post author if post was flagged or removed
    if (status === 'flagged' || status === 'removed') {
      const notification = new Notification({
        userId: post.authorId,
        title: `Your post has been ${status}`,
        message: moderationReason || `Your post "${post.title}" has been ${status} by a moderator.`,
        type: 'forum-moderation'
      });
      await notification.save();
    }

    res.json({ message: `Post ${status} successfully`, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/admin/forum/posts/:id
// @desc    Delete forum post permanently
// @access  Private - Admin
router.delete('/forum/posts/:id', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/admin/forum/posts/:postId/comments/:commentId
// @desc    Delete forum comment
// @access  Private - Admin
router.delete('/forum/posts/:postId/comments/:commentId', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments = post.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );

    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;