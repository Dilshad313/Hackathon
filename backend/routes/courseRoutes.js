const express = require('express');
const { auth } = require('../middleware/auth');
const { Course, Enrollment } = require('../models/Course');
const AssessmentResult = require('../models/Assessment');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      level, 
      search, 
      isPublished, 
      adminApprovalStatus,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (adminApprovalStatus) query.adminApprovalStatus = adminApprovalStatus;

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

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

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'username firstName lastName profilePicture');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });

    const result = {
      ...course.toObject(),
      isEnrolled: !!enrollment,
      enrollmentProgress: enrollment ? enrollment.progress : 0
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId: req.user.id,
      courseId: course._id
    });

    await enrollment.save();

    // Update course enrolled count
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    // Create notification
    const notification = new Notification({
      userId: req.user.id,
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      type: 'course-suggestion',
      data: { courseId: course._id }
    });
    await notification.save();

    res.status(201).json({ message: 'Successfully enrolled', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/courses/my-enrollments
// @desc    Get user's course enrollments
// @access  Private
router.get('/my-enrollments', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };

    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate('courseId', 'title description thumbnail duration instructorName')
      .sort({ enrollmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    res.json({
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/courses/:id/progress
// @desc    Get user's progress in course
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    res.json({
      progress: enrollment.progress,
      completedModules: enrollment.completedModules,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/courses/:id/progress
// @desc    Update user's progress in course
// @access  Private
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { moduleId, progress } = req.body;

    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    if (progress !== undefined) {
      enrollment.progress = Math.max(0, Math.min(100, progress)); // Ensure progress is between 0-100
    }

    if (moduleId) {
      const moduleExists = enrollment.completedModules.some(m => m.moduleId === moduleId);
      if (!moduleExists) {
        enrollment.completedModules.push({
          moduleId,
          completedAt: new Date()
        });
      }
    }

    // Update progress percentage based on completed modules
    if (moduleId) {
      const course = await Course.findById(req.params.id);
      if (course && course.modules) {
        enrollment.progress = Math.round(
          (enrollment.completedModules.length / course.modules.length) * 100
        );
      }
    }

    // Update status based on progress
    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    } else if (enrollment.progress > 0) {
      enrollment.status = 'in-progress';
    }

    await enrollment.save();

    res.json({ message: 'Progress updated', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/courses/recommendations
// @desc    Get course recommendations based on user's assessments
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's recent assessments
    const assessments = await AssessmentResult.find({ 
      userId: req.user.id 
    }).sort({ completedAt: -1 }).limit(5);

    if (assessments.length === 0) {
      // If no assessments, return popular courses
      const courses = await Course.find({ 
        isPublished: true, 
        adminApprovalStatus: 'approved' 
      })
      .sort({ enrolledCount: -1 })
      .limit(6);
      
      return res.json({ recommendations: courses });
    }

    // Get category from most recent assessment
    const primaryAssessment = assessments[0];
    let category;
    
    switch(primaryAssessment.assessmentType) {
      case 'PHQ-9':
        category = 'depression';
        break;
      case 'GAD-7':
        category = 'anxiety';
        break;
      case 'DASS-21':
        category = 'stress';
        break;
      default:
        category = 'general-wellness';
    }

    // Find courses in the relevant category
    const recommendations = await Course.find({
      category,
      isPublished: true,
      adminApprovalStatus: 'approved'
    }).limit(6);

    res.json({ recommendations, primaryAssessment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;