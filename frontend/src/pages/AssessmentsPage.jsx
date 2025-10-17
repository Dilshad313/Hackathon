import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const AssessmentsPage = () => {
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types');

  useEffect(() => {
    fetchAssessmentData();
  }, [activeTab]);

  const fetchAssessmentData = async () => {
    try {
      if (activeTab === 'types') {
        const response = await api.get('/assessments/types');
        setAssessmentTypes(response.data);
      } else {
        const response = await api.get('/assessments/my-results');
        setAssessmentResults(response.data.results);
      }
    } catch (error) {
      NotificationService.error('Failed to load assessment data');
      console.error('Error fetching assessment data:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mental Health Assessments</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Take Assessment
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Results
            </button>
          </nav>
        </div>

        {activeTab === 'types' ? (
          /* Assessment Types */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessmentTypes.map(assessment => (
              <div key={assessment.type} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.name}</h3>
                    <p className="text-gray-600 mb-4">{assessment.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>{assessment.questions} questions</p>
                      <p>Max score: {assessment.maxScore}</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  to={`/assessments/${assessment.type}/take`}
                  className="mt-4 block bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition duration-300"
                >
                  Take Assessment
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Assessment Results */
          <div>
            {assessmentResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Results</h3>
                <p className="text-gray-500">You haven't completed any assessments yet.</p>
                <button
                  onClick={() => setActiveTab('types')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Take Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {assessmentResults.map(result => (
                  <div key={result._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getSeverityIcon(result.severity)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{result.assessmentName}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="font-medium">{result.totalScore}/{result.maxScore}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Severity</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(result.severity)}`}>
                              {result.severity}
                            </span>
                          </div>
                        </div>
                        
                        {result.interpretation && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">Interpretation</p>
                            <p className="text-gray-900">{result.interpretation}</p>
                          </div>
                        )}
                        
                        {result.recommendations && result.recommendations.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">Recommendations</p>
                            <ul className="list-disc list-inside text-gray-900">
                              {result.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Link
                          to={`/assessments/${result._id}`}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssessmentsPage;