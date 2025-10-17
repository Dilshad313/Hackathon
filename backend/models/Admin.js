const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super-admin', 'moderator', 'content-manager', 'support-agent'],
    required: true
  },
  permissions: [{
    resource: String,
    actions: [String] // ['create', 'read', 'update', 'delete']
  }],
  lastLoginAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  assignedSections: [String] // Which sections they manage: ['doctors', 'hospitals', 'courses', 'forum', etc.]
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);