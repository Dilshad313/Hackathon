import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const CabBookingPage = () => {
  const [bookingForm, setBookingForm] = useState({
    pickupLocation: {
      address: '',
      coordinates: [0, 0]
    },
    dropoffLocation: {
      address: '',
      coordinates: [0, 0]
    },
    bookingType: 'to-appointment',
    scheduledTime: new Date().toISOString().slice(0, 16),
    appointmentId: '',
    hospitalId: '',
    doctorId: ''
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      const response = await api.get('/cab/my-bookings');
      setBookingHistory(response.data.bookings);
    } catch (error) {
      NotificationService.error('Failed to load booking history');
      console.error('Error fetching booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (type, e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value
      }
    }));
  };

  const handleBookCab = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const response = await api.post('/cab/book', bookingForm);
      NotificationService.success('Cab booked successfully!');
      setBookingForm({
        pickupLocation: {
          address: '',
          coordinates: [0, 0]
        },
        dropoffLocation: {
          address: '',
          coordinates: [0, 0]
        },
        bookingType: 'to-appointment',
        scheduledTime: new Date().toISOString().slice(0, 16),
        appointmentId: '',
        hospitalId: '',
        doctorId: ''
      });
      fetchBookingHistory(); // Refresh history
    } catch (error) {
      NotificationService.error('Failed to book cab');
    } finally {
      setBookingLoading(false);
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'driver-assigned': return 'bg-indigo-100 text-indigo-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-drivers-found': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Cab Booking</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Book a Cab</h2>
            
            <form onSubmit={handleBookCab} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Type
                </label>
                <select
                  name="bookingType"
                  value={bookingForm.bookingType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="to-appointment">To Appointment</option>
                  <option value="from-appointment">From Appointment</option>
                  <option value="to-pharmacy">To Pharmacy</option>
                  <option value="from-pharmacy">From Pharmacy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="address"
                  value={bookingForm.pickupLocation.address}
                  onChange={(e) => handleLocationChange('pickupLocation', e)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter pickup address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Location
                </label>
                <input
                  type="text"
                  name="address"
                  value={bookingForm.dropoffLocation.address}
                  onChange={(e) => handleLocationChange('dropoffLocation', e)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter drop-off address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment (if applicable)
                  </label>
                  <input
                    type="text"
                    name="appointmentId"
                    value={bookingForm.appointmentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Appointment ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={bookingForm.scheduledTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                >
                  {bookingLoading ? 'Booking...' : 'Book Cab'}
                </button>
              </div>
            </form>
          </div>

          {/* Booking History */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Bookings</h2>
            
            {bookingHistory.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-gray-400 text-6xl mb-4">🚕</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                <p className="text-gray-500">Your cab booking history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingHistory.map(booking => (
                  <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {booking.bookingType.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                        {booking.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">From:</span> {booking.pickupLocation.address}</p>
                      <p><span className="font-medium">To:</span> {booking.dropoffLocation.address}</p>
                      
                      {booking.driverInfo && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-medium">Driver: {booking.driverInfo.name}</p>
                          <p>License: {booking.driverInfo.licensePlate}</p>
                          {booking.trackingUrl && (
                            <a 
                              href={booking.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Track Driver →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {booking.status === 'completed' && booking.rating && (
                      <div className="mt-3 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    )}
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

export default CabBookingPage;