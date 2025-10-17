import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalCourses: 0,
    totalAppointments: 0,
    totalForumPosts: 0,
    pendingDoctorApprovals: 0,
    pendingHospitalApprovals: 0,
    pendingCourseApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
      setRecentUsers(response.data.recentUsers || []);
      setRecentAppointments(response.data.recentAppointments || []);
    } catch (error) {
      NotificationService.error('Failed to load admin dashboard data');
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Admin Portal</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
            <div className="text-3xl font-bold text-blue-600">{dashboardData.totalUsers}</div>
            <p className="text-sm text-gray-600 mt-1">Registered users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Doctors</h3>
            <div className="text-3xl font-bold text-green-600">{dashboardData.totalDoctors}</div>
            <p className="text-sm text-gray-600 mt-1">Registered doctors</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Hospitals</h3>
            <div className="text-3xl font-bold text-purple-600">{dashboardData.totalHospitals}</div>
            <p className="text-sm text-gray-600 mt-1">Registered hospitals</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Courses</h3>
            <div className="text-3xl font-bold text-yellow-600">{dashboardData.totalCourses}</div>
            <p className="text-sm text-gray-600 mt-1">Educational content</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Appointments</h3>
            <div className="text-3xl font-bold text-red-600">{dashboardData.totalAppointments}</div>
            <p className="text-sm text-gray-600 mt-1">Booked sessions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Forum Posts</h3>
            <div className="text-3xl font-bold text-indigo-600">{dashboardData.totalForumPosts}</div>
            <p className="text-sm text-gray-600 mt-1">Community discussions</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/admin/doctors" 
              className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center transition duration-300 hover:bg-blue-100"
            >
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <div className="font-medium text-blue-800">Doctors</div>
              <div className="text-lg font-bold">{dashboardData.pendingDoctorApprovals}</div>
            </Link>
            
            <Link 
              to="/admin/hospitals" 
              className="border border-green-200 bg-green-50 rounded-lg p-4 text-center transition duration-300 hover:bg-green-100"
            >
              <div className="text-2xl mb-2">🏥</div>
              <div className="font-medium text-green-800">Hospitals</div>
              <div className="text-lg font-bold">{dashboardData.pendingHospitalApprovals}</div>
            </Link>
            
            <Link 
              to="/admin/courses" 
              className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-center transition duration-300 hover:bg-yellow-100"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-yellow-800">Courses</div>
              <div className="text-lg font-bold">{dashboardData.pendingCourseApprovals}</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
            {recentUsers.length === 0 ? (
              <p className="text-gray-500">No recent users</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map(user => (
                  <div key={user._id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Appointments</h2>
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500">No recent appointments</p>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map(appointment => (
                  <div key={appointment._id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;