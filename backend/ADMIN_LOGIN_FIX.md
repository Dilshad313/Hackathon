# Admin Login Fix Guide

## Problem
Admin login is not working in the SoulSync application.

## Solution

### Quick Fix (Recommended)
Run the automated fix script that will diagnose and fix all admin login issues:

```bash
cd backend
npm run fix:admin
```

This script will:
- Check if admin user exists in the database
- Create admin user if it doesn't exist
- Fix the admin role if incorrect
- Reset the password if it doesn't match
- Verify the password hashing is working correctly
- Activate the account if it's inactive

### Manual Fix

#### Step 1: Seed the Admin User
```bash
cd backend
npm run seed:admin
```

#### Step 2: Verify Admin User
```bash
npm run verify:admin
```

#### Step 3: Test Admin Login
```bash
npm run test:admin
```

## Admin Credentials

The admin credentials are stored in the `.env` file:

```
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=password
```

## Login Process

1. **Frontend Login**: Navigate to `/login` page
2. **Enter Credentials**:
   - Email: `admin@gmail.com`
   - Password: `password`
3. **After Login**: You will be redirected to `/admin/dashboard`

## API Endpoints

### Login Endpoint
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "password"
}
```

### Admin Dashboard
```
GET http://localhost:5000/api/admin/dashboard
Headers:
  x-auth-token: <your-jwt-token>
```

## Common Issues and Solutions

### Issue 1: "Invalid credentials"
**Cause**: Admin user doesn't exist or password is incorrect
**Solution**: Run `npm run fix:admin`

### Issue 2: "Access denied. Admin role required"
**Cause**: User exists but role is not set to 'admin'
**Solution**: Run `npm run fix:admin`

### Issue 3: "Token is not valid"
**Cause**: JWT token expired or invalid
**Solution**: Login again to get a new token

### Issue 4: "User not found"
**Cause**: Admin user doesn't exist in database
**Solution**: Run `npm run seed:admin`

## Troubleshooting Steps

1. **Check if server is running**:
   ```bash
   npm run dev
   ```

2. **Check MongoDB connection**:
   - Verify `MONGODB_URI` in `.env` file
   - Ensure MongoDB is accessible

3. **Check admin user in database**:
   ```bash
   npm run verify:admin
   ```

4. **Reset admin user**:
   ```bash
   npm run fix:admin
   ```

5. **Test login via API**:
   ```bash
   npm run test:admin
   ```

## Technical Details

### User Model
- Role: `admin` (required for admin access)
- Email: Must match `ADMIN_EMAIL` in `.env`
- Password: Hashed using bcrypt with salt rounds of 12
- Active: Must be `true`
- Email Verified: Should be `true`

### Authentication Flow
1. User submits email and password to `/api/users/login`
2. Server finds user by email with password field included
3. Password is compared using bcrypt
4. JWT token is generated with user ID and role
5. Token is returned to client
6. Client stores token in localStorage
7. Token is sent in `x-auth-token` header for protected routes

### Admin Authorization
The `adminAuth` middleware checks:
1. Valid JWT token exists
2. User exists and is active
3. User role is 'admin'

## Support

If you continue to experience issues after running the fix script:

1. Check the console logs for detailed error messages
2. Verify your `.env` file has the correct MongoDB URI
3. Ensure the backend server is running
4. Check network connectivity to MongoDB

## Files Modified

- `backend/scripts/seedAdmin.js` - Improved admin seeding
- `backend/scripts/fixAdminLogin.js` - New automated fix script
- `backend/package.json` - Added `fix:admin` script
