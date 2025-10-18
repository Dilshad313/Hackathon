const express = require('express');
const { auth } = require('../middleware/auth');
const AssessmentResult = require('../models/Assessment');
const { Course } = require('../models/Course');
const emailService = require('../utils/emailService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

// @route   GET api/assessments/types
// @desc    Get available assessment types
// @access  Private
router.get('/types', auth, (req, res) => {
  try {
    const assessmentTypes = [
      {
        type: 'PHQ-9',
        name: 'Patient Health Questionnaire',
        description: 'Depression screening tool',
        questions: 9,
        maxScore: 27
      },
      {
        type: 'GAD-7',
        name: 'Generalized Anxiety Disorder',
        description: 'Anxiety screening tool',
        questions: 7,
        maxScore: 21
      },
      {
        type: 'DASS-21',
        name: 'Depression, Anxiety and Stress Scales',
        description: 'Combined emotional states assessment',
        questions: 21,
        maxScore: 63
      },
      {
        type: 'PCL-5',
        name: 'PTSD Checklist',
        description: 'Post-traumatic stress disorder screening',
        questions: 20,
        maxScore: 80
      }
    ];

    res.json(assessmentTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/assessments/submit
// @desc    Submit assessment answers
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    console.log('=== Assessment Submission Started ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { assessmentType, assessmentName, answers } = req.body;

    if (!assessmentType || !answers || !Array.isArray(answers) || answers.length === 0) {
      console.log('Validation failed: Invalid assessment data');
      return res.status(400).json({ message: 'Invalid assessment data' });
    }

    console.log('Assessment type:', assessmentType);
    console.log('Number of answers:', answers.length);

    // Calculate total score based on answers
    let totalScore = 0;
    answers.forEach(answer => {
      if (typeof answer.score === 'number') {
        totalScore += answer.score;
      }
    });
    
    console.log('Total score calculated:', totalScore);

    // Determine severity based on assessment type and score
    let severity = 'normal';
    let maxScore = 0;

    switch (assessmentType) {
      case 'PHQ-9':
        maxScore = 27;
        if (totalScore >= 20) severity = 'severe';
        else if (totalScore >= 15) severity = 'moderate';
        else if (totalScore >= 10) severity = 'mild';
        break;
      case 'GAD-7':
        maxScore = 21;
        if (totalScore >= 15) severity = 'severe';
        else if (totalScore >= 10) severity = 'moderate';
        else if (totalScore >= 5) severity = 'mild';
        break;
      case 'DASS-21':
        maxScore = 63;
        if (totalScore >= 30) severity = 'severe';
        else if (totalScore >= 20) severity = 'moderate';
        else if (totalScore >= 10) severity = 'mild';
        break;
      default:
        maxScore = answers.length * 4; // assuming 0-4 scale
    }

    // Define interpretation based on severity
    let interpretation = '';
    let recommendations = [];

    switch (severity) {
      case 'normal':
        interpretation = 'Your responses suggest minimal symptoms. Continue maintaining good mental health practices.';
        recommendations = [
          'Practice regular self-care',
          'Maintain social connections',
          'Engage in physical activity',
          'Consider stress management techniques'
        ];
        break;
      case 'mild':
        interpretation = 'Your responses indicate mild symptoms that may benefit from support and intervention.';
        recommendations = [
          'Consider speaking with a mental health professional',
          'Explore self-help resources and courses',
          'Practice relaxation techniques',
          'Maintain healthy sleep and diet habits'
        ];
        break;
      case 'moderate':
        interpretation = 'Your responses suggest moderate symptoms that would likely benefit from professional support.';
        recommendations = [
          'Strongly consider consulting with a mental health professional',
          'Explore therapy options',
          'Join support groups',
          'Consider online counseling services'
        ];
        break;
      case 'severe':
        interpretation = 'Your responses indicate significant symptoms that warrant immediate professional attention.';
        recommendations = [
          'Seek immediate professional mental health support',
          'Contact a crisis helpline if needed',
          'Consider scheduling an appointment with a mental health professional',
          'Reach out to trusted friends or family members'
        ];
        break;
    }

    // Generate AI-powered personalized recommendations
    console.log('Generating AI recommendations...');
    let aiRecommendations = [];
    try {
      const answersSummary = answers.map((a, i) => `Q${i + 1}: ${a.questionText} - ${a.answer} (Score: ${a.score})`).join('\n');
      
      const recommendationPrompt = `You are a compassionate mental health AI assistant. A user just completed a ${assessmentName} assessment.

Assessment Results:
- Type: ${assessmentType}
- Total Score: ${totalScore}/${maxScore}
- Severity: ${severity}
- Answers:
${answersSummary}

Based on these specific responses, provide 5-7 personalized, actionable recommendations. Be:
1. Specific to their answers (not generic)
2. Supportive and encouraging
3. Practical and actionable
4. Appropriate for ${severity} severity level

Format as a simple numbered list. Keep each recommendation to 1-2 sentences.`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp"
      });

      const result = await model.generateContent(recommendationPrompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      // Parse AI response into array of recommendations
      aiRecommendations = aiResponse
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./)) // Lines starting with numbers
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
        .filter(line => line.length > 0);
      
      console.log('AI recommendations generated:', aiRecommendations.length);
      
      // Combine basic recommendations with AI recommendations
      if (aiRecommendations.length > 0) {
        recommendations = [...aiRecommendations, ...recommendations];
      }
    } catch (aiError) {
      console.log('AI recommendations failed, using basic recommendations:', aiError.message);
      // Continue with basic recommendations if AI fails
    }

    // Create assessment result
    console.log('Creating assessment result with data:', {
      userId: req.user.id,
      assessmentType,
      assessmentName,
      totalScore,
      maxScore,
      severity,
      answersCount: answers.length,
      recommendationsCount: recommendations.length
    });
    
    const assessmentResult = new AssessmentResult({
      userId: req.user.id,
      assessmentType,
      assessmentName,
      totalScore,
      maxScore,
      severity,
      answers,
      interpretation,
      recommendations
    });

    console.log('Attempting to save assessment...');
    await assessmentResult.save();
    console.log('Assessment saved successfully!');
    
    console.log('Assessment saved successfully:', assessmentResult._id);

    // Find relevant courses based on assessment results (optional - don't fail if courses don't exist)
    let relatedCourses = [];
    try {
      switch (assessmentType) {
        case 'PHQ-9':
          relatedCourses = await Course.find({
            category: 'depression',
            isPublished: true,
            adminApprovalStatus: 'approved'
          }).limit(3);
          break;
        case 'GAD-7':
          relatedCourses = await Course.find({
            category: 'anxiety',
            isPublished: true,
            adminApprovalStatus: 'approved'
          }).limit(3);
          break;
        default:
          relatedCourses = await Course.find({
            isPublished: true,
            adminApprovalStatus: 'approved'
          }).limit(3);
      }

      // Link courses to assessment
      if (relatedCourses.length > 0) {
        assessmentResult.relatedCourseIds = relatedCourses.map(course => course._id);
        await assessmentResult.save();
      }
    } catch (courseError) {
      console.log('Could not fetch related courses:', courseError.message);
      // Continue without courses
    }

    // Create notification for user (optional - don't fail if notification fails)
    try {
      const Notification = require('../models/Notification');
      const notification = new Notification({
        userId: req.user.id,
        title: 'Assessment Results Ready',
        message: `Your ${assessmentName} results are ready. Your score indicates ${severity} symptoms.`,
        type: 'assessment-result',
        data: { assessmentId: assessmentResult._id }
      });
      await notification.save();
    } catch (notificationError) {
      console.log('Could not create notification:', notificationError.message);
      // Continue without notification
    }

    res.status(201).json({
      ...assessmentResult.toObject(),
      relatedCourses
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/assessments/my-results
// @desc    Get user's assessment results
// @access  Private
router.get('/my-results', auth, async (req, res) => {
  try {
    const { assessmentType, dateRange, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };

    if (assessmentType) {
      query.assessmentType = assessmentType;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const results = await AssessmentResult.find(query)
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssessmentResult.countDocuments(query);

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/assessments/trends
// @desc    Get assessment trends for user
// @access  Private
router.get('/trends', auth, async (req, res) => {
  try {
    // Get last 6 months of assessments
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const results = await AssessmentResult.find({
      userId: req.user.id,
      completedAt: { $gte: sixMonthsAgo }
    }).sort({ completedAt: 1 });

    // Group by assessment type and calculate trends
    const trends = {};
    results.forEach(result => {
      if (!trends[result.assessmentType]) {
        trends[result.assessmentType] = [];
      }
      trends[result.assessmentType].push({
        date: result.completedAt,
        score: result.totalScore,
        severity: result.severity
      });
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/assessments/questions/:type
// @desc    Get questions for specific assessment type
// @access  Private
router.get('/questions/:type', auth, (req, res) => {
  try {
    const assessmentType = req.params.type;
    let questions = [];
    let name = '';

    switch (assessmentType) {
      case 'PHQ-9':
        name = 'Patient Health Questionnaire (PHQ-9)';
        questions = [
          { id: '1', text: 'Little interest or pleasure in doing things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '2', text: 'Feeling down, depressed, or hopeless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '3', text: 'Trouble falling or staying asleep, or sleeping too much', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '4', text: 'Feeling tired or having little energy', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '5', text: 'Poor appetite or overeating', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '6', text: 'Feeling bad about yourself - or that you are a failure', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '7', text: 'Trouble concentrating on things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '8', text: 'Moving or speaking so slowly that other people could have noticed', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '9', text: 'Thoughts that you would be better off dead', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
        ];
        break;
        
      case 'GAD-7':
        name = 'Generalized Anxiety Disorder (GAD-7)';
        questions = [
          { id: '1', text: 'Feeling nervous, anxious, or on edge', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '2', text: 'Not being able to stop or control worrying', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '3', text: 'Worrying too much about different things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '4', text: 'Trouble relaxing', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '5', text: 'Being so restless that it is hard to sit still', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '6', text: 'Becoming easily annoyed or irritable', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
          { id: '7', text: 'Feeling afraid as if something awful might happen', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
        ];
        break;

      default:
        return res.status(400).json({ message: 'Invalid assessment type' });
    }

    res.json({ type: assessmentType, name, questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/assessments/:id
// @desc    Get assessment result by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await AssessmentResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Assessment result not found' });
    }

    if (!result.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this assessment' });
    }

    // Populate related courses
    if (result.relatedCourseIds && result.relatedCourseIds.length > 0) {
      const relatedCourses = await Course.find({
        _id: { $in: result.relatedCourseIds }
      });
      result.relatedCourses = relatedCourses;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;