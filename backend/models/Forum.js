const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  authorId: {
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
  category: {
    type: String,
    required: true,
    enum: [
      'anxiety', 'depression', 'relationships', 'stress', 'grief', 
      'trauma', 'self-care', 'meditation', 'general', 'support-groups'
    ]
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'archived', 'locked'],
    default: 'active'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // For moderation
  },
  anonymousAuthorName: {
    type: String,
    default: 'Community Member'
  },
  relatedAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentResult'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, {
  timestamps: true
});

// Replies/Comments sub-schema
const commentSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId, // For nested comments
    refPath: 'parentModel'
  },
  parentModel: {
    type: String,
    enum: ['ForumPost', 'Comment'] // For polymorphic references
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousAuthorName: {
    type: String,
    default: 'Community Member'
  }
}, {
  timestamps: true
});

forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ authorId: 1, createdAt: -1 });
forumPostSchema.index({ createdAt: -1 });

// Add comments to forum posts
forumPostSchema.add({
  comments: [commentSchema]
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = { ForumPost, Comment };