const express = require('express');
const { auth, doctorAuth } = require('../middleware/auth');
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const router = express.Router();

// @route   POST api/consultations/start
// @desc    Start a consultation session
// @access  Private - Doctor
router.post('/start', doctorAuth, async (req, res) => {
  try {
    const { appointmentId, type = 'video' } = req.body;

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to start this consultation' });
    }

    // Check if appointment status allows consultation
    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Appointment must be scheduled or confirmed to start consultation' });
    }

    // Create consultation record
    const consultation = new Consultation({
      appointmentId: appointment._id,
      doctorId: doctor._id,
      patientId: appointment.patientId,
      type,
      status: 'in-progress',
      startTime: new Date()
    });

    await consultation.save();

    // Update appointment status
    appointment.status = 'in-progress';
    await appointment.save();

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/consultations/:id/end
// @desc    End a consultation session
// @access  Private - Doctor
router.put('/:id/end', doctorAuth, async (req, res) => {
  try {
    const { sessionNotes, followUpRequired, followUpNotes } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !consultation.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to end this consultation' });
    }

    // Calculate duration
    const endTime = new Date();
    const duration = Math.round((endTime - consultation.startTime) / 60000); // in minutes

    // Update consultation
    consultation.status = 'completed';
    consultation.endTime = endTime;
    consultation.duration = duration;
    if (sessionNotes) consultation.sessionNotes = sessionNotes;
    if (followUpRequired !== undefined) consultation.followUpRequired = followUpRequired;
    if (followUpNotes) consultation.followUpNotes = followUpNotes;

    await consultation.save();

    // Update appointment status
    const appointment = await Appointment.findById(consultation.appointmentId);
    if (appointment) {
      appointment.status = 'completed';
      appointment.completedAt = new Date();
      if (sessionNotes) appointment.doctorNotes = sessionNotes;
      if (followUpRequired !== undefined) appointment.followUpRequired = followUpRequired;
      await appointment.save();
    }

    res.json({ message: 'Consultation ended successfully', consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/consultations/my-consultations
// @desc    Get doctor's consultations
// @access  Private - Doctor
router.get('/my-consultations', doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { status, dateRange, patientId, page = 1, limit = 10 } = req.query;

    let query = { doctorId: doctor._id };

    if (status) query.status = status;
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (patientId) query.patientId = patientId;

    const consultations = await Consultation.find(query)
      .populate('patientId', 'firstName lastName username')
      .populate('appointmentId', 'appointmentDate startTime reason')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    res.json({
      consultations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/consultations/patient-consultations
// @desc    Get patient's consultations
// @access  Private
router.get('/patient-consultations', auth, async (req, res) => {
  try {
    const { status, dateRange, doctorId, page = 1, limit = 10 } = req.query;

    let query = { patientId: req.user.id };

    if (status) query.status = status;
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (doctorId) query.doctorId = doctorId;

    const consultations = await Consultation.find(query)
      .populate('doctorId', 'userId.firstName userId.lastName')
      .populate('appointmentId', 'appointmentDate startTime reason')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);

    res.json({
      consultations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/consultations/:id
// @desc    Get consultation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('doctorId', 'userId.firstName userId.lastName')
      .populate('patientId', 'firstName lastName username')
      .populate('appointmentId', 'appointmentDate startTime reason');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Check if user is patient or doctor for this consultation
    if (!consultation.patientId.equals(req.user.id) && 
        !consultation.doctorId.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this consultation' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/consultations/:id/update-notes
// @desc    Update consultation notes
// @access  Private - Doctor
router.put('/:id/update-notes', doctorAuth, async (req, res) => {
  try {
    const { sessionNotes, followUpRequired, followUpNotes } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !consultation.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to update this consultation' });
    }

    if (sessionNotes !== undefined) consultation.sessionNotes = sessionNotes;
    if (followUpRequired !== undefined) consultation.followUpRequired = followUpRequired;
    if (followUpNotes !== undefined) consultation.followUpNotes = followUpNotes;

    await consultation.save();

    res.json({ message: 'Consultation notes updated successfully', consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/consultations/generate-ai-notes
// @desc    Generate AI-powered consultation notes
// @access  Private - Doctor
router.post('/generate-ai-notes', doctorAuth, async (req, res) => {
  try {
    const { consultationId, transcript } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !consultation.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to update this consultation' });
    }

    // In a real app, this would call an AI service to generate notes
    // For demo purposes, we'll return a mock response
    const mockAInotes = {
      summary: "Patient presented with symptoms of anxiety. Discussed coping mechanisms and recommended follow-up session.",
      keywords: ["anxiety", "coping", "follow-up", "relaxation"],
      actionItems: ["Schedule follow-up in 2 weeks", "Practice breathing exercises", "Complete mood tracking"],
      moodAnalysis: {
        patientMood: "anxious",
        confidence: 0.85
      }
    };

    consultation.aiNotes = mockAInotes;
    await consultation.save();

    res.json({ aiNotes: mockAInotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;