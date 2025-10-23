import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/common/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentBooking from './pages/AppointmentBooking';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import PHQ9Assessment from './pages/Assessments/PHQ9Assessment';
import AssessmentResult from './pages/Assessments/AssessmentResult';
import JournalPage from './pages/JournalPage';
import GuidedMeditationPage from './pages/GuidedMeditationPage';
import ForumPage from './pages/ForumPage';
import CoursesPage from './pages/CoursesPage';
import ChatPage from './pages/ChatPage';
import CabBookingPage from './pages/CabBookingPage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import DoctorAppointments from './pages/DoctorAppointments';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalProfile from './pages/HospitalProfile';
import NotFoundPage from './pages/NotFoundPage';

const UserRoutes = () => (
  <MainLayout>
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="doctors" element={<DoctorsPage />} />
      <Route path="appointments" element={<AppointmentsPage />} />
      <Route path="appointments/book" element={<AppointmentBooking />} />
      <Route path="appointments/book/:doctorId" element={<AppointmentBooking />} />
      <Route path="prescriptions" element={<PrescriptionsPage />} />
      <Route path="assessments" element={<AssessmentsPage />} />
      <Route path="assessments/:type/take" element={<PHQ9Assessment />} />
      <Route path="assessments/:id" element={<AssessmentResult />} />
      <Route path="journal" element={<JournalPage />} />
      <Route path="meditation" element={<GuidedMeditationPage />} />
      <Route path="forum" element={<ForumPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="cab-booking" element={<CabBookingPage />} />
      
      {/* Doctor Routes */}
      <Route path="doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="doctor/profile" element={<DoctorProfile />} />
      <Route path="doctor/appointments" element={<DoctorAppointments />} />

      {/* Hospital Routes */}
      <Route path="hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="hospital/profile" element={<HospitalProfile />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </MainLayout>
);

export default UserRoutes;
