# Admin Module - Quick Reference Card

## 🚀 Quick Commands

```bash
# Setup
npm run seed:admin          # Create admin user
npm run verify:admin        # Verify admin exists

# Testing
npm run test:admin          # Test admin login
npm run test:doctors        # Test doctor management

# Server
npm run dev                 # Start development server
```

---

## 🔑 Admin Credentials

```
Email: admin@gmail.com
Password: password
```

---

## 📊 Dashboard

```http
GET /api/admin/dashboard
Headers: x-auth-token: YOUR_TOKEN
```

**Returns:**
- Total counts (users, doctors, hospitals, etc.)
- User stats (active/inactive/new)
- Doctor stats (pending/approved/rejected)
- Recent activity

---

## 👨‍⚕️ Doctor Management

### Add Doctor
```http
POST /api/admin/doctors/add
Headers: 
  x-auth-token: YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "email": "doctor@example.com",
  "username": "dr_john",
  "password": "SecurePass123!",
  "licenseNumber": "MD12345",
  "specialization": "Psychiatry"
}
```

### Get All Doctors
```http
GET /api/admin/doctors?page=1&limit=10
GET /api/admin/doctors?adminApprovalStatus=approved
GET /api/admin/doctors?search=john
GET /api/admin/doctors?specialization=Psychiatry
```

### Get Single Doctor
```http
GET /api/admin/doctors/:id
```

### Update Doctor
```http
PUT /api/admin/doctors/:id
Body: { "consultationFee": { "amount": 200 } }
```

### Delete Doctor
```http
DELETE /api/admin/doctors/:id
```

### Approve/Reject
```http
PUT /api/admin/doctors/:id/approve
Body: { "status": "approved" }
```

---

## 👥 User Management

```http
GET /api/admin/users?page=1&limit=10
GET /api/admin/users?role=doctor
GET /api/admin/users?search=john
PUT /api/admin/users/:id/toggle-status
```

---

## 🏥 Hospital Management

```http
GET /api/admin/hospitals?adminApprovalStatus=pending
PUT /api/admin/hospitals/:id/approve
Body: { "status": "approved" }
```

---

## 📚 Course Management

```http
GET /api/admin/courses?adminApprovalStatus=pending
PUT /api/admin/courses/:id/approve
Body: { "status": "approved" }
```

---

## 💬 Forum Moderation

```http
GET /api/admin/forum-posts?status=active
PUT /api/admin/forum-posts/:id/toggle-status
Body: { "status": "locked" }
DELETE /api/admin/forum-posts/:id
```

---

## 🔔 Notifications

```http
POST /api/admin/notifications/send
Body: {
  "title": "Announcement",
  "message": "Welcome!",
  "targetUsers": "all",
  "type": "admin-announcement"
}
```

---

## 🔍 Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number | `?page=2` |
| `limit` | Items per page | `?limit=20` |
| `search` | Search term | `?search=john` |
| `adminApprovalStatus` | Filter status | `?adminApprovalStatus=pending` |
| `specialization` | Doctor specialty | `?specialization=Psychiatry` |
| `role` | User role | `?role=doctor` |

---

## ⚠️ Common Errors

| Code | Message | Solution |
|------|---------|----------|
| 401 | No token | Add `x-auth-token` header |
| 403 | Access denied | Use admin account |
| 404 | Not found | Check ID is correct |
| 400 | Validation error | Check required fields |

---

## 📦 Response Format

### Success
```json
{
  "message": "Success message",
  "data": { /* result */ }
}
```

### Error
```json
{
  "message": "Error message",
  "error": "Details"
}
```

### Paginated
```json
{
  "items": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

---

## 🧪 Testing Flow

1. **Login**
   ```bash
   POST /api/users/login
   → Get token
   ```

2. **View Dashboard**
   ```bash
   GET /api/admin/dashboard
   → See statistics
   ```

3. **Add Doctor**
   ```bash
   POST /api/admin/doctors/add
   → Create doctor
   ```

4. **Verify**
   ```bash
   GET /api/admin/doctors
   → See new doctor
   ```

---

## 📝 Required Fields

### Add Doctor
- ✅ `email`
- ✅ `username`
- ✅ `password`
- ✅ `licenseNumber`
- ✅ `specialization`

### Approve Doctor
- ✅ `status` (approved/rejected)
- ⚠️ `rejectionReason` (if rejected)

---

## 🎯 Status Values

### Doctor Approval
- `pending` - Awaiting review
- `approved` - Approved by admin
- `rejected` - Rejected by admin

### User Status
- `true` - Active
- `false` - Inactive

### Forum Post
- `active` - Visible
- `locked` - No new replies
- `archived` - Hidden

---

## 🔐 Security Checklist

- ✅ Always use HTTPS in production
- ✅ Keep admin token secure
- ✅ Change default password
- ✅ Never commit .env file
- ✅ Validate all inputs
- ✅ Use strong passwords

---

## 📚 Documentation Links

- **Setup:** `ADMIN_SETUP.md`
- **Doctor Management:** `ADMIN_DOCTOR_MANAGEMENT.md`
- **Complete Guide:** `ADMIN_MODULE_COMPLETE.md`
- **Postman:** `postman/Admin_API_Collection.json`

---

## 💡 Pro Tips

1. Use Postman collection for easy testing
2. Run `npm run test:doctors` to verify everything works
3. Check dashboard regularly for pending approvals
4. Use search and filters to find items quickly
5. Keep doctor profiles updated
6. Monitor user activity through dashboard

---

**Need Help?** Check the full documentation in `ADMIN_MODULE_COMPLETE.md`
