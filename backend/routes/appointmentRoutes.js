const express = require('express');
const { auth } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');

const router = express.Router();

// @route   POST api/appointments/book
// @desc    Book an appointment
// @access  Private
router.post('/book', [auth, validateAppointment], async (req, res) => {
  try {
    const { 
      doctorId, 
      appointmentDate, 
      startTime, 
      endTime, 
      consultationType, 
      reason,
      hospitalId
    } = req.body;

    // Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.adminApprovalStatus !== 'approved') {
      return res.status(400).json({ message: 'Doctor is not approved yet' });
    }

    // Check for conflicting appointments
    const conflict = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ],
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      consultationType,
      reason,
      hospitalId
    });

    await appointment.save();

    // Create notification for patient
    const patientNotification = new Notification({
      userId: req.user.id,
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${doctor.userId.firstName || doctor.userId.username} is confirmed for ${new Date(appointmentDate).toDateString()} at ${startTime}`,
      type: 'appointment-confirmation',
      data: { appointmentId: appointment._id }
    });
    await patientNotification.save();

    // Create notification for doctor
    const doctorNotification = new Notification({
      userId: doctor.userId,
      title: 'New Appointment',
      message: `New appointment booked by ${req.user.firstName || req.user.username} on ${new Date(appointmentDate).toDateString()} at ${startTime}`,
      type: 'appointment-confirmation',
      data: { appointmentId: appointment._id }
    });
    await doctorNotification.save();

    // Send email reminders
    // In a real app, we'd schedule this for 24 hours before
    const patient = await User.findById(req.user.id);
    // await emailService.sendAppointmentReminder(appointment, patient);

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/appointments/my-appointments
// @desc    Get user's appointments
// @access  Private
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const { status, dateRange, page = 1, limit = 10 } = req.query;

    let query = {
      $or: [
        { patientId: req.user.id },
        { doctorId: req.user.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'userId.firstName userId.lastName userId.username')
      .populate('patientId', 'firstName lastName username')
      .populate('hospitalId', 'name address')
      .sort({ appointmentDate: -1, startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'userId.firstName userId.lastName userId.username consultationFee')
      .populate('patientId', 'firstName lastName username')
      .populate('hospitalId', 'name address');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is patient or doctor for this appointment
    if (!appointment.patientId.equals(req.user.id) && 
        !appointment.doctorId.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to cancel (patient or doctor)
    if (!appointment.patientId.equals(req.user.id) && 
        !appointment.doctorId.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Can't cancel completed appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = appointment.patientId.equals(req.user.id) ? 'patient' : 'doctor';
    await appointment.save();

    // Create notifications
    const notification = new Notification({
      userId: appointment.patientId.equals(req.user.id) ? appointment.doctorId.userId : appointment.patientId,
      title: 'Appointment Cancelled',
      message: `Appointment scheduled for ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} has been cancelled by ${appointment.cancelledBy}`,
      type: 'appointment-cancelled',
      data: { appointmentId: appointment._id }
    });
    await notification.save();

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/appointments/:id/confirm
// @desc    Confirm appointment
// @access  Private - Doctor
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only doctor can confirm
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to confirm this appointment' });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/appointments/:id/complete
// @desc    Complete appointment
// @access  Private - Doctor
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { doctorNotes, followUpRequired, followUpDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only doctor can complete
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || !appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'Not authorized to complete this appointment' });
    }

    appointment.status = 'completed';
    appointment.doctorNotes = doctorNotes;
    appointment.followUpRequired = followUpRequired;
    if (followUpDate) appointment.followUpDate = followUpDate;
    appointment.completedAt = Date.now();
    await appointment.save();

    // Update doctor's appointment count
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $inc: { totalAppointments: 1 }
    });

    res.json({ message: 'Appointment completed', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;