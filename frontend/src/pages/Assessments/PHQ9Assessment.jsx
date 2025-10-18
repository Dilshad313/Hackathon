import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NotificationService from '../../utils/notifications';

const PHQ9Assessment = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentName, setAssessmentName] = useState('');
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiGuidance, setAiGuidance] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/assessments/questions/${type}`);
      setQuestions(response.data.questions);
      setAssessmentName(response.data.name);
      // Initialize answers
      const initialAnswers = {};
      response.data.questions.forEach((q, index) => {
        initialAnswers[index] = 0; // Default to "Not at all"
      });
      setAnswers(initialAnswers);
    } catch (error) {
      NotificationService.error('Failed to load assessment questions');
      console.error('Error fetching questions:', error);
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: score
    }));
  };

  const getNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowAIHelp(false); // Hide AI help when moving to next question
      setAiGuidance('');
    } else {
      submitAssessment();
    }
  };

  const getPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowAIHelp(false); // Hide AI help when moving to previous question
      setAiGuidance('');
    }
  };

  const getAIGuidance = async () => {
    setLoadingAI(true);
    setShowAIHelp(true);
    
    try {
      const currentQ = questions[currentQuestion];
      const response = await api.post('/ai/chat', {
        message: `I'm taking a mental health assessment and I need help understanding this question: "${currentQ.text}". Can you explain what this question is asking about and provide guidance on how to answer it honestly? Keep it brief and supportive.`,
        botType: 'neha'
      });
      
      setAiGuidance(response.data.response);
    } catch (error) {
      setAiGuidance('I\'m here to help! This question is asking about your recent experiences. Try to think about the past two weeks and answer as honestly as you can. There are no right or wrong answers - this is about understanding how you\'ve been feeling.');
      console.error('AI guidance error:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const submitAssessment = async () => {
    try {
      // Calculate total score
      const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
      
      // Prepare answers with question details
      const detailedAnswers = questions.map((q, index) => ({
        questionId: q.id,
        questionText: q.text,
        answer: q.options[answers[index]],
        score: answers[index]
      }));

      const response = await api.post('/assessments/submit', {
        assessmentType: type,
        assessmentName,
        answers: detailedAnswers
      });

      NotificationService.success('Assessment completed successfully!');
      navigate(`/assessments/${response.data._id}`);
    } catch (error) {
      NotificationService.error('Failed to submit assessment');
      console.error('Error submitting assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
          <button
            onClick={() => navigate('/assessments')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{assessmentName}</h1>
          <p className="text-gray-600 mt-1">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{currentQuestion + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex-1">
                {currentQ.text}
              </h2>
              <button
                onClick={getAIGuidance}
                disabled={loadingAI}
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loadingAI ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    🤖 Need Help?
                  </>
                )}
              </button>
            </div>

            {/* AI Guidance Display */}
            {showAIHelp && aiGuidance && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-2">AI Guidance</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{aiGuidance}</p>
                  </div>
                  <button
                    onClick={() => setShowAIHelp(false)}
                    className="text-purple-600 hover:text-purple-800 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {/* Answer options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-start">
                  <input
                    type="radio"
                    id={`answer-${index}`}
                    name="answer"
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerChange(currentQuestion, index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor={`answer-${index}`} className="ml-3 block text-gray-700 cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={getPrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={currentQuestion === questions.length - 1 ? submitAssessment : getNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>

        {/* Summary of answers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Answers</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {questions.map((q, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Q{index + 1}</span>
                <span className="text-sm font-medium">
                  {answers[index] !== undefined ? questions[index].options[answers[index]] : 'Not answered'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PHQ9Assessment;