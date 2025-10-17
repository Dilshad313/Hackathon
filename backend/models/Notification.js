const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment-reminder', 'prescription-ready', 'assessment-result',
      'course-suggestion', 'appointment-confirmation', 'appointment-cancelled',
      'new-message', 'forum-reply', 'feedback-request', 'payment-reminder',
      'system-alert', 'admin-announcement'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  data: {
    // Additional data related to the notification
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssessmentResult'
    },
    forumPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryMethods: [{
    type: String,
    enum: ['email', 'push', 'sms', 'in-app']
  }],
  scheduledAt: Date,
  sentAt: Date,
  readAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ scheduledAt: 1, isDelivered: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);