const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
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
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  meetingUrl: String,
  meetingPassword: String,
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'missed', 'cancelled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person'],
    required: true
  },
  platform: {
    type: String,
    enum: ['webrtc', 'zoom', 'teams', 'phone', 'in-person'],
    default: 'webrtc'
  },
  recordingUrl: String,
  isRecorded: {
    type: Boolean,
    default: false
  },
  sessionNotes: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  patientFeedbackRequested: {
    type: Boolean,
    default: false
  },
  aiNotes: {
    // AI-generated notes from the consultation
    summary: String,
    keywords: [String],
    actionItems: [String],
    moodAnalysis: {
      patientMood: String,
      confidence: Number
    }
  },
  transcript: String, // Chat transcript for text consultations
  attachments: [{
    name: String,
    url: String,
    type: String, // image, document, etc.
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

// Index for efficient querying
consultationSchema.index({ appointmentId: 1 });
consultationSchema.index({ doctorId: 1, createdAt: -1 });
consultationSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);