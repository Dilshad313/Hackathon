# Quick Start - Admin Setup

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Admin User
```bash
cd backend
npm run seed:admin
```

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Login
**Endpoint:** `POST http://localhost:5000/api/users/login`

**Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@gmail.com",
    "username": "admin",
    "role": "admin"
  }
}
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run seed:admin` | Create/update admin user in database |
| `npm run verify:admin` | Verify admin user exists and is configured correctly |
| `npm run test:admin` | Test admin login (requires server to be running) |

## 🔑 Admin Credentials

- **Email:** admin@gmail.com
- **Password:** password
- **Role:** admin

> ⚠️ **Security:** Change the default password after first login!

## 🛠️ Common Admin Routes

### Dashboard
```bash
GET http://localhost:5000/api/admin/dashboard
Headers: x-auth-token: YOUR_TOKEN
```

### View All Users
```bash
GET http://localhost:5000/api/admin/users
Headers: x-auth-token: YOUR_TOKEN
```

### Approve Doctor
```bash
PUT http://localhost:5000/api/admin/doctors/:id/approve
Headers: x-auth-token: YOUR_TOKEN
Body: { "status": "approved" }
```

### Approve Hospital
```bash
PUT http://localhost:5000/api/admin/hospitals/:id/approve
Headers: x-auth-token: YOUR_TOKEN
Body: { "status": "approved" }
```

## 🐛 Troubleshooting

### "User not found" error
```bash
npm run seed:admin
```

### "Access denied" error
1. Check if token is valid
2. Verify user role is 'admin'
```bash
npm run verify:admin
```

### Server not starting
1. Check if MongoDB is running
2. Verify `.env` file exists with correct values

## 📝 Environment Variables

Make sure your `.env` file contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindsync
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=password
```

## 📚 Full Documentation

For detailed information, see [ADMIN_SETUP.md](./ADMIN_SETUP.md)
