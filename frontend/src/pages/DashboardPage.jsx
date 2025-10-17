import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/users/health');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.firstName || user?.username}!</span>
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wellness Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Wellness Score</h3>
            <div className="text-3xl font-bold text-blue-600">
              {dashboardData?.wellnessScore || 75}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Based on recent activity</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appointments</h3>
            <div className="text-3xl font-bold text-green-600">
              {dashboardData?.upcomingAppointments || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Upcoming sessions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Progress</h3>
            <div className="text-3xl font-bold text-purple-600">
              {dashboardData?.courseProgress || 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Learning journey</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Last Assessment</h3>
            <div className="text-lg font-bold text-yellow-600">
              {dashboardData?.lastAssessment ? 'Completed' : 'Not taken'}
            </div>
            <p className="text-sm text-gray-600 mt-1">Mental health check</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/appointments" 
              className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">Book Appointment</div>
            </Link>
            
            <Link 
              to="/assessments" 
              className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Assessment</div>
            </Link>
            
            <Link 
              to="/journal" 
              className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-gray-900">Journal</div>
            </Link>
            
            <Link 
              to="/chat" 
              className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium text-gray-900">Chat Support</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Dr. Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Therapy Session</p>
                    <p className="text-sm text-gray-500 mt-1">Today, 2:00 PM - Video Call</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Scheduled</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Dr. Michael Chen</h3>
                    <p className="text-sm text-gray-600">Psychiatry Consultation</p>
                    <p className="text-sm text-gray-500 mt-1">Oct 20, 10:30 AM - In-person</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Confirmed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Managing Anxiety</h3>
                    <p className="text-sm text-gray-600">Learn practical techniques to manage anxiety</p>
                    <p className="text-sm text-gray-500 mt-1">Duration: 45 mins</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
                    Start
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Sleep Better Tonight</h3>
                    <p className="text-sm text-gray-600">Improve your sleep quality and patterns</p>
                    <p className="text-sm text-gray-500 mt-1">Duration: 30 mins</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;