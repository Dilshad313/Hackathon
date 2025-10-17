const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Course = require('../models/Course');
const { ForumPost } = require('../models/Forum');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private - Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      userCount,
      doctorCount,
      hospitalCount,
      courseCount,
      appointmentCount,
      forumPostCount
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Hospital.countDocuments(),
      Course.countDocuments(),
      Appointment.countDocuments(),
      ForumPost.countDocuments()
    ]);

    const dashboardData = {
      totalUsers: userCount,
      totalDoctors: doctorCount,
      totalHospitals: hospitalCount,
      totalCourses: courseCount,
      totalAppointments: appointmentCount,
      totalForumPosts: forumPostCount,
      recentUsers: await User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt'),
      recentAppointments: await Appointment.find().populate('patientId doctorId').sort({ createdAt: -1 }).limit(5)
    };

    res.json(dashboardData);
  } catch (error) {
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

// @route   GET api/admin/doctors
// @desc    Get all doctors (pending approval)
// @access  Private - Admin
router.get('/doctors', adminAuth, async (req, res) => {
  try {
    const { adminApprovalStatus = 'pending', page = 1, limit = 10 } = req.query;

    const doctors = await Doctor.find({ adminApprovalStatus })
      .populate('userId', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments({ adminApprovalStatus });

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
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

module.exports = router;