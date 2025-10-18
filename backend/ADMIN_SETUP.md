# Admin Setup Guide

## Overview
This guide explains how to set up and login as an admin user in the SoulSync application.

## Admin Credentials
Admin credentials are stored in the `.env` file:
```
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=password
```

## Setup Steps

### 1. Verify MongoDB is Running
Make sure MongoDB is running on your system:
```bash
# Check if MongoDB is running
mongosh
```

### 2. Create Admin User in Database
Run the seed script to create/update the admin user in MongoDB:

```bash
npm run seed:admin
```

This script will:
- Connect to your MongoDB database
- Check if an admin user exists with the email from `.env`
- Create a new admin user if it doesn't exist
- Update the existing admin user if it already exists
- Set the role to 'admin'
- Hash the password securely

Expected output:
```
Connected to MongoDB
Admin user created successfully
Email: admin@gmail.com
Username: admin
Role: admin

You can now login with:
Email: admin@gmail.com
Password: password
```

### 3. Verify Admin User (Optional)
Verify the admin user was created correctly:

```bash
npm run verify:admin
```

### 4. Login as Admin
After running the seed script, you can login using:

**Email:** `admin@gmail.com`  
**Password:** `password`

Use the standard login endpoint:
```
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "password"
}
```

### 5. Test Admin Login (Optional)
Test the complete admin login flow:

```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the test
npm run test:admin
```

### 6. Access Admin Routes
Once logged in, you'll receive a JWT token. Use this token to access admin-only routes:

```
GET /api/admin/dashboard
Headers:
  x-auth-token: <your-jwt-token>
```

## Available Admin Routes

### Dashboard
- `GET /api/admin/dashboard` - Get admin dashboard statistics

### User Management
- `GET /api/admin/users` - Get all users (with pagination, filtering)
- `PUT /api/admin/users/:id/toggle-status` - Toggle user active status

### Doctor Approval
- `GET /api/admin/doctors` - Get doctors pending approval
- `PUT /api/admin/doctors/:id/approve` - Approve/reject doctor

### Hospital Approval
- `GET /api/admin/hospitals` - Get hospitals pending approval
- `PUT /api/admin/hospitals/:id/approve` - Approve/reject hospital

### Course Management
- `GET /api/admin/courses` - Get courses pending approval
- `PUT /api/admin/courses/:id/approve` - Approve/reject course

### Forum Moderation
- `GET /api/admin/forum-posts` - Get forum posts for moderation
- `PUT /api/admin/forum-posts/:id/toggle-status` - Change post status
- `DELETE /api/admin/forum-posts/:id` - Delete forum post

### Notifications
- `POST /api/admin/notifications/send` - Send system notifications to users

## Security Notes

1. **Change Default Password**: After first login, change the default password to something secure
2. **Environment Variables**: Never commit the `.env` file to version control
3. **JWT Token**: Keep your JWT token secure and don't share it
4. **Admin Role**: The admin role has elevated privileges - use responsibly

## Troubleshooting

### Admin user not found
Run the seed script again:
```bash
npm run seed:admin
```

### Invalid credentials
1. Verify the credentials in `.env` file
2. Run the seed script to reset the password
3. Check MongoDB to ensure the user exists

### Access denied
1. Ensure you're using the correct JWT token
2. Verify the user role is set to 'admin' in the database
3. Check that the token hasn't expired (7 days validity)

## Database Structure

The admin user is stored in the `users` collection with:
- `email`: admin@gmail.com
- `username`: admin
- `role`: admin
- `password`: (hashed)
- `isActive`: true
- `isEmailVerified`: true
