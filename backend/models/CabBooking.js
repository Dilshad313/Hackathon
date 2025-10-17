const mongoose = require('mongoose');

const cabBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  dropoffLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  bookingType: {
    type: String,
    enum: ['to-appointment', 'from-appointment', 'to-pharmacy', 'from-pharmacy', 'other'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  estimatedFare: {
    amount: Number,
    currency: String
  },
  actualFare: {
    amount: Number,
    currency: String
  },
  driverInfo: {
    name: String,
    phone: String,
    licensePlate: String,
    rating: Number
  },
  vehicleInfo: {
    type: String,
    make: String,
    model: String,
    color: String
  },
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'driver-assigned', 'in-progress', 'completed', 'cancelled', 'no-drivers-found'],
    default: 'requested'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'wallet', 'insurance']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  otp: String, // For driver verification
  trackingUrl: String, // For real-time tracking
  estimatedArrival: Date, // Estimated arrival time of cab
  actualPickupTime: Date,
  actualDropoffTime: Date,
  specialRequests: String,
  cancellationReason: String,
  cancellationFee: {
    amount: Number,
    currency: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
cabBookingSchema.index({ userId: 1, createdAt: -1 });
cabBookingSchema.index({ status: 1, scheduledTime: 1 });
cabBookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('CabBooking', cabBookingSchema);