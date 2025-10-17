const mongoose = require('mongoose');

const aiChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  botType: {
    type: String,
    enum: ['neha', 'gemini'],
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sentiment: {
      // Emotional analysis of user input
      score: Number,
      label: String // positive, negative, neutral
    }
  }],
  context: {
    // Context for ongoing conversations
    currentMood: String,
    recentAssessments: [{
      assessmentType: String,
      score: Number,
      date: Date
    }],
    recentAppointments: [{
      appointmentId: mongoose.Schema.Types.ObjectId,
      date: Date,
      doctor: String
    }],
    preferences: {
      preferredBot: String,
      privacyLevel: String
    }
  },
  isSensitive: {
    type: Boolean,
    default: false
  },
  tags: [String], // For categorizing conversations
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
aiChatHistorySchema.index({ userId: 1, sessionId: 1 });
aiChatHistorySchema.index({ userId: 1, createdAt: -1 });
aiChatHistorySchema.index({ botType: 1, createdAt: -1 });

module.exports = mongoose.model('AIChatHistory', aiChatHistorySchema);