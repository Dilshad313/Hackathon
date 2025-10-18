# Remaining Pages to Update with Navbar

## Pages Updated ✅
1. ✅ DashboardPage
2. ✅ AdminDashboard
3. ✅ DoctorsPage
4. ✅ AppointmentsPage
5. ✅ ProfilePage
6. ✅ AssessmentsPage

## Pages to Update

### User Panel Pages
- [ ] JournalPage
- [ ] ForumPage
- [ ] CoursesPage
- [ ] ChatPage
- [ ] CabBookingPage
- [ ] PrescriptionsPage
- [ ] AppointmentBooking

### Admin Pages
- [ ] AddDoctor
- [ ] AdminDoctors

### Doctor Pages
- [ ] DoctorDashboard
- [ ] DoctorProfile
- [ ] DoctorAppointments

### Hospital Pages
- [ ] HospitalDashboard
- [ ] HospitalProfile

## Update Pattern

For each page:

1. Add import:
```jsx
import Navbar from '../components/common/Navbar';
```

2. Replace header section:
```jsx
// Remove this:
<header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
    <button onClick={logout}>Logout</button>
  </div>
</header>

// With this:
<Navbar title="Page Title" />
```
