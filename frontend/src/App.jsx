import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NotificationProvider from './components/common/NotificationProvider';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './components/common/MainLayout';
import AdminLayout from './components/common/AdminLayout';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import JournalPage from './pages/JournalPage';
import ForumPage from './pages/ForumPage';
import CoursesPage from './pages/CoursesPage';
import ChatPage from './pages/ChatPage';
import CabBookingPage from './pages/CabBookingPage';
import GuidedMeditationPage from './pages/GuidedMeditationPage';
import NotFoundPage from './pages/NotFoundPage';
import AppointmentBooking from './pages/AppointmentBooking';

// Assessment sub-pages
import PHQ9Assessment from './pages/Assessments/PHQ9Assessment';
import AssessmentResult from './pages/Assessments/AssessmentResult';

// Doctor-specific pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import DoctorAppointments from './pages/DoctorAppointments';

// Hospital-specific pages
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalProfile from './pages/HospitalProfile';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AddDoctor from './pages/AddDoctor';
import AdminDoctors from './pages/AdminDoctors';
import AdminUsers from './pages/AdminUsers';
import AdminHospitals from './pages/AdminHospitals';
import AdminCourses from './pages/AdminCourses';
import AdminForum from './pages/AdminForum';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/add-doctor" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AddDoctor /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/doctors" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminDoctors /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/hospitals" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminHospitals /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/courses" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminCourses /></AdminLayout></PrivateRoute>} />
              <Route path="/admin/forum" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout><AdminForum /></AdminLayout></PrivateRoute>} />
              
              {/* User Routes */}
              <Route path="/dashboard" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
              <Route path="/doctors" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><DoctorsPage /></MainLayout></PrivateRoute>} />
              <Route path="/appointments" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><AppointmentsPage /></MainLayout></PrivateRoute>} />
              <Route path="/appointments/book" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><AppointmentBooking /></MainLayout></PrivateRoute>} />
              <Route path="/appointments/book/:doctorId" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><AppointmentBooking /></MainLayout></PrivateRoute>} />
              <Route path="/prescriptions" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><PrescriptionsPage /></MainLayout></PrivateRoute>} />
              <Route path="/assessments" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><AssessmentsPage /></MainLayout></PrivateRoute>} />
              <Route path="/assessments/:type/take" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><PHQ9Assessment /></MainLayout></PrivateRoute>} />
              <Route path="/assessments/:id" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><AssessmentResult /></MainLayout></PrivateRoute>} />
              <Route path="/journal" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><JournalPage /></MainLayout></PrivateRoute>} />
              <Route path="/meditation" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><GuidedMeditationPage /></MainLayout></PrivateRoute>} />
              <Route path="/forum" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><ForumPage /></MainLayout></PrivateRoute>} />
              <Route path="/courses" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><CoursesPage /></MainLayout></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><ChatPage /></MainLayout></PrivateRoute>} />
              <Route path="/cab-booking" element={<PrivateRoute allowedRoles={['patient', 'doctor', 'hospital']}><MainLayout><CabBookingPage /></MainLayout></PrivateRoute>} />
              
              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<PrivateRoute allowedRoles={['doctor']}><MainLayout><DoctorDashboard /></MainLayout></PrivateRoute>} />
              <Route path="/doctor/profile" element={<PrivateRoute allowedRoles={['doctor']}><MainLayout><DoctorProfile /></MainLayout></PrivateRoute>} />
              <Route path="/doctor/appointments" element={<PrivateRoute allowedRoles={['doctor']}><MainLayout><DoctorAppointments /></MainLayout></PrivateRoute>} />
              
              {/* Hospital Routes */}
              <Route path="/hospital/dashboard" element={<PrivateRoute allowedRoles={['hospital']}><MainLayout><HospitalDashboard /></MainLayout></PrivateRoute>} />
              <Route path="/hospital/profile" element={<PrivateRoute allowedRoles={['hospital']}><MainLayout><HospitalProfile /></MainLayout></PrivateRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
