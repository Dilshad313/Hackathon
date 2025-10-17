const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  mood: {
    type: String,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired']
  },
  tags: [String],
  sharedWithDoctor: {
    type: Boolean,
    default: false
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  emotions: [{
    emotion: String,
    intensity: { type: Number, min: 1, max: 5 } // 1-5 scale
  }],
  gratitude: [{
    gratitudeItem: String,
    gratitudeLevel: { type: Number, min: 1, max: 5 } // 1-5 scale
  }],
  activities: [String], // Activities done during the day
  triggers: [String], // Things that triggered certain emotions
  copingStrategies: [String], // Strategies used to cope
  relatedAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentResult'
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, {
  timestamps: true
});

// Index for efficient querying
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });
journalEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);