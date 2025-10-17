const express = require('express');
const { auth, doctorAuth, adminAuth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/doctors
// @desc    Get all doctors (public)
// @access  Public (after authentication)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, location, rating } = req.query;

    let query = { adminApprovalStatus: 'approved', isAvailable: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    // Note: Location filtering would require geospatial indexing not implemented here

    const doctors = await Doctor.find(query)
      .populate('userId', 'username firstName lastName email profilePicture')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

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

// @route   GET api/doctors/:id
// @desc    Get doctor by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'username firstName lastName email profilePicture')
      .populate('hospitalAffiliations.hospitalId', 'name');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.adminApprovalStatus !== 'approved') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/doctors
// @desc    Create a new doctor profile (for users who registered as doctor)
// @access  Private (only for users with doctor role)
router.post('/', doctorAuth, async (req, res) => {
  try {
    // Check if user already has a doctor profile
    const existingDoctor = await Doctor.findOne({ userId: req.user.id });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    // Check if user is actually a doctor role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only users with doctor role can create doctor profiles' });
    }

    const {
      licenseNumber,
      specialization,
      qualifications,
      yearsOfExperience,
      bio,
      consultationFee,
      languages,
      hospitalAffiliations,
      availability,
      consultationTypes,
      workingHours,
      emergencyContact
    } = req.body;

    // Create new doctor
    const newDoctor = new Doctor({
      userId: req.user.id,
      licenseNumber,
      specialization,
      qualifications: qualifications || [],
      yearsOfExperience: yearsOfExperience || 0,
      bio: bio || '',
      consultationFee: consultationFee || { amount: 0, currency: 'USD' },
      languages: languages || [],
      hospitalAffiliations: hospitalAffiliations || [],
      availability: availability || {},
      consultationTypes: consultationTypes || ['video'],
      workingHours: workingHours || { startTime: '09:00', endTime: '17:00' },
      emergencyContact: emergencyContact || {}
    });

    // Save the doctor profile
    await newDoctor.save();

    // Update user role to doctor if it's not already set properly
    await User.findByIdAndUpdate(req.user.id, { role: 'doctor' });

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor: newDoctor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/doctors/profile
// @desc    Update doctor profile
// @access  Private - Doctor
router.put('/profile', doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Update fields
    const updateFields = [
      'licenseNumber', 'specialization', 'qualifications', 'yearsOfExperience',
      'bio', 'consultationFee', 'languages', 'hospitalAffiliations',
      'availability', 'consultationTypes', 'workingHours', 'emergencyContact'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    await doctor.save();

    res.json({
      message: 'Doctor profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/doctors/my-profile
// @desc    Get logged-in doctor's profile
// @access  Private - Doctor
router.get('/my-profile', doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'username firstName lastName email profilePicture');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/doctors/availability/:id
// @desc    Get doctor's availability
// @access  Private
router.get('/availability/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.adminApprovalStatus !== 'approved') {
      return res.status(400).json({ message: 'Doctor is not approved' });
    }

    res.json({
      availability: doctor.availability,
      workingHours: doctor.workingHours
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/doctors/search
// @desc    Search for doctors
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      specialization, 
      location, 
      rating,
      consultationType 
    } = req.query;

    let query = { adminApprovalStatus: 'approved', isAvailable: true };

    if (search) {
      const userQuery = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      };
      
      const users = await User.find(userQuery, '_id');
      const userIds = users.map(user => user._id);
      
      query.userId = { $in: userIds };
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    if (consultationType) {
      query.consultationTypes = { $in: [consultationType] };
    }

    // Location-based search would require geospatial indexing (not implemented here)

    const doctors = await Doctor.find(query)
      .populate('userId', 'username firstName lastName profilePicture')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

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

// @route   GET api/doctors/appointments/:id
// @desc    Get doctor's appointments (for doctors and admins)
// @access  Private - Doctor or Admin
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (req.user.role === 'doctor' && !doctor.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view these appointments' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName username')
      .sort({ appointmentDate: 1, startTime: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;