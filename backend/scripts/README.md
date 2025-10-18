# Backend Scripts

This directory contains utility scripts for managing the SoulSync backend.

## Available Scripts

### 1. seedAdmin.js
**Purpose:** Create or update the admin user in MongoDB

**Usage:**
```bash
npm run seed:admin
```

**What it does:**
- Connects to MongoDB
- Reads admin credentials from `.env` file
- Creates new admin user or updates existing one
- Hashes password securely
- Sets role to 'admin'

**Output:**
```
Connected to MongoDB
Admin user created successfully
Email: admin@gmail.com
Username: admin
Role: admin
```

---

### 2. verifyAdmin.js
**Purpose:** Verify that the admin user is correctly set up

**Usage:**
```bash
npm run verify:admin
```

**What it does:**
- Connects to MongoDB
- Searches for admin user by email
- Displays admin user details
- Verifies role is set to 'admin'

**Output:**
```
✓ Admin user found in database
Email: admin@gmail.com
Username: admin
Role: admin
Active: true
Email Verified: true
```

---

### 3. testAdminLogin.js
**Purpose:** Test the complete admin login flow

**Prerequisites:** Server must be running (`npm run dev`)

**Usage:**
```bash
npm run test:admin
```

**What it does:**
- Attempts to login with admin credentials
- Verifies JWT token is received
- Tests admin dashboard access
- Displays dashboard statistics

**Output:**
```
Testing Admin Login...
✓ Login successful!
Token received: eyJhbGciOiJIUzI1NiIsInR5...
User Info: { id: '...', email: 'admin@gmail.com', role: 'admin' }

Testing admin dashboard access...
✓ Admin dashboard accessible!
Dashboard Data: { totalUsers: 5, totalDoctors: 2, ... }

✓ All tests passed! Admin login is working correctly.
```

---

## Workflow

### First Time Setup
```bash
# 1. Create admin user
npm run seed:admin

# 2. Verify it was created
npm run verify:admin

# 3. Start server
npm run dev

# 4. Test login (in another terminal)
npm run test:admin
```

### Troubleshooting
```bash
# If login fails, recreate admin user
npm run seed:admin

# Verify the user exists
npm run verify:admin
```

---

## Environment Variables Required

These scripts require the following environment variables in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/mindsync
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=password
JWT_SECRET=your-secret-key
PORT=5000
```

---

## Error Handling

All scripts include error handling and will:
- Display clear error messages
- Exit with appropriate status codes
- Provide troubleshooting hints

---

## Adding New Scripts

To add a new script:

1. Create the script file in this directory
2. Add it to `package.json` scripts section:
   ```json
   "your-script": "node scripts/yourScript.js"
   ```
3. Document it in this README
4. Follow the existing pattern for error handling and output

---

## Notes

- All scripts use `dotenv` to load environment variables
- MongoDB connection is established at the start of each script
- Scripts exit cleanly after completion
- Use `console.log` for success messages and `console.error` for errors
