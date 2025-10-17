const express = require('express');
const { auth } = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

const router = express.Router();

// @route   POST api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      revieweeId, 
      revieweeType, 
      rating, 
      title, 
      comment, 
      isAnonymous, 
      categories,
      relatedAppointment
    } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the reviewee exists
    let revieweeExists = false;
    if (revieweeType === 'doctor') {
      revieweeExists = await Doctor.findById(revieweeId);
    } else if (revieweeType === 'hospital') {
      revieweeExists = await Hospital.findById(revieweeId);
    }

    if (!revieweeExists) {
      return res.status(404).json({ message: 'Reviewee not found' });
    }

    // If related to an appointment, verify the user was involved
    if (relatedAppointment) {
      const appointment = await Appointment.findById(relatedAppointment);
      if (!appointment || 
          (!appointment.patientId.equals(req.user.id) && 
           !appointment.doctorId.equals(req.user.id))) {
        return res.status(400).json({ message: 'Invalid appointment' });
      }
    }

    // Create feedback
    const feedback = new Feedback({
      reviewerId: req.user.id,
      revieweeId,
      revieweeType,
      rating,
      title,
      comment,
      isAnonymous: isAnonymous || false,
      categories: categories || [],
      relatedAppointment,
      isVerified: !!relatedAppointment // Only verified if linked to appointment
    });

    await feedback.save();

    // Update average rating for the reviewee
    await updateAverageRating(revieweeId, revieweeType);

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/feedback/reviewee/:id
// @desc    Get feedback for a specific reviewee
// @access  Private
router.get('/reviewee/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if reviewee exists
    const doctor = await Doctor.findOne({ userId: id });
    const hospital = await Hospital.findById(id);
    
    if (!doctor && !hospital) {
      return res.status(404).json({ message: 'Reviewee not found' });
    }

    const revieweeType = doctor ? 'doctor' : 'hospital';

    const feedbacks = await Feedback.find({
      revieweeId: id,
      revieweeType
    })
    .populate('reviewerId', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({
      revieweeId: id,
      revieweeType
    });

    // Get average rating
    const avgRating = await Feedback.aggregate([
      { $match: { revieweeId: id, revieweeType } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingInfo = avgRating[0] || { average: 0, count: 0 };

    res.json({
      feedbacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averageRating: ratingInfo.average,
      ratingCount: ratingInfo.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/feedback/my-feedback
// @desc    Get feedback submitted by user
// @access  Private
router.get('/my-feedback', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feedbacks = await Feedback.find({
      reviewerId: req.user.id
    })
    .populate('revieweeId', 'firstName lastName username name') // Will populate doctor/hospital name
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({
      reviewerId: req.user.id
    });

    res.json({
      feedbacks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/feedback/:id/helpful
// @desc    Mark feedback as helpful
// @access  Private
router.put('/:id/helpful', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user already voted
    const userVote = feedback.helpfulVotes.find(vote => 
      vote.user.toString() === req.user.id
    );
    
    if (userVote) {
      // Remove vote if already voted
      feedback.helpfulVotes = feedback.helpfulVotes.filter(vote => 
        vote.user.toString() !== req.user.id
      );
      feedback.helpfulCount = Math.max(0, feedback.helpfulCount - 1);
    } else {
      // Add vote
      feedback.helpfulVotes.push({ user: req.user.id });
      feedback.helpfulCount += 1;
    }

    await feedback.save();

    res.json({ 
      message: userVote ? 'Vote removed' : 'Vote added',
      helpfulCount: feedback.helpfulCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/feedback/doctor/:doctorId
// @desc    Get feedback for a doctor
// @access  Private
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const feedbacks = await Feedback.find({
      revieweeId: doctor.userId,
      revieweeType: 'doctor'
    })
    .populate('reviewerId', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = await Feedback.aggregate([
      { $match: { revieweeId: doctor.userId, revieweeType: 'doctor' } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingInfo = avgRating[0] || { average: 0, count: 0 };

    res.json({
      feedbacks,
      averageRating: ratingInfo.average,
      ratingCount: ratingInfo.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update average rating
async function updateAverageRating(revieweeId, revieweeType) {
  try {
    const avgRating = await Feedback.aggregate([
      { $match: { revieweeId, revieweeType } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingInfo = avgRating[0] || { average: 0, count: 0 };

    if (revieweeType === 'doctor') {
      await Doctor.findByIdAndUpdate(
        revieweeId,
        { 
          $set: { 
            'rating.average': parseFloat(ratingInfo.average.toFixed(1)),
            'rating.count': ratingInfo.count 
          }
        }
      );
    } else if (revieweeType === 'hospital') {
      await Hospital.findByIdAndUpdate(
        revieweeId,
        { 
          $set: { 
            'rating.average': parseFloat(ratingInfo.average.toFixed(1)),
            'rating.count': ratingInfo.count 
          }
        }
      );
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
}

module.exports = router;