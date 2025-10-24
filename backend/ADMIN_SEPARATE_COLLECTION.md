# Admin Separate Collection Implementation

## Overview

The admin system has been updated to use a **separate Admin collection** instead of storing admins in the User collection. This provides better security, separation of concerns, and dedicated admin features.

## What Changed

### 1. New Admin Model (`models/Admin.js`)
- Standalone collection with its own schema
- Fields: email, username, password, firstName, lastName, role, permissions, etc.
- Built-in password hashing with bcrypt
- Login attempt tracking and account locking
- Roles: super-admin, moderator, content-manager, support-agent

### 2. New Admin Auth Routes (`routes/adminAuthRoutes.js`)
- **POST /api/admin/auth/login** - Admin login (separate from user login)
- **POST /api/admin/auth/register** - Create new admin (super-admin only)
- **GET /api/admin/auth/profile** - Get admin profile
- **PUT /api/admin/auth/profile** - Update admin profile
- **PUT /api/admin/auth/change-password** - Change admin password
- **GET /api/admin/auth/list** - List all admins (super-admin only)
- **PUT /api/admin/auth/:id/toggle-status** - Activate/deactivate admin

### 3. Updated Middleware (`middleware/auth.js`)
- `adminAuth` now checks Admin collection first
- Backward compatible with User-based admins
- Better error handling and security checks

### 4. Updated Frontend
- `AuthContext.jsx` - Supports both user and admin login
- `LoginPage.jsx` - Auto-detects admin login by email
- Separate endpoints for admin authentication

## Setup Instructions

### Step 1: Seed Admin Collection

Run this command to create the admin user in the new Admin collection:

```bash
cd backend
npm run seed:admin-collection
```

This will:
- Create admin user in the Admin collection
- Use credentials from `.env` file (ADMIN_EMAIL and ADMIN_PASS)
- Verify password hashing works correctly

### Step 2: Restart Backend Server

```bash
npm run dev
```

### Step 3: Test Admin Login

#### Option A: Via Frontend
1. Go to `http://localhost:5173/login`
2. Enter:
   - Email: `admin@gmail.com`
   - Password: `password`
3. You'll be redirected to `/admin/dashboard`

#### Option B: Via API
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"password"}'
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "admin": {
    "id": "...",
    "email": "admin@gmail.com",
    "username": "admin",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "super-admin",
    "type": "admin"
  }
}
```

## API Endpoints

### Admin Authentication

#### Login
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "password"
}
```

#### Get Profile
```http
GET /api/admin/auth/profile
x-auth-token: <your-jwt-token>
```

#### Update Profile
```http
PUT /api/admin/auth/profile
x-auth-token: <your-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Change Password
```http
PUT /api/admin/auth/change-password
x-auth-token: <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Create New Admin (Super-Admin Only)
```http
POST /api/admin/auth/register
x-auth-token: <super-admin-token>
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "username": "newadmin",
  "password": "securepassword",
  "firstName": "New",
  "lastName": "Admin",
  "role": "moderator"
}
```

## Admin Roles

### super-admin
- Full access to all features
- Can create/manage other admins
- Can access all sections

### moderator
- Moderate forum posts
- Manage user reports
- Limited admin access

### content-manager
- Manage courses
- Manage educational content
- No user management

### support-agent
- Handle user support tickets
- View user issues
- Limited admin access

## Security Features

### Password Hashing
- Bcrypt with 12 salt rounds
- Automatic hashing on save
- Secure password comparison

### Account Locking
- 5 failed login attempts = 2-hour lock
- Automatic unlock after timeout
- Login attempts reset on success

### Token-Based Auth
- JWT tokens with 7-day expiration
- Token includes admin ID and role
- Separate token structure from user tokens

### Permission Checks
- Role-based access control
- Middleware validates admin status
- Protected routes require admin token

## Database Structure

### Admin Collection Schema
```javascript
{
  email: String (unique, required),
  username: String (unique, required),
  password: String (hashed, required),
  firstName: String,
  lastName: String,
  role: String (enum: super-admin, moderator, etc.),
  permissions: [{ resource: String, actions: [String] }],
  phone: String,
  profilePicture: String,
  lastLoginAt: Date,
  loginAttempts: Number,
  lockedUntil: Date,
  isActive: Boolean,
  isEmailVerified: Boolean,
  assignedSections: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Migration from User-Based Admin

The system maintains **backward compatibility**:

1. Old admin users (in User collection with role='admin') still work
2. Middleware checks Admin collection first, then falls back to User collection
3. Gradually migrate admins to new collection using the register endpoint

## Troubleshooting

### Issue: "Invalid credentials" when logging in

**Solution:**
```bash
npm run seed:admin-collection
```

### Issue: "Admin not found"

**Cause:** Admin doesn't exist in Admin collection

**Solution:**
```bash
npm run seed:admin-collection
```

### Issue: "Account is locked"

**Cause:** Too many failed login attempts

**Solution:** Wait 2 hours or manually unlock in database:
```javascript
db.admins.updateOne(
  { email: "admin@gmail.com" },
  { $set: { loginAttempts: 0 }, $unset: { lockedUntil: 1 } }
)
```

### Issue: Token not working

**Cause:** Using old user token for admin endpoints

**Solution:** Login again using `/api/admin/auth/login` to get admin token

## Testing

### Test Admin Login
```bash
npm run test:admin
```

### Manual Testing Checklist
- [ ] Admin can login via `/api/admin/auth/login`
- [ ] Admin receives JWT token
- [ ] Token works with `/api/admin/dashboard`
- [ ] Admin can access all admin routes
- [ ] Failed login attempts are tracked
- [ ] Account locks after 5 failed attempts
- [ ] Super-admin can create new admins
- [ ] Admin can change their password
- [ ] Admin can update their profile

## Files Modified

1. `models/Admin.js` - New standalone Admin model
2. `routes/adminAuthRoutes.js` - New admin authentication routes
3. `middleware/auth.js` - Updated adminAuth middleware
4. `server.js` - Added admin auth routes
5. `frontend/src/context/AuthContext.jsx` - Support admin login
6. `frontend/src/pages/auth/LoginPage.jsx` - Auto-detect admin login
7. `scripts/seedAdminCollection.js` - Seed script for Admin collection
8. `package.json` - Added seed:admin-collection script

## Benefits of Separate Collection

1. **Security**: Admins isolated from regular users
2. **Flexibility**: Different schema and features for admins
3. **Scalability**: Easier to add admin-specific features
4. **Audit**: Better tracking of admin activities
5. **Permissions**: Granular role-based access control
6. **Maintenance**: Cleaner separation of concerns

## Next Steps

1. Run `npm run seed:admin-collection` to create admin
2. Test login via frontend or API
3. Create additional admins as needed
4. Configure permissions for different admin roles
5. Implement admin activity logging (optional)
