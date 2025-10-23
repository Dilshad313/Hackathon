import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MoodTracker from '../components/common/MoodTracker';

const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
    <div className={`text-3xl text-${color}-500`}>{icon}</div>
    <div>
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const ActionCard = ({ title, to, icon, color }) => (
  <Link 
    to={to} 
    className={`bg-${color}-50 hover:bg-${color}-100 rounded-xl p-6 text-center transition-all duration-300 transform hover:-translate-y-1 group flex flex-col items-center justify-center shadow-sm hover:shadow-md`}
  >
    <div className={`text-4xl mb-3 text-${color}-500 group-hover:scale-110 transition-transform`}>{icon}</div>
    <div className={`font-semibold text-gray-800`}>{title}</div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data for demonstration
        const mockData = {
          wellnessScore: 82,
          upcomingAppointments: 2,
          courseProgress: 45,
          lastAssessment: 'Completed',
          appointments: [
            { id: 1, doctor: 'Dr. Sarah Johnson', type: 'Therapy Session', time: 'Today, 2:00 PM', status: 'Scheduled' },
            { id: 2, doctor: 'Dr. Michael Chen', type: 'Psychiatry Consultation', time: 'Oct 20, 10:30 AM', status: 'Confirmed' },
          ],
          courses: [
            { id: 1, title: 'Managing Anxiety', description: 'Learn practical techniques to manage anxiety', duration: '45 mins' },
            { id: 2, title: 'Sleep Better Tonight', description: 'Improve your sleep quality and patterns', duration: '30 mins' },
          ]
        };
        setDashboardData(mockData);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-lg text-gray-600">Here's a snapshot of your mental wellness journey.</p>
        </div>

        {/* Wellness Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Wellness Score" value={`${dashboardData?.wellnessScore || 0}%`} subtitle="Based on recent activity" color="blue" icon="😊" />
          <StatCard title="Appointments" value={dashboardData?.upcomingAppointments || 0} subtitle="Upcoming sessions" color="green" icon="📅" />
          <StatCard title="Course Progress" value={`${dashboardData?.courseProgress || 0}%`} subtitle="Learning journey" color="purple" icon="📚" />
          <StatCard title="Last Assessment" value={dashboardData?.lastAssessment || 'N/A'} subtitle="Mental health check" color="yellow" icon="📊" />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionCard to="/appointments/book" title="Book Appointment" icon="➕" color="blue" />
            <ActionCard to="/assessments" title="Take Assessment" icon="📝" color="green" />
            <ActionCard to="/journal" title="Add Journal Entry" icon="✍️" color="yellow" />
            <ActionCard to="/chat" title="AI Chat Support" icon="💬" color="purple" />
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="mb-10">
          <MoodTracker />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {dashboardData?.appointments.length > 0 ? (
                dashboardData.appointments.map(appt => (
                  <div key={appt.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{appt.doctor}</h3>
                      <p className="text-sm text-gray-600">{appt.type}</p>
                      <p className="text-sm text-gray-500 mt-1">{appt.time}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{appt.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming appointments.</p>
              )}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended for You</h2>
            <div className="space-y-4">
              {dashboardData?.courses.length > 0 ? (
                dashboardData.courses.map(course => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                      <p className="text-sm text-gray-500 mt-1">Duration: {course.duration}</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-md">Start</button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recommended courses at this time.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;