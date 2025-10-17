import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const AppointmentBooking = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { doctorId: urlParamDoctorId } = useParams(); // Get doctorId from URL parameter
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    startTime: '',
    endTime: '',
    consultationType: 'video',
    reason: '',
    hospitalId: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Get doctorId from URL parameter, then query params, then location state as fallback
  const urlDoctorId = searchParams.get('doctorId');
  const stateDoctorId = location.state?.doctorId;
  const doctorId = urlParamDoctorId || urlDoctorId || stateDoctorId;

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    } else {
      navigate('/doctors');
    }
  }, [doctorId, navigate]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      setDoctor(response.data);
      
      // Fetch available slots
      const availability = await api.get(`/doctors/availability/${doctorId}`);
      generateAvailableSlots(availability.data.availability, availability.data.workingHours);
    } catch (error) {
      NotificationService.error('Failed to load doctor details');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableSlots = (availability, workingHours) => {
    // This is a simplified version - in a real app, you'd check against existing appointments
    // and consider the doctor's availability
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const slots = [];
    
    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Use working hours as default, with adjustments for the day of week if available
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayAvailability = availability[dayOfWeek];
      
      const startHour = workingHours?.startTime || '09:00';
      const endHour = workingHours?.endTime || '17:00';
      
      // Generate 30-minute slots between working hours
      const [startHours, startMinutes] = startHour.split(':').map(Number);
      const [endHours, endMinutes] = endHour.split(':').map(Number);
      
      let currentHour = startHours;
      let currentMinute = startMinutes;
      
      while (
        (currentHour < endHours) || 
        (currentHour === endHours && currentMinute < endMinutes)
      ) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        
        // Add to available slots
        slots.push({
          date: new Date(date).toISOString().split('T')[0],
          time: timeString,
          endTime: calculateEndTime(timeString)
        });
        
        // Add 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute = 0;
        }
      }
    }
    
    setAvailableSlots(slots);
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours++;
      endMinutes = endMinutes - 60;
    }
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingForm({
      ...bookingForm,
      appointmentDate: slot.date,
      startTime: slot.time,
      endTime: slot.endTime
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      NotificationService.error('Please select an available time slot');
      return;
    }
    
    try {
      const bookingData = {
        ...bookingForm,
        doctorId,
        appointmentDate: new Date(`${bookingForm.appointmentDate}T00:00:00`).toISOString()
      };
      
      const response = await api.post('/appointments/book', bookingData);
      NotificationService.success('Appointment booked successfully!');
      
      // Navigate to appointments page
      navigate('/appointments');
    } catch (error) {
      NotificationService.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleInputChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor not found</h3>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doctor Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            {doctor.userId.profilePicture ? (
              <img
                src={doctor.userId.profilePicture}
                alt={`${doctor.userId.firstName} ${doctor.userId.lastName}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {doctor.userId.firstName?.charAt(0)}{doctor.userId.lastName?.charAt(0)}
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Dr. {doctor.userId.firstName} {doctor.userId.lastName}
              </h2>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(doctor.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">
                  {doctor.rating.average} ({doctor.rating.count} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Type
                    </label>
                    <select
                      name="consultationType"
                      value={bookingForm.consultationType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {doctor.consultationTypes && doctor.consultationTypes.length > 0 
                        ? doctor.consultationTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))
                        : ['video', 'audio', 'in-person', 'chat'].map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Visit
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={bookingForm.reason}
                      onChange={handleInputChange}
                      placeholder="Brief reason for appointment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date & Time
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Select from available time slots:</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-2 text-sm rounded border ${
                            selectedSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{slot.date}</div>
                          <div>{slot.time} - {slot.endTime}</div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center w-full">No available slots</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedSlot}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      selectedSlot
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Appointment Summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Summary</h3>
              
              {selectedSlot ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{selectedSlot.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{selectedSlot.time} - {selectedSlot.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">30 minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium capitalize">{bookingForm.consultationType}</p>
                  </div>
                  {bookingForm.reason && (
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium">{bookingForm.reason}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    {doctor.consultationFee?.amount > 0 ? (
                      <p className="text-lg font-bold text-green-600">
                        ${doctor.consultationFee.amount} {doctor.consultationFee.currency}
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-green-600">Free</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a time slot to see appointment details</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentBooking;