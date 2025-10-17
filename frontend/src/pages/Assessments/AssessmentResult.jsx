import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NotificationService from '../../utils/notifications';

const AssessmentResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const response = await api.get(`/assessments/${id}`);
      setResult(response.data);
    } catch (error) {
      NotificationService.error('Failed to load assessment result');
      console.error('Error fetching result:', error);
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'normal': return '😊';
      case 'mild': return '😐';
      case 'moderate': return '😔';
      case 'severe': return '😢';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Not Found</h3>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{result.assessmentName} Results</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{getSeverityIcon(result.severity)}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
                <p className="text-gray-600">Assessment completed on {new Date(result.completedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{result.totalScore}/{result.maxScore}</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                {result.severity}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-4"><strong>Interpretation:</strong> {result.interpretation}</p>
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Courses */}
        {result.relatedCourses && result.relatedCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.relatedCourses.map(course => (
                <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                  <Link 
                    to={`/courses/${course._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Explore course →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Answers */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Answers</h3>
          <div className="space-y-6">
            {result.answers.map((answer, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h4 className="font-medium text-gray-900 mb-2">Q{index + 1}: {answer.questionText}</h4>
                <p className="text-gray-700"><span className="font-medium">Your answer:</span> {answer.answer}</p>
                <p className="text-gray-700"><span className="font-medium">Score:</span> {answer.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/doctors"
              className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition duration-300"
            >
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <div className="font-medium text-blue-800">Find a Doctor</div>
            </Link>
            
            <Link 
              to="/journal"
              className="border border-green-200 bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition duration-300"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-green-800">Write in Journal</div>
            </Link>
            
            <Link 
              to="/courses"
              className="border border-purple-200 bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition duration-300"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-purple-800">Explore Courses</div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentResult;