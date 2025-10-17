const express = require('express');
const { auth } = require('../middleware/auth');
const CabBooking = require('../models/CabBooking');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   POST api/cab/book
// @desc    Book a cab
// @access  Private
router.post('/book', auth, async (req, res) => {
  try {
    const { 
      pickupLocation, 
      dropoffLocation, 
      bookingType, 
      scheduledTime,
      appointmentId,
      hospitalId,
      doctorId
    } = req.body;

    // Validate required fields
    if (!pickupLocation.address || !dropoffLocation.address) {
      return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
    }

    // If booking type is related to appointment, verify appointment exists
    if (bookingType.includes('appointment') && appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || !appointment.patientId.equals(req.user.id)) {
        return res.status(400).json({ message: 'Invalid appointment' });
      }
    }

    // Create cab booking
    const cabBooking = new CabBooking({
      userId: req.user.id,
      pickupLocation,
      dropoffLocation,
      bookingType,
      scheduledTime: new Date(scheduledTime),
      appointmentId,
      hospitalId,
      doctorId
    });

    await cabBooking.save();

    // Create notification for user
    const notification = new Notification({
      userId: req.user.id,
      title: 'Cab Booking Confirmed',
      message: `Your cab has been booked for ${new Date(scheduledTime).toLocaleString()}`,
      type: 'appointment-confirmation',
      data: { cabBookingId: cabBooking._id }
    });
    await notification.save();

    res.status(201).json(cabBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/cab/my-bookings
// @desc    Get user's cab bookings
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, dateRange, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };

    if (status) {
      query.status = status;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.scheduledTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await CabBooking.find(query)
      .sort({ scheduledTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CabBooking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/cab/:id
// @desc    Get cab booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await CabBooking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Cab booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/cab/:id/cancel
// @desc    Cancel cab booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await CabBooking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Cab booking not found' });
    }

    // Can't cancel completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.json({ message: 'Cab booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/cab/:id/rate
// @desc    Rate the cab service
// @access  Private
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await CabBooking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Cab booking not found' });
    }

    // Can only rate completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.rating = rating;
    booking.feedback = feedback;
    await booking.save();

    res.json({ message: 'Rating submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/cab/estimate
// @desc    Get fare estimate
// @access  Private
router.post('/estimate', auth, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;

    // In a real app, this would call a cab service API
    // For demo purposes, we'll generate a random fare
    const distance = calculateDistance(pickupLocation, dropoffLocation);
    const estimate = {
      distance: distance.toFixed(2) + ' km',
      duration: Math.round(distance * 3) + ' mins', // approx 3 mins per km
      fare: {
        amount: parseFloat((distance * 2.5).toFixed(2)), // $2.5 per km
        currency: 'USD'
      }
    };

    res.json(estimate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate distance (simplified)
function calculateDistance(loc1, loc2) {
  // This is a simplified calculation - in a real app, use a proper geolocation service
  return Math.sqrt(
    Math.pow(loc2.coordinates[0] - loc1.coordinates[0], 2) +
    Math.pow(loc2.coordinates[1] - loc1.coordinates[1], 2)
  ) * 100; // Convert to km approximation
}

module.exports = router;