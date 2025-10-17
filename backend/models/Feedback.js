const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Could be doctor or patient
    required: true
  },
  revieweeType: {
    type: String,
    enum: ['doctor', 'hospital', 'service'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 200
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  categories: [{
    type: String,
    enum: ['communication', 'punctuality', 'knowledge', 'empathy', 'effectiveness', 'facilities', 'staff']
  }],
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  isVerified: {
    type: Boolean,
    default: false // Verified by completing an appointment
  }
}, {
  timestamps: true
});

// Index for efficient querying
feedbackSchema.index({ revieweeId: 1, createdAt: -1 });
feedbackSchema.index({ revieweeId: 1, revieweeType: 1 });
feedbackSchema.index({ reviewerId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);