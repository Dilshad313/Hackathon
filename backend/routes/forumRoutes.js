const express = require('express');
const { auth } = require('../middleware/auth');
const { ForumPost, Comment } = require('../models/Forum');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/forum/categories
// @desc    Get all forum categories
// @access  Private
router.get('/categories', auth, (req, res) => {
  try {
    const categories = [
      'anxiety', 'depression', 'relationships', 'stress', 'grief', 
      'trauma', 'self-care', 'meditation', 'general', 'support-groups'
    ];
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/forum/posts
// @desc    Get forum posts
// @access  Private
router.get('/posts', auth, async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    let query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('authorId', 'username firstName lastName profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/forum/posts
// @desc    Create a forum post
// @access  Private
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags, isAnonymous } = req.body;

    const post = new ForumPost({
      authorId: req.user.id,
      title,
      content,
      category,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      anonymousAuthorName: isAnonymous ? 'Community Member' : undefined
    });

    await post.save();

    // Populate author info for response
    await post.populate('authorId', 'username firstName lastName profilePicture');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/forum/posts/:id
// @desc    Get forum post by ID
// @access  Private
router.get('/posts/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'username firstName lastName profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'authorId',
          select: 'username firstName lastName profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/forum/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      authorId: req.user.id,
      content,
      isAnonymous: isAnonymous || false,
      anonymousAuthorName: isAnonymous ? 'Community Member' : undefined
    };

    post.comments.push(comment);
    await post.save();

    // Populate the comment for response
    const savedPost = await ForumPost.findById(req.params.id)
      .populate({
        path: 'comments',
        populate: {
          path: 'authorId',
          select: 'username firstName lastName profilePicture'
        }
      });

    // Get the newly added comment
    const newComment = savedPost.comments[savedPost.comments.length - 1];

    // Create notification for post author if it's not their own comment
    if (!post.authorId.equals(req.user.id)) {
      const notification = new Notification({
        userId: post.authorId,
        title: 'New Comment on Your Post',
        message: `Your post "${post.title}" received a new comment.`,
        type: 'forum-reply',
        data: { forumPostId: post._id }
      });
      await notification.save();
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/forum/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.put('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userLiked = post.upvotes.some(like => like.user.toString() === req.user.id);
    
    if (userLiked) {
      // Unlike
      post.upvotes = post.upvotes.filter(like => like.user.toString() !== req.user.id);
    } else {
      // Like
      post.upvotes.push({ user: req.user.id });
      // Remove from dislikes if exists
      post.downvotes = post.downvotes.filter(dislike => dislike.user.toString() !== req.user.id);
    }

    await post.save();

    res.json({ 
      upvotes: post.upvotes.length, 
      downvotes: post.downvotes.length,
      userLiked: !userLiked 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/forum/posts/:id/dislike
// @desc    Dislike/undislike a post
// @access  Private
router.put('/posts/:id/dislike', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userDisliked = post.downvotes.some(dislike => dislike.user.toString() === req.user.id);
    
    if (userDisliked) {
      // Undislike
      post.downvotes = post.downvotes.filter(dislike => dislike.user.toString() !== req.user.id);
    } else {
      // Dislike
      post.downvotes.push({ user: req.user.id });
      // Remove from likes if exists
      post.upvotes = post.upvotes.filter(like => like.user.toString() !== req.user.id);
    }

    await post.save();

    res.json({ 
      upvotes: post.upvotes.length, 
      downvotes: post.downvotes.length,
      userDisliked: !userDisliked 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;