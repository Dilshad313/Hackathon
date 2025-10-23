import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Calendar, 
  BookOpen, 
  Activity, 
  Plus, 
  FileText, 
  PenTool, 
  MessageCircle,
  Clock,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MoodTracker from '../components/common/MoodTracker';

const StatCard = ({ title, value, subtitle, color, icon: Icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-gradient-to-br ${color} rounded-xl`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <TrendingUp className="w-5 h-5 text-green-500" />
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{value}</div>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </motion.div>
);

const ActionCard = ({ title, to, icon: Icon, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.4 + index * 0.1 }}
    whileHover={{ scale: 1.05, y: -5 }}
  >
    <Link 
      to={to} 
      className="block bg-white rounded-2xl p-6 text-center transition-all duration-300 group shadow-lg hover:shadow-2xl border border-gray-100"
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</div>
    </Link>
  </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-lg text-gray-600">Here's a snapshot of your mental wellness journey.</p>
        </motion.div>

        {/* Wellness Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Wellness Score" value={`${dashboardData?.wellnessScore || 0}%`} subtitle="Based on recent activity" color="from-blue-500 to-cyan-500" icon={Smile} index={0} />
          <StatCard title="Appointments" value={dashboardData?.upcomingAppointments || 0} subtitle="Upcoming sessions" color="from-green-500 to-emerald-500" icon={Calendar} index={1} />
          <StatCard title="Course Progress" value={`${dashboardData?.courseProgress || 0}%`} subtitle="Learning journey" color="from-purple-500 to-pink-500" icon={BookOpen} index={2} />
          <StatCard title="Last Assessment" value={dashboardData?.lastAssessment || 'N/A'} subtitle="Mental health check" color="from-orange-500 to-yellow-500" icon={Activity} index={3} />
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionCard to="/appointments/book" title="Book Appointment" icon={Plus} gradient="from-blue-500 to-cyan-500" index={0} />
            <ActionCard to="/assessments" title="Take Assessment" icon={FileText} gradient="from-green-500 to-emerald-500" index={1} />
            <ActionCard to="/journal" title="Add Journal Entry" icon={PenTool} gradient="from-orange-500 to-yellow-500" index={2} />
            <ActionCard to="/chat" title="AI Chat Support" icon={MessageCircle} gradient="from-purple-500 to-pink-500" index={3} />
          </div>
        </motion.div>

        {/* Mood Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <MoodTracker />
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
            </div>
            <div className="space-y-4">
              {dashboardData?.appointments.length > 0 ? (
                dashboardData.appointments.map((appt, idx) => (
                  <motion.div 
                    key={appt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{appt.doctor}</h3>
                        <p className="text-sm text-gray-600 mb-2">{appt.type}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {appt.time}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{appt.status}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming appointments.</p>
              )}
            </div>
          </motion.div>

          {/* Recommended Courses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
            </div>
            <div className="space-y-4">
              {dashboardData?.courses.length > 0 ? (
                dashboardData.courses.map((course, idx) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                      </div>
                      <button className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap">
                        Start
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recommended courses at this time.</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;