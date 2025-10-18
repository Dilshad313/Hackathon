const axios = require('axios');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASS;
    const baseURL = `http://localhost:${process.env.PORT || 5000}`;

    console.log('Testing Admin Login...');
    console.log('Base URL:', baseURL);
    console.log('Admin Email:', adminEmail);
    console.log('---');

    // Test login
    const loginResponse = await axios.post(`${baseURL}/api/users/login`, {
      email: adminEmail,
      password: adminPassword
    });

    if (loginResponse.data.token) {
      console.log('\n✓ Login successful!');
      console.log('Token received:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('User Info:', {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email,
        username: loginResponse.data.user.username,
        role: loginResponse.data.user.role
      });

      // Test admin dashboard access
      console.log('\nTesting admin dashboard access...');
      const dashboardResponse = await axios.get(`${baseURL}/api/admin/dashboard`, {
        headers: {
          'x-auth-token': loginResponse.data.token
        }
      });

      console.log('✓ Admin dashboard accessible!');
      console.log('Dashboard Data:', {
        totalUsers: dashboardResponse.data.totalUsers,
        totalDoctors: dashboardResponse.data.totalDoctors,
        totalHospitals: dashboardResponse.data.totalHospitals,
        totalCourses: dashboardResponse.data.totalCourses
      });

      console.log('\n✓ All tests passed! Admin login is working correctly.');
    }
  } catch (error) {
    console.error('\n✗ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Make sure to start the server with: npm run dev');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
};

testAdminLogin();
