import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAppointments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, we would have a specific endpoint for doctor dashboard data
      // For now, we'll simulate with placeholder data
      setDashboardData({
        totalPatients: 42,
        upcomingAppointments: 8,
        completedSessions: 156,
        avgRating: 4.8,
        totalEarnings: 12500,
        pendingReviews: 5
      });
    } catch (error) {
      NotificationService.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/doctors/my-appointments');
      setAppointments(response.data.slice(0, 5)); // Get first 5 appointments
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, Dr. {localStorage.getItem('doctorName') || 'User'}!</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Patients</h3>
            <div className="text-3xl font-bold text-blue-600">{dashboardData?.totalPatients || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Active patients</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Appointments</h3>
            <div className="text-3xl font-bold text-green-600">{dashboardData?.upcomingAppointments || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Next 7 days</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Sessions</h3>
            <div className="text-3xl font-bold text-purple-600">{dashboardData?.completedSessions || 0}</div>
            <p className="text-sm text-gray-600 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Average Rating</h3>
            <div className="text-3xl font-bold text-yellow-600">{dashboardData?.avgRating || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Based on reviews</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/doctor/appointments" 
              className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">View Appointments</div>
            </Link>
            
            <Link 
              to="/doctor/profile" 
              className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-gray-900">Update Profile</div>
            </Link>
            
            <Link 
              to="/prescriptions" 
              className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">💊</div>
              <div className="font-medium text-gray-900">Manage Prescriptions</div>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.patientId.firstName} {appointment.patientId.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.reason || 'Consultation'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.startTime}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Patient Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Patient Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">John Smith</h3>
                  <p className="text-sm text-gray-600">Submitted journal entry</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600">Completed assessment</p>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Michael Brown</h3>
                  <p className="text-sm text-gray-600">Requested prescription refill</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;