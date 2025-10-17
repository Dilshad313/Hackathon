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
    } else {
      submitAssessment();
    }
  };

  const getPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQ.text}
            </h2>
            
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
                  <label htmlFor={`answer-${index}`} className="ml-3 block text-gray-700">
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