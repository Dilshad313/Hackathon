import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Bed, 
  Star, 
  AlertCircle,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotificationService from '../utils/notifications';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    rating: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch hospital profile
      const hospitalResponse = await api.get('/hospitals/profile');
      setHospitalInfo(hospitalResponse.data);

      // Fetch dashboard stats
      const statsResponse = await api.get('/hospitals/dashboard-stats');
      setDashboardData(statsResponse.data);

      // Fetch recent appointments
      const appointmentsResponse = await api.get('/appointments?limit=5');
      setRecentAppointments(appointmentsResponse.data.appointments || []);
    } catch (error) {
      NotificationService.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const StatCard = ({ title, value, subtitle, icon: Icon, color, index }) => (
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
      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hospital Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {hospitalInfo?.name || 'Hospital Dashboard'}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {hospitalInfo?.address?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hospitalInfo.address.city}, {hospitalInfo.address.state}
                    </div>
                  )}
                  {hospitalInfo?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {hospitalInfo.phone}
                    </div>
                  )}
                  {hospitalInfo?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {hospitalInfo.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/hospital/profile"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Edit Profile
            </Link>
          </div>
        </motion.div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Doctors"
            value={dashboardData.totalDoctors}
            subtitle="On staff"
            icon={Stethoscope}
            color="from-blue-500 to-blue-600"
            index={0}
          />
          <StatCard
            title="Total Appointments"
            value={dashboardData.totalAppointments}
            subtitle="All time"
            icon={Calendar}
            color="from-green-500 to-green-600"
            index={1}
          />
          <StatCard
            title="Today's Appointments"
            value={dashboardData.todayAppointments}
            subtitle="Scheduled today"
            icon={Clock}
            color="from-purple-500 to-purple-600"
            index={2}
          />
          <StatCard
            title="Hospital Rating"
            value={dashboardData.rating || '4.5'}
            subtitle="Out of 5 stars"
            icon={Star}
            color="from-yellow-500 to-yellow-600"
            index={3}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              to="/hospital/profile" 
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="font-semibold text-gray-900">Hospital Profile</div>
              <p className="text-xs text-gray-600 mt-1">Update information</p>
            </Link>
            
            <Link 
              to="/hospital/doctors" 
              className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-semibold text-gray-900">Manage Doctors</div>
              <p className="text-xs text-gray-600 mt-1">View all doctors</p>
            </Link>
            
            <Link 
              to="/appointments" 
              className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="font-semibold text-gray-900">Appointments</div>
              <p className="text-xs text-gray-600 mt-1">Manage bookings</p>
            </Link>

            <Link 
              to="/doctors" 
              className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="font-semibold text-gray-900">Find Doctors</div>
              <p className="text-xs text-gray-600 mt-1">Browse network</p>
            </Link>
          </div>
        </motion.div>

        {/* Appointment Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending</h3>
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold mb-2">{dashboardData.pendingAppointments}</div>
            <p className="text-blue-100">Awaiting confirmation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Completed</h3>
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold mb-2">{dashboardData.completedAppointments}</div>
            <p className="text-green-100">Successfully finished</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Success Rate</h3>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <p className="text-purple-100">Patient satisfaction</p>
          </motion.div>
        </div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Recent Appointments
            </h2>
            <Link
              to="/appointments"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default HospitalDashboard;