import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchParams] = useSearchParams();
  const [doctorId] = useState(searchParams.get('doctorId') || null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      let statusFilter = '';
      if (activeTab === 'upcoming') statusFilter = 'scheduled,confirmed,in-progress';
      else if (activeTab === 'past') statusFilter = 'completed';
      else if (activeTab === 'cancelled') statusFilter = 'cancelled';

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/appointments/my-appointments?${params}`);
      setAppointments(response.data.appointments);
    } catch (error) {
      NotificationService.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.put(`/appointments/${appointmentId}/cancel`, {
        cancellationReason: 'Patient cancelled'
      });
      
      NotificationService.success('Appointment cancelled successfully');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      NotificationService.error('Failed to cancel appointment');
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

  const getAppointmentIcon = (type) => {
    switch (type) {
      case 'video': return '📹';
      case 'audio': return '📞';
      case 'in-person': return '🏢';
      case 'chat': return '💬';
      default: return '📅';
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
              onClick={() => setActiveTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past
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

        {/* Book New Appointment Button */}
        {activeTab === 'upcoming' && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/doctors')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
            >
              + Book New Appointment
            </button>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming appointments' : 
                 activeTab === 'past' ? 'No past appointments' : 'No cancelled appointments'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'upcoming' 
                  ? 'You don\'t have any upcoming appointments. Book one to get started.' 
                  : 'You don\'t have any appointments in this category.'}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => navigate('/doctors')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Browse Doctors
                </button>
              )}
            </div>
          ) : (
            appointments.map(appointment => (
              <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getAppointmentIcon(appointment.consultationType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctorId.userId.firstName} {appointment.doctorId.userId.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{appointment.doctorId.specialization}</p>
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
                    
                    {appointment.reason && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Reason for visit</p>
                        <p className="text-gray-900">{appointment.reason}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}/confirm`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Confirm
                      </button>
                    )}
                    
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {appointment.status === 'in-progress' && (
                      <button
                        onClick={() => navigate(`/consultations/${appointment._id}/join`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        Join Session
                      </button>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                      >
                        View Details
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

export default AppointmentsPage;