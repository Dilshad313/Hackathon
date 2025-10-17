const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'anxiety', 'depression', 'stress-management', 'mindfulness', 
      'cognitive-behavioral', 'relationships', 'grief', 'self-care', 
      'trauma-recovery', 'sleep', 'anger-management', 'general-wellness'
    ]
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  thumbnail: String,
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Could be a doctor or wellness expert
  },
  instructorName: {
    type: String,
    required: true
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    content: {
      type: String,
      required: true // Could be markdown or HTML content
    },
    videoUrl: String,
    duration: Number, // in minutes
    order: Number
  }],
  prerequisites: [String],
  learningObjectives: [String],
  materials: [String], // Additional materials/resources
  assessments: [{
    title: String,
    type: String, // quiz, assignment, reflection
    questions: [{
      question: String,
      options: [String],
      correctAnswer: String,
      type: { type: String, enum: ['multiple-choice', 'true-false', 'essay'] }
    }]
  }],
  relatedAssessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentResult'
  }],
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  price: {
    amount: Number,
    currency: String
  },
  adminApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  tags: [String]
}, {
  timestamps: true
});

// Enrollment sub-schema
const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0, // Percentage completed
    min: 0,
    max: 100
  },
  completedModules: [{
    moduleId: String, // Module ID from course.modules
    completedAt: Date
  }],
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateUrl: String
  },
  lastAccessed: Date,
  completionDate: Date,
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'dropped'],
    default: 'enrolled'
  }
}, {
  timestamps: true
});

courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ instructorId: 1, createdAt: -1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = { Course, Enrollment };