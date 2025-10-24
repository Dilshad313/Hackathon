# Admin Login - Quick Start Guide

## 🚨 Current Issue
```
POST http://localhost:5000/api/admin/auth/login 400 (Bad Request)
```

## ✅ Solution (Choose ONE method)

---

## Method 1: Automatic Fix (RECOMMENDED - No Commands Needed!)

The system now **auto-creates** the admin on first login attempt.

### Steps:
1. **Make sure your backend is running**
   ```bash
   cd backend
   npm run dev
   ```

2. **Go to login page**
   ```
   http://localhost:5173/login
   ```

3. **Enter credentials**
   - Email: `admin@gmail.com`
   - Password: `password`

4. **Click Login**
   - The admin will be automatically created if it doesn't exist
   - You'll be logged in and redirected to `/admin/dashboard`

**That's it!** No seed scripts needed. Just login and it works! 🎉

---

## Method 2: Initialize via Browser (1 Click)

### Step 1: Open this URL in your browser
```
http://localhost:5000/api/admin/auth/init
```

You'll see:
```json
{
  "message": "Admin initialized successfully",
  "admin": {
    "email": "admin@gmail.com",
    "username": "admin",
    "role": "super-admin"
  }
}
```

### Step 2: Now login normally
Go to `http://localhost:5173/login` and use:
- Email: `admin@gmail.com`
- Password: `password`

---

## Method 3: Initialize via Command Line

```bash
# Option A: Using curl
curl -X POST http://localhost:5000/api/admin/auth/init

# Option B: Using npm script
cd backend
npm run seed:admin-collection
```

Then login normally.

---

## 🔍 Verify Admin Exists

Check if admin is in database:
```bash
curl http://localhost:5000/api/admin/auth/status
```

Expected response:
```json
{
  "adminExists": true,
  "adminEmail": "admin@gmail.com",
  "message": "Admin exists in database",
  "admin": {
    "email": "admin@gmail.com",
    "username": "admin",
    "role": "super-admin",
    "isActive": true
  }
}
```

---

## 🧪 Test Login via API

```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"password"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

---

## 📋 Admin Credentials

From your `.env` file:
```
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=password
```

---

## 🔧 Troubleshooting

### Problem: Still getting 400 error

**Solution 1: Check backend console**
Look for error messages in your terminal where backend is running.

**Solution 2: Verify MongoDB connection**
Check if you see "Connected to MongoDB" in backend console.

**Solution 3: Check admin status**
```bash
curl http://localhost:5000/api/admin/auth/status
```

**Solution 4: Manually initialize**
```bash
curl -X POST http://localhost:5000/api/admin/auth/init
```

**Solution 5: Restart backend**
```bash
# Stop backend (Ctrl+C)
# Start again
npm run dev
```

---

### Problem: Backend not starting

```bash
cd backend
npm install
npm run dev
```

---

### Problem: "Admin already exists" but login still fails

This means password might be wrong. Reset admin:

**Option A: Via MongoDB**
```javascript
// In MongoDB shell or Compass
db.admins.deleteMany({ email: "admin@gmail.com" })
```

**Option B: Via API**
```bash
# Delete and recreate
curl -X POST http://localhost:5000/api/admin/auth/init
```

---

## 🎯 What Changed

### Before:
- Admin stored in User collection
- Login via `/api/users/login`
- Mixed with regular users
- Getting 400 errors

### After:
- Admin in separate Admin collection
- Login via `/api/admin/auth/login`
- Auto-creates on first login
- Clean separation

---

## 📍 Important Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/auth/login` | POST | Admin login |
| `/api/admin/auth/init` | POST | Create admin |
| `/api/admin/auth/status` | GET | Check admin exists |
| `/api/admin/auth/profile` | GET | Get admin profile |
| `/api/admin/dashboard` | GET | Admin dashboard data |

---

## ✨ Quick Commands Reference

```bash
# Check if backend is running
curl http://localhost:5000/health

# Check if admin exists
curl http://localhost:5000/api/admin/auth/status

# Create admin
curl -X POST http://localhost:5000/api/admin/auth/init

# Test login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"password"}'
```

---

## 🎉 Success Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] Can access `http://localhost:5000/health`
- [ ] Admin exists (check `/api/admin/auth/status`)
- [ ] Can login via API (test with curl)
- [ ] Can login via frontend (`http://localhost:5173/login`)
- [ ] Redirected to `/admin/dashboard` after login

---

## 💡 Pro Tip

**Just restart your backend and try logging in!** The system will automatically create the admin if it doesn't exist. No manual steps needed! 🚀

```bash
cd backend
npm run dev
```

Then go to `http://localhost:5173/login` and login with:
- Email: `admin@gmail.com`
- Password: `password`

**Done!** ✅
