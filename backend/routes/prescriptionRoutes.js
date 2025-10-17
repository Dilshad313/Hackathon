const express = require('express');
const { auth, doctorAuth } = require('../middleware/auth');
const { validatePrescription } = require('../middleware/validation');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const emailService = require('../utils/emailService');

const router = express.Router();

// @route   POST api/prescriptions/create
// @desc    Create a prescription
// @access  Private - Doctor role
router.post('/create', [doctorAuth, validatePrescription], async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications } = req.body;

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to create prescription for this appointment' });
    }

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      doctorId: doctor._id,
      patientId: appointment.patientId,
      diagnosis,
      medications,
      refillsRemaining: medications.reduce((sum, med) => sum + med.refills, 0)
    });

    await prescription.save();

    // Update appointment to mark as having prescription
    await Appointment.findByIdAndUpdate(appointmentId, {
      $set: { prescriptionGenerated: true }
    });

    // Create notification for patient
    const patient = await User.findById(appointment.patientId);
    const notification = new Notification({
      userId: appointment.patientId,
      title: 'New Prescription Available',
      message: `A new prescription has been created for your appointment with Dr. ${doctor.userId.firstName || doctor.userId.username}.`,
      type: 'prescription-ready',
      data: { prescriptionId: prescription._id }
    });
    await notification.save();

    // Send email notification
    // await emailService.sendPrescriptionReady(prescription, patient);

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/prescriptions/my-prescriptions
// @desc    Get user's prescriptions
// @access  Private
router.get('/my-prescriptions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { patientId: req.user.id };

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'userId.firstName userId.lastName')
      .populate('appointmentId', 'appointmentDate startTime')
      .sort({ issuedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/prescriptions/doctor-prescriptions
// @desc    Get doctor's prescriptions
// @access  Private - Doctor role
router.get('/doctor-prescriptions', doctorAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { page = 1, limit = 10, patientId } = req.query;

    let query = { doctorId: doctor._id };

    if (patientId) {
      query.patientId = patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'firstName lastName username')
      .populate('appointmentId', 'appointmentDate startTime')
      .sort({ issuedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'userId.firstName userId.lastName')
      .populate('patientId', 'firstName lastName username')
      .populate('appointmentId', 'appointmentDate startTime reason');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user is patient or doctor for this prescription
    if (!prescription.patientId.equals(req.user.id) && 
        !prescription.doctorId.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/prescriptions/:id/refill
// @desc    Request prescription refill
// @access  Private - Patient role
router.put('/:id/refill', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only patient can request refill
    if (!prescription.patientId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to refill this prescription' });
    }

    // Check if refills are available
    if (prescription.refillsRemaining <= 0) {
      return res.status(400).json({ message: 'No refills remaining for this prescription' });
    }

    // Update refill count
    prescription.refillsRemaining -= 1;
    await prescription.save();

    // Create notification for doctor
    const notification = new Notification({
      userId: prescription.doctorId.userId,
      title: 'Prescription Refill Request',
      message: `${req.user.firstName || req.user.username} has requested a refill for prescription: ${prescription.medications[0].name}`,
      type: 'prescription-refill',
      data: { prescriptionId: prescription._id }
    });
    await notification.save();

    res.json({ 
      message: 'Refill request submitted successfully', 
      prescription,
      refillsRemaining: prescription.refillsRemaining 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/prescriptions/:id/status
// @desc    Update prescription status
// @access  Private - Doctor role
router.put('/:id/status', doctorAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only doctor who created the prescription can update status
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !prescription.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }

    prescription.status = status;
    await prescription.save();

    res.json({ message: 'Prescription status updated', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/prescriptions/:id/download
// @desc    Generate and download prescription PDF
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'userId.firstName userId.lastName licenseNumber')
      .populate('patientId', 'firstName lastName dateOfBirth gender')
      .populate('appointmentId', 'appointmentDate');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user is patient or doctor for this prescription
    if (!prescription.patientId.equals(req.user.id) && 
        !prescription.doctorId.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to download this prescription' });
    }

    // In a real app, we would generate a PDF here
    // For now, we'll just return a mock PDF response
    
    // Update download count
    prescription.isDownloaded = true;
    await prescription.save();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    // Send mock PDF content (in a real app, this would be actual PDF content)
    res.send(Buffer.from('Mock prescription PDF content', 'utf-8'));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;