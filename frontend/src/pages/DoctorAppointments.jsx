import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchDoctorAppointments();
  }, [activeTab]);

  const fetchDoctorAppointments = async () => {
    try {
      let statusFilter = '';
      if (activeTab === 'upcoming') statusFilter = 'scheduled,confirmed,in-progress';
      else if (activeTab === 'today') statusFilter = 'scheduled,confirmed,in-progress,completed';
      else if (activeTab === 'completed') statusFilter = 'completed';
      else if (activeTab === 'cancelled') statusFilter = 'cancelled';

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/doctors/my-appointments?${params}`);
      setAppointments(response.data);
    } catch (error) {
      NotificationService.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (appointmentId) => {
    try {
      // Start consultation
      const response = await api.post('/consultations/start', {
        appointmentId,
        type: 'video' // Default to video
      });

      // Navigate to consultation interface
      window.location.href = `/consultations/${response.data._id}/join`;
    } catch (error) {
      NotificationService.error('Failed to start consultation');
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                 activeTab === 'today' ? 'No appointments today' : 
                 activeTab === 'completed' ? 'No completed appointments' : 'No cancelled appointments'}
              </h3>
              <p className="text-gray-500">You don't have any appointments in this category.</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {appointment.patientId.firstName?.charAt(0)}{appointment.patientId.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientId.firstName} {appointment.patientId.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{appointment.reason || 'Consultation'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium capitalize">{appointment.consultationType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                          {appointment.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.patientNotes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Patient Notes</p>
                        <p className="text-gray-900">{appointment.patientNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleStartConsultation(appointment._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Start Consultation
                      </button>
                    )}
                    
                    {appointment.status === 'in-progress' && (
                      <button
                        onClick={() => window.location.href = `/consultations/${appointment._id}/join`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Join Session
                      </button>
                    )}
                    
                    {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                      <button
                        onClick={() => window.location.href = `/appointments/${appointment._id}/details`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        View Details
                      </button>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => window.location.href = `/prescriptions/create?appointmentId=${appointment._id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Create Prescription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorAppointments;