import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const HospitalDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 24,
    totalPatients: 1245,
    occupiedBeds: 45,
    totalBeds: 60,
    avgPatientSatisfaction: 4.7,
    emergencyCases: 3,
    totalAppointments: 89
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, we would fetch from the backend
      // For now, we'll use the placeholder data
    } catch (error) {
      NotificationService.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome to Hospital Portal!</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Doctors</h3>
            <div className="text-3xl font-bold text-blue-600">{dashboardData.totalDoctors}</div>
            <p className="text-sm text-gray-600 mt-1">On staff</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Patients</h3>
            <div className="text-3xl font-bold text-green-600">{dashboardData.totalPatients}</div>
            <p className="text-sm text-gray-600 mt-1">Registered</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bed Occupancy</h3>
            <div className="text-3xl font-bold text-purple-600">
              {dashboardData.occupiedBeds}/{dashboardData.totalBeds}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((dashboardData.occupiedBeds / dashboardData.totalBeds) * 100)}% full
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Satisfaction</h3>
            <div className="text-3xl font-bold text-yellow-600">{dashboardData.avgPatientSatisfaction}</div>
            <p className="text-sm text-gray-600 mt-1">Out of 5 stars</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/hospital/profile" 
              className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-medium text-gray-900">Update Hospital Info</div>
            </Link>
            
            <Link 
              to="/appointments" 
              className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">Manage Appointments</div>
            </Link>
            
            <Link 
              to="/doctors" 
              className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center transition duration-300"
            >
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <div className="font-medium text-gray-900">Manage Doctors</div>
            </Link>
          </div>
        </div>

        {/* Hospital Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Cases</h2>
            <div className="space-y-4">
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-red-800">Cardiac Emergency</h3>
                <p className="text-sm text-red-600">Room 101 • 2 hours ago</p>
              </div>
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-red-800">Trauma Case</h3>
                <p className="text-sm text-red-600">ER Bay 3 • 1 hour ago</p>
              </div>
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800">High Priority Consultation</h3>
                <p className="text-sm text-yellow-600">Psych Unit • 30 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">New Patient Admission</h3>
                  <p className="text-sm text-gray-600">John Smith, Room 205</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Doctor Shift Change</h3>
                  <p className="text-sm text-gray-600">Dr. Johnson to Dr. Davis</p>
                </div>
                <span className="text-sm text-gray-500">4 hours ago</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Equipment Maintenance</h3>
                  <p className="text-sm text-gray-600">MRI Machine, Room 102</p>
                </div>
                <span className="text-sm text-gray-500">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;