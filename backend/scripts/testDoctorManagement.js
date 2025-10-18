const axios = require('axios');
require('dotenv').config();

const baseURL = `http://localhost:${process.env.PORT || 5000}`;
let adminToken = '';
let createdDoctorId = '';

const testDoctorManagement = async () => {
  try {
    console.log('🧪 Testing Admin Doctor Management Features\n');
    console.log('=' .repeat(60));

    // Step 1: Admin Login
    console.log('\n1️⃣  Testing Admin Login...');
    const loginResponse = await axios.post(`${baseURL}/api/users/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASS
    });

    if (loginResponse.data.token) {
      adminToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Token: ${adminToken.substring(0, 20)}...`);
    }

    // Step 2: Test Dashboard
    console.log('\n2️⃣  Testing Enhanced Dashboard...');
    const dashboardResponse = await axios.get(`${baseURL}/api/admin/dashboard`, {
      headers: { 'x-auth-token': adminToken }
    });

    console.log('✅ Dashboard loaded successfully');
    console.log(`   Total Users: ${dashboardResponse.data.totalUsers}`);
    console.log(`   Total Doctors: ${dashboardResponse.data.totalDoctors}`);
    console.log(`   Pending Doctors: ${dashboardResponse.data.doctorStats.pending}`);
    console.log(`   Approved Doctors: ${dashboardResponse.data.doctorStats.approved}`);
    console.log(`   Active Users: ${dashboardResponse.data.userStats.active}`);

    // Step 3: Add New Doctor
    console.log('\n3️⃣  Testing Add New Doctor...');
    const newDoctor = {
      email: `doctor_${Date.now()}@test.com`,
      username: `dr_test_${Date.now()}`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Doctor',
      phone: '+1234567890',
      licenseNumber: `MD${Date.now()}`,
      specialization: 'Psychiatry',
      qualifications: [
        {
          degree: 'MD',
          institution: 'Test Medical School',
          year: 2015
        }
      ],
      yearsOfExperience: 5,
      bio: 'Test doctor for automated testing',
      consultationFee: {
        amount: 100,
        currency: 'USD'
      },
      languages: ['English'],
      consultationTypes: ['video', 'audio'],
      workingHours: {
        startTime: '09:00',
        endTime: '17:00'
      }
    };

    const addDoctorResponse = await axios.post(
      `${baseURL}/api/admin/doctors/add`,
      newDoctor,
      { headers: { 'x-auth-token': adminToken } }
    );

    if (addDoctorResponse.data.doctor) {
      createdDoctorId = addDoctorResponse.data.doctor._id;
      console.log('✅ Doctor added successfully');
      console.log(`   Doctor ID: ${createdDoctorId}`);
      console.log(`   Email: ${addDoctorResponse.data.doctor.userId.email}`);
      console.log(`   License: ${addDoctorResponse.data.doctor.licenseNumber}`);
      console.log(`   Status: ${addDoctorResponse.data.doctor.adminApprovalStatus}`);
    }

    // Step 4: Get All Doctors
    console.log('\n4️⃣  Testing Get All Doctors...');
    const allDoctorsResponse = await axios.get(
      `${baseURL}/api/admin/doctors?page=1&limit=10`,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Retrieved all doctors');
    console.log(`   Total Doctors: ${allDoctorsResponse.data.total}`);
    console.log(`   Current Page: ${allDoctorsResponse.data.currentPage}`);
    console.log(`   Total Pages: ${allDoctorsResponse.data.totalPages}`);

    // Step 5: Get Single Doctor
    console.log('\n5️⃣  Testing Get Single Doctor...');
    const singleDoctorResponse = await axios.get(
      `${baseURL}/api/admin/doctors/${createdDoctorId}`,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Retrieved doctor details');
    console.log(`   Name: ${singleDoctorResponse.data.userId.firstName} ${singleDoctorResponse.data.userId.lastName}`);
    console.log(`   Specialization: ${singleDoctorResponse.data.specialization}`);
    console.log(`   Experience: ${singleDoctorResponse.data.yearsOfExperience} years`);

    // Step 6: Update Doctor
    console.log('\n6️⃣  Testing Update Doctor...');
    const updateData = {
      specialization: 'Clinical Psychology',
      yearsOfExperience: 7,
      consultationFee: {
        amount: 150,
        currency: 'USD'
      },
      isAvailable: true
    };

    const updateResponse = await axios.put(
      `${baseURL}/api/admin/doctors/${createdDoctorId}`,
      updateData,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Doctor updated successfully');
    console.log(`   New Specialization: ${updateResponse.data.doctor.specialization}`);
    console.log(`   New Fee: $${updateResponse.data.doctor.consultationFee.amount}`);
    console.log(`   Available: ${updateResponse.data.doctor.isAvailable}`);

    // Step 7: Search Doctors
    console.log('\n7️⃣  Testing Search Doctors...');
    const searchResponse = await axios.get(
      `${baseURL}/api/admin/doctors?search=test&adminApprovalStatus=approved`,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Search completed');
    console.log(`   Results found: ${searchResponse.data.total}`);

    // Step 8: Filter by Specialization
    console.log('\n8️⃣  Testing Filter by Specialization...');
    const filterResponse = await axios.get(
      `${baseURL}/api/admin/doctors?specialization=Psychology`,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Filter applied');
    console.log(`   Doctors with Psychology specialization: ${filterResponse.data.total}`);

    // Step 9: Delete Doctor
    console.log('\n9️⃣  Testing Delete Doctor...');
    const deleteResponse = await axios.delete(
      `${baseURL}/api/admin/doctors/${createdDoctorId}`,
      { headers: { 'x-auth-token': adminToken } }
    );

    console.log('✅ Doctor deleted successfully');
    console.log(`   Message: ${deleteResponse.data.message}`);

    // Final Dashboard Check
    console.log('\n🔟 Final Dashboard Check...');
    const finalDashboard = await axios.get(`${baseURL}/api/admin/dashboard`, {
      headers: { 'x-auth-token': adminToken }
    });

    console.log('✅ Final dashboard loaded');
    console.log(`   Total Doctors: ${finalDashboard.data.totalDoctors}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✓ Admin Login');
    console.log('   ✓ Enhanced Dashboard');
    console.log('   ✓ Add Doctor');
    console.log('   ✓ Get All Doctors');
    console.log('   ✓ Get Single Doctor');
    console.log('   ✓ Update Doctor');
    console.log('   ✓ Search Doctors');
    console.log('   ✓ Filter Doctors');
    console.log('   ✓ Delete Doctor');
    console.log('\n🎉 Admin Doctor Management is fully functional!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('='.repeat(60));
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data}`);
      console.error(`URL: ${error.config.url}`);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Make sure the server is running: npm run dev');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
};

// Run tests
console.log('\n🚀 Starting Admin Doctor Management Tests...');
console.log(`Server: ${baseURL}`);
console.log(`Admin Email: ${process.env.ADMIN_EMAIL}\n`);

testDoctorManagement();
