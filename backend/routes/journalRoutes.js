const express = require('express');
const { auth } = require('../middleware/auth');
const JournalEntry = require('../models/Journal');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

// @route   POST api/journals/create
// @desc    Create a journal entry
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { title, content, mood, tags, sharedWithDoctor, emotions, gratitude, activities, triggers, copingStrategies } = req.body;

    const journalEntry = new JournalEntry({
      userId: req.user.id,
      title,
      content,
      mood,
      tags: tags || [],
      sharedWithDoctor: sharedWithDoctor || false,
      emotions: emotions || [],
      gratitude: gratitude || [],
      activities: activities || [],
      triggers: triggers || [],
      copingStrategies: copingStrategies || []
    });

    await journalEntry.save();

    // If shared with doctor, notify the doctor
    if (sharedWithDoctor && journalEntry.doctorId) {
      const Notification = require('../models/Notification');
      const notification = new Notification({
        userId: journalEntry.doctorId,
        title: 'New Journal Entry Shared',
        message: `${req.user.firstName || req.user.username} has shared a new journal entry with you.`,
        type: 'new-message',
        data: { journalId: journalEntry._id }
      });
      await notification.save();
    }

    res.status(201).json(journalEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/journals/my-entries
// @desc    Get user's journal entries
// @access  Private
router.get('/my-entries', auth, async (req, res) => {
  try {
    const { mood, dateRange, sharedWithDoctor, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };

    if (mood) {
      query.mood = mood;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (sharedWithDoctor !== undefined) {
      query.sharedWithDoctor = sharedWithDoctor === 'true';
    }

    // Allow private entries to be seen by the owner
    query.$or = [
      { isPrivate: false },
      { userId: req.user.id }
    ];

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JournalEntry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/journals/shared-with-me
// @desc    Get journal entries shared with the user (if they're a doctor)
// @access  Private - Doctor role
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    // Check if user is a doctor
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }

    const { page = 1, limit = 10, patientId } = req.query;

    let query = {
      sharedWithDoctor: true,
      doctorId: doctor._id
    };

    if (patientId) {
      query.userId = patientId;
    }

    const entries = await JournalEntry.find(query)
      .populate('userId', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JournalEntry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/journals/insights
// @desc    Get journal insights for user
// @access  Private
router.get('/insights', auth, async (req, res) => {
  try {
    // Get journal entries from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await JournalEntry.find({
      userId: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (entries.length === 0) {
      return res.json({
        moodTrends: {},
        commonTriggers: [],
        commonCopingStrategies: [],
        gratitudeFrequency: 0,
        totalEntries: 0
      });
    }

    // Calculate insights
    const moodTrends = {};
    const triggersMap = new Map();
    const copingStrategiesMap = new Map();
    let gratitudeEntries = 0;

    entries.forEach(entry => {
      // Mood trends
      if (entry.mood) {
        moodTrends[entry.mood] = (moodTrends[entry.mood] || 0) + 1;
      }

      // Triggers
      if (entry.triggers && entry.triggers.length > 0) {
        entry.triggers.forEach(trigger => {
          triggersMap.set(trigger, (triggersMap.get(trigger) || 0) + 1);
        });
      }

      // Coping strategies
      if (entry.copingStrategies && entry.copingStrategies.length > 0) {
        entry.copingStrategies.forEach(strategy => {
          copingStrategiesMap.set(strategy, (copingStrategiesMap.get(strategy) || 0) + 1);
        });
      }

      // Gratitude
      if (entry.gratitude && entry.gratitude.length > 0) {
        gratitudeEntries++;
      }
    });

    const commonTriggers = Array.from(triggersMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    const commonCopingStrategies = Array.from(copingStrategiesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strategy, count]) => ({ strategy, count }));

    const gratitudeFrequency = entries.length > 0 ? (gratitudeEntries / entries.length) * 100 : 0;

    // Generate AI insights if there are entries
    let aiInsights = null;
    if (entries.length > 0) {
      try {
        // Prepare summary of recent entries for AI analysis
        const recentEntries = entries.slice(0, 5);
        const entrySummary = recentEntries.map(e => ({
          mood: e.mood,
          content: e.content.substring(0, 200), // First 200 chars
          date: e.createdAt
        }));

        const insightsPrompt = `Analyze these recent journal entries and provide supportive insights:

${entrySummary.map((e, i) => `Entry ${i + 1} (${new Date(e.date).toLocaleDateString()}):
Mood: ${e.mood}
Content: ${e.content}
`).join('\n')}

Provide:
1. Overall emotional patterns (2-3 sentences)
2. Positive observations and strengths (2-3 points)
3. Gentle suggestions for wellbeing (2-3 actionable tips)

Be warm, encouraging, and supportive. Focus on growth and self-compassion.`;

        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash-exp"
        });

        const result = await model.generateContent(insightsPrompt);
        const response = await result.response;
        aiInsights = response.text();
        
        console.log('AI Insights generated for journal overview');
      } catch (aiError) {
        console.log('AI insights generation failed:', aiError.message);
        // Continue without AI insights
      }
    }

    res.json({
      moodTrends,
      commonTriggers,
      commonCopingStrategies,
      gratitudeFrequency,
      totalEntries: entries.length,
      aiInsights
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/journals/:id
// @desc    Get journal entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id)
      .populate('userId', 'firstName lastName username');

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check if user is owner, doctor (if shared), or admin
    if (!entry.userId.equals(req.user.id)) {
      if (entry.sharedWithDoctor && entry.doctorId) {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor || !entry.doctorId.equals(doctor._id)) {
          return res.status(403).json({ message: 'Not authorized to view this journal entry' });
        }
      } else {
        return res.status(403).json({ message: 'Not authorized to view this journal entry' });
      }
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT api/journals/:id
// @desc    Update journal entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, mood, tags, sharedWithDoctor, emotions, gratitude, activities, triggers, copingStrategies } = req.body;

    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (!entry.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this journal entry' });
    }

    // Update fields
    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (mood !== undefined) entry.mood = mood;
    if (tags !== undefined) entry.tags = tags;
    if (sharedWithDoctor !== undefined) entry.sharedWithDoctor = sharedWithDoctor;
    if (emotions !== undefined) entry.emotions = emotions;
    if (gratitude !== undefined) entry.gratitude = gratitude;
    if (activities !== undefined) entry.activities = activities;
    if (triggers !== undefined) entry.triggers = triggers;
    if (copingStrategies !== undefined) entry.copingStrategies = copingStrategies;

    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE api/journals/:id
// @desc    Delete journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (!entry.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this journal entry' });
    }

    await JournalEntry.findByIdAndDelete(req.params.id);

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/journals/analyze
// @desc    Get AI analysis of journal entry
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    console.log('=== Journal AI Analysis Started ===');
    console.log('User ID:', req.user?.id);
    console.log('Content length:', req.body.content?.length);
    
    const { content, mood, emotions, triggers } = req.body;

    if (!content || content.trim().length < 10) {
      console.log('Content too short');
      return res.status(400).json({ message: 'Journal content is too short for analysis' });
    }

    console.log('Building AI prompt...');
    
    // Build context for AI analysis
    const analysisPrompt = `You are a compassionate mental health AI assistant analyzing a journal entry. Provide supportive, empathetic insights.

Journal Entry:
Content: ${content}
Mood: ${mood || 'Not specified'}
Emotions: ${emotions?.join(', ') || 'Not specified'}
Triggers: ${triggers?.join(', ') || 'Not specified'}

Please provide:
1. A brief empathetic summary (2-3 sentences)
2. Identified emotional patterns or themes
3. 3-4 supportive suggestions or coping strategies
4. Positive affirmations or encouragement

Keep the tone warm, supportive, and non-judgmental. Focus on emotional validation and practical self-care tips.`;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp"
      });

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const aiAnalysis = response.text();
      
      console.log('AI Analysis successful:', aiAnalysis.substring(0, 100));

      res.json({
        analysis: aiAnalysis,
        analyzedAt: new Date()
      });
    } catch (aiError) {
      console.log('AI API error, using fallback response:', aiError.message);
      
      // Fallback response if AI API fails
      const fallbackAnalysis = `Thank you for sharing your thoughts. Journaling is a powerful tool for self-reflection and emotional processing.

Based on your entry, I notice you're experiencing ${mood || 'various emotions'}. It's important to acknowledge and validate these feelings.

Here are some supportive suggestions:
• Practice self-compassion and be gentle with yourself
• Consider deep breathing or mindfulness exercises
• Reach out to supportive friends or family
• Engage in activities that bring you joy and relaxation

Remember, it's okay to feel what you're feeling. Your emotions are valid, and taking time to journal shows self-awareness and strength.`;

      res.json({
        analysis: fallbackAnalysis,
        analyzedAt: new Date(),
        fallback: true
      });
    }
  } catch (error) {
    console.error('Journal analysis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/journals/:id/ai-insights
// @desc    Get AI insights for a specific journal entry
// @access  Private
router.get('/:id/ai-insights', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (!entry.userId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate AI insights for the entry
    const insightsPrompt = `Analyze this journal entry and provide brief insights:

Title: ${entry.title}
Content: ${entry.content}
Mood: ${entry.mood}
Date: ${entry.createdAt}

Provide:
1. Key emotional themes (1-2 sentences)
2. One actionable self-care tip
3. One positive observation

Be brief, supportive, and encouraging.`;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp"
      });

      const result = await model.generateContent(insightsPrompt);
      const response = await result.response;
      const insights = response.text();
      
      console.log('AI Insights successful');

      res.json({ insights });
    } catch (aiError) {
      console.log('AI API error for insights:', aiError.message);
      
      res.json({
        insights: `Your journal entry shows self-awareness and reflection. Continue this practice of expressing your thoughts and feelings. Consider incorporating relaxation techniques or activities you enjoy into your routine.`,
        fallback: true
      });
    }
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;