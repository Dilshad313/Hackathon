# Admin Doctor Management Guide

## Overview
This guide covers all doctor management features available to administrators in the SoulSync platform.

## Available Endpoints

### 1. Add New Doctor (Admin Direct Add)
**Endpoint:** `POST /api/admin/doctors/add`  
**Description:** Admin can directly add a new doctor to the system without approval process  
**Access:** Admin only

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "username": "dr_john",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "licenseNumber": "MD12345",
  "specialization": "Psychiatry",
  "qualifications": [
    {
      "degree": "MD",
      "institution": "Harvard Medical School",
      "year": 2015
    }
  ],
  "yearsOfExperience": 8,
  "bio": "Experienced psychiatrist specializing in anxiety and depression",
  "consultationFee": {
    "amount": 150,
    "currency": "USD"
  },
  "languages": ["English", "Spanish"],
  "consultationTypes": ["video", "audio", "in-person"],
  "availability": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }],
    "wednesday": [{ "start": "09:00", "end": "17:00" }]
  },
  "workingHours": {
    "startTime": "09:00",
    "endTime": "17:00"
  }
}
```

**Required Fields:**
- `email` - Unique email address
- `username` - Unique username
- `password` - Account password
- `licenseNumber` - Medical license number (unique)
- `specialization` - Doctor's specialization

**Response:**
```json
{
  "message": "Doctor added successfully",
  "doctor": { /* doctor object */ },
  "user": {
    "id": "userId",
    "email": "doctor@example.com",
    "username": "dr_john",
    "role": "doctor"
  }
}
```

---

### 2. Get All Doctors
**Endpoint:** `GET /api/admin/doctors`  
**Description:** Get list of all doctors with filtering and search  
**Access:** Admin only

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `adminApprovalStatus` - Filter by status: `pending`, `approved`, `rejected`
- `specialization` - Filter by specialization
- `search` - Search by name, email, username, license number

**Examples:**
```bash
# Get all approved doctors
GET /api/admin/doctors?adminApprovalStatus=approved

# Get pending doctors
GET /api/admin/doctors?adminApprovalStatus=pending

# Search for doctors
GET /api/admin/doctors?search=john

# Filter by specialization
GET /api/admin/doctors?specialization=Psychiatry

# Pagination
GET /api/admin/doctors?page=2&limit=20
```

**Response:**
```json
{
  "doctors": [/* array of doctor objects */],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

---

### 3. Get Single Doctor
**Endpoint:** `GET /api/admin/doctors/:id`  
**Description:** Get detailed information about a specific doctor  
**Access:** Admin only

**Response:**
```json
{
  "_id": "doctorId",
  "userId": {
    "username": "dr_john",
    "email": "doctor@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "licenseNumber": "MD12345",
  "specialization": "Psychiatry",
  "qualifications": [...],
  "yearsOfExperience": 8,
  "bio": "...",
  "consultationFee": {...},
  "adminApprovalStatus": "approved",
  "rating": {
    "average": 4.5,
    "count": 120
  },
  "totalAppointments": 250
}
```

---

### 4. Update Doctor
**Endpoint:** `PUT /api/admin/doctors/:id`  
**Description:** Update doctor's profile information  
**Access:** Admin only

**Request Body (all fields optional):**
```json
{
  "licenseNumber": "MD12345",
  "specialization": "Clinical Psychology",
  "qualifications": [...],
  "yearsOfExperience": 10,
  "bio": "Updated bio",
  "consultationFee": {
    "amount": 200,
    "currency": "USD"
  },
  "languages": ["English", "French"],
  "consultationTypes": ["video", "audio"],
  "availability": {...},
  "workingHours": {...},
  "isAvailable": true
}
```

**Response:**
```json
{
  "message": "Doctor updated successfully",
  "doctor": { /* updated doctor object */ }
}
```

---

### 5. Delete Doctor
**Endpoint:** `DELETE /api/admin/doctors/:id`  
**Description:** Delete a doctor from the system  
**Access:** Admin only

**Response:**
```json
{
  "message": "Doctor deleted successfully"
}
```

**Note:** This will:
- Delete the doctor profile
- Change the user's role back to 'patient'
- Preserve the user account

---

### 6. Approve/Reject Doctor
**Endpoint:** `PUT /api/admin/doctors/:id/approve`  
**Description:** Approve or reject a pending doctor application  
**Access:** Admin only

**Request Body:**
```json
{
  "status": "approved",  // or "rejected"
  "rejectionReason": "Incomplete documentation"  // required if rejected
}
```

**Response:**
```json
{
  "message": "Doctor approved",
  "doctor": { /* updated doctor object */ }
}
```

---

## Enhanced Dashboard

### Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard`  
**Description:** Get comprehensive admin dashboard data  
**Access:** Admin only

**Response:**
```json
{
  "totalUsers": 1000,
  "totalDoctors": 50,
  "totalHospitals": 20,
  "totalCourses": 30,
  "totalAppointments": 500,
  "totalForumPosts": 200,
  
  "userStats": {
    "active": 950,
    "inactive": 50,
    "newThisMonth": 100
  },
  
  "doctorStats": {
    "pending": 5,
    "approved": 40,
    "rejected": 5,
    "newThisMonth": 8
  },
  
  "hospitalStats": {
    "pending": 3
  },
  
  "recentUsers": [/* 5 most recent users */],
  "recentDoctors": [/* 5 most recent doctors */],
  "recentAppointments": [/* 5 most recent appointments */],
  
  "generatedAt": "2025-10-18T09:14:00.000Z"
}
```

---

## Usage Examples

### Example 1: Add a New Doctor
```bash
curl -X POST http://localhost:5000/api/admin/doctors/add \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "dr.smith@example.com",
    "username": "dr_smith",
    "password": "SecurePass123!",
    "firstName": "Sarah",
    "lastName": "Smith",
    "phone": "+1234567890",
    "licenseNumber": "MD67890",
    "specialization": "Clinical Psychology",
    "yearsOfExperience": 5,
    "consultationFee": {
      "amount": 120,
      "currency": "USD"
    }
  }'
```

### Example 2: Search for Doctors
```bash
curl -X GET "http://localhost:5000/api/admin/doctors?search=smith&adminApprovalStatus=approved" \
  -H "x-auth-token: YOUR_ADMIN_TOKEN"
```

### Example 3: Update Doctor
```bash
curl -X PUT http://localhost:5000/api/admin/doctors/DOCTOR_ID \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_ADMIN_TOKEN" \
  -d '{
    "consultationFee": {
      "amount": 150,
      "currency": "USD"
    },
    "isAvailable": true
  }'
```

### Example 4: Get Dashboard
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "x-auth-token: YOUR_ADMIN_TOKEN"
```

---

## Validation Rules

### Email
- Must be unique
- Valid email format

### Username
- Must be unique
- Alphanumeric characters allowed

### License Number
- Must be unique
- Required for all doctors

### Specialization
- Required field
- Examples: Psychiatry, Clinical Psychology, Counseling, etc.

### Consultation Fee
- Amount must be >= 0
- Currency defaults to USD

### Years of Experience
- Must be >= 0

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "message": "Please provide all required fields: email, username, password, licenseNumber, specialization"
}
```

**400 Bad Request - Duplicate**
```json
{
  "message": "User with this email already exists"
}
```

**404 Not Found**
```json
{
  "message": "Doctor not found"
}
```

**403 Forbidden**
```json
{
  "message": "Access denied. Admin role required."
}
```

**500 Server Error**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

---

## Best Practices

1. **Always validate input** before submitting
2. **Use strong passwords** when creating doctor accounts
3. **Verify license numbers** are legitimate
4. **Set appropriate consultation fees** based on specialization
5. **Keep doctor profiles updated** with current information
6. **Monitor pending approvals** regularly
7. **Use search and filters** to find doctors efficiently

---

## Security Notes

- All endpoints require admin authentication
- Passwords are automatically hashed before storage
- JWT tokens expire after 7 days
- Always use HTTPS in production
- Never share admin tokens

---

## Testing with Postman

Import the `Admin_API_Collection.json` file to test all endpoints easily.

The collection includes:
- Pre-configured requests
- Auto-token management
- Example request bodies
- Variable support

---

## Support

For issues or questions about doctor management:
1. Check the error message for details
2. Verify admin token is valid
3. Ensure all required fields are provided
4. Check MongoDB connection
5. Review server logs for detailed errors
