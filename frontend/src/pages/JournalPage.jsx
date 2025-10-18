import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const JournalPage = () => {
  const { logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('entries');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    sharedWithDoctor: false
  });

  useEffect(() => {
    fetchJournalData();
  }, [activeTab]);

  const fetchJournalData = async () => {
    try {
      if (activeTab === 'entries') {
        const response = await api.get('/journals/my-entries');
        setEntries(response.data.entries);
      } else if (activeTab === 'insights') {
        const response = await api.get('/journals/insights');
        setInsights(response.data);
      }
    } catch (error) {
      NotificationService.error('Failed to load journal data');
      console.error('Error fetching journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    
    try {
      const entryData = {
        ...newEntry,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        emotions: [], // Could be expanded based on mood selection
        gratitude: [], // Could be expanded
        activities: [], // Could be expanded
        triggers: [], // Could be expanded
        copingStrategies: [] // Could be expanded
      };

      await api.post('/journals/create', entryData);
      NotificationService.success('Journal entry created successfully');
      
      // Reset form
      setNewEntry({
        title: '',
        content: '',
        mood: '',
        tags: '',
        sharedWithDoctor: false
      });
      setAiAnalysis(null); // Clear AI analysis
      
      // Refresh entries
      if (activeTab === 'entries') {
        fetchJournalData();
      }
    } catch (error) {
      NotificationService.error('Failed to create journal entry');
    }
  };

  const handleAIAnalysis = async () => {
    if (!newEntry.content || newEntry.content.trim().length < 10) {
      NotificationService.error('Please write at least 10 characters to get AI analysis');
      return;
    }

    setAnalyzingAI(true);
    try {
      const response = await api.post('/journals/analyze', {
        content: newEntry.content,
        mood: newEntry.mood,
        emotions: [],
        triggers: []
      });
      
      setAiAnalysis(response.data.analysis);
      NotificationService.success('AI analysis complete!');
    } catch (error) {
      NotificationService.error('Failed to get AI analysis');
      console.error('AI analysis error:', error);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'very-happy': return 'bg-yellow-100 text-yellow-800';
      case 'happy': return 'bg-yellow-50 text-yellow-700';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'sad': return 'bg-blue-100 text-blue-800';
      case 'very-sad': return 'bg-blue-200 text-blue-900';
      case 'anxious': return 'bg-purple-100 text-purple-800';
      case 'stressed': return 'bg-red-100 text-red-800';
      case 'calm': return 'bg-green-100 text-green-800';
      case 'energetic': return 'bg-orange-100 text-orange-800';
      case 'tired': return 'bg-gray-200 text-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'very-happy': return '😄';
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'very-sad': return '😢';
      case 'anxious': return '😰';
      case 'stressed': return '😫';
      case 'calm': return '😌';
      case 'energetic': return '🤩';
      case 'tired': return '😴';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Entries
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              New Entry
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Insights
            </button>
          </nav>
        </div>

        {activeTab === 'entries' ? (
          /* Journal Entries List */
          <div>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Journal Entries</h3>
                <p className="text-gray-500">Start writing to capture your thoughts and feelings.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Create Entry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map(entry => (
                  <div key={entry._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{entry.title}</h3>
                      {entry.mood && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                          {getMoodIcon(entry.mood)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{entry.content}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {entry.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      {entry.sharedWithDoctor && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Shared with doctor
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/journal/${entry._id}`}
                      className="mt-4 block text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Read more →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'new' ? (
          /* Create New Entry Form */
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleCreateEntry} className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's on your mind?"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your thoughts and feelings here..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                    Mood
                  </label>
                  <select
                    id="mood"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your mood</option>
                    <option value="very-happy">Very Happy 😄</option>
                    <option value="happy">Happy 😊</option>
                    <option value="neutral">Neutral 😐</option>
                    <option value="sad">Sad 😔</option>
                    <option value="very-sad">Very Sad 😢</option>
                    <option value="anxious">Anxious 😰</option>
                    <option value="stressed">Stressed 😫</option>
                    <option value="calm">Calm 😌</option>
                    <option value="energetic">Energetic 🤩</option>
                    <option value="tired">Tired 😴</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., work, family, anxiety"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sharedWithDoctor"
                    checked={newEntry.sharedWithDoctor}
                    onChange={(e) => setNewEntry({...newEntry, sharedWithDoctor: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sharedWithDoctor" className="ml-2 block text-sm text-gray-700">
                    Share with my doctor
                  </label>
                </div>
              </div>

              {/* AI Analysis Section */}
              {aiAnalysis && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2">AI Insights</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {aiAnalysis}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={analyzingAI || !newEntry.content}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzingAI ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      🤖 Get AI Insights
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Insights */
          <div>
            {insights && insights.totalEntries > 0 ? (
              <div className="space-y-6">
                {/* AI Insights Section */}
                {insights.aiInsights && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-lg p-6">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-xl font-bold text-purple-900 mb-2">AI Insights from Your Journal</h3>
                        <p className="text-sm text-purple-700">Based on your recent entries from the last 30 days</p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {insights.aiInsights}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends</h3>
                  <div className="space-y-3">
                    {Object.entries(insights.moodTrends).map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{getMoodIcon(mood)}</span>
                          <span className="capitalize">{mood.replace('-', ' ')}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Triggers</h3>
                  {insights.commonTriggers.length > 0 ? (
                    <div className="space-y-2">
                      {insights.commonTriggers.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.trigger}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No triggers recorded yet.</p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coping Strategies</h3>
                  {insights.commonCopingStrategies.length > 0 ? (
                    <div className="space-y-2">
                      {insights.commonCopingStrategies.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.strategy}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No coping strategies recorded yet.</p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gratitude Practice</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Journal entries with gratitude</span>
                        <span className="text-sm font-medium">{insights.gratitudeFrequency.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${insights.gratitudeFrequency}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total entries</span>
                        <span className="text-sm font-medium">{insights.totalEntries}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                <p className="text-gray-500">Create journal entries to see insights about your mood and patterns.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalPage;