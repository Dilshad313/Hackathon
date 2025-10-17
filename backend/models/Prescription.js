const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    instructions: String,
    refills: {
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date
  }],
  diagnosis: {
    type: String,
    required: true
  },
  additionalNotes: String,
  status: {
    type: String,
    enum: ['active', 'refilled', 'expired', 'cancelled'],
    default: 'active'
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiresDate: Date,
  isDownloaded: {
    type: Boolean,
    default: false
  },
  isPrinted: {
    type: Boolean,
    default: false
  },
  pdfUrl: String, // URL to stored PDF
  refillsRemaining: {
    type: Number,
    default: 0
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  }
}, {
  timestamps: true
});

// Index for efficient querying
prescriptionSchema.index({ patientId: 1, issuedDate: -1 });
prescriptionSchema.index({ doctorId: 1, issuedDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);