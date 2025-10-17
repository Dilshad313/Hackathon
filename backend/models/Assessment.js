const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['PHQ-9', 'GAD-7', 'DASS-21', 'PCL-5', 'other'],
    required: true
  },
  assessmentName: {
    type: String,
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['normal', 'mild', 'moderate', 'severe', 'extremely-severe']
  },
  answers: [{
    questionId: String,
    questionText: String,
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, or object
    score: Number
  }],
  interpretation: {
    type: String,
    maxlength: 1000
  },
  recommendations: [String],
  completedAt: {
    type: Date,
    default: Date.now
  },
  relatedCourseIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  relatedDoctorSpecializations: [String]
}, {
  timestamps: true
});

// Index for efficient querying
assessmentResultSchema.index({ userId: 1, completedAt: -1 });
assessmentResultSchema.index({ assessmentType: 1, completedAt: -1 });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);