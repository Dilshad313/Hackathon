# 🔧 Vercel Deployment - 500 Error Fix Guide

## ❌ **Problem:**
```
POST https://soul-sync-backend-six.vercel.app/api/users/login 500 (Internal Server Error)
```

The hosted application is not working due to backend 500 errors.

---

## 🎯 **Root Causes:**

### **1. Missing Environment Variables**
Vercel deployments need environment variables set in the dashboard.

### **2. MongoDB Connection Issues**
- MongoDB URI not configured
- Connection timeout
- Network access not allowed

### **3. JWT Secret Missing**
- Authentication fails without JWT_SECRET

---

## ✅ **Solution Steps:**

### **Step 1: Configure Environment Variables in Vercel**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your backend project: `soul-sync-backend-six`

2. **Navigate to Settings → Environment Variables**

3. **Add These Variables:**

```env
# Required Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soulsync?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
NODE_ENV=production
FRONTEND_URL=https://soul-sync-drab.vercel.app

# Optional but Recommended
PORT=5000
```

**Important Notes:**
- Replace `username:password@cluster.mongodb.net` with your actual MongoDB Atlas credentials
- Generate a strong JWT_SECRET (at least 32 characters)
- Use your actual frontend Vercel URL

4. **Set Environment for:**
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

---

### **Step 2: MongoDB Atlas Configuration**

#### **A. Get MongoDB Connection String:**

1. **Login to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com/

2. **Select Your Cluster**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

3. **Format the Connection String:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

Replace:
- `<username>` → Your MongoDB username
- `<password>` → Your MongoDB password
- `<cluster>` → Your cluster name
- `<database>` → `soulsync` (or your database name)

#### **B. Whitelist Vercel IP Addresses:**

1. **In MongoDB Atlas:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Vercel's IP ranges

2. **Save Changes**

---

### **Step 3: Generate JWT Secret**

**Option 1: Using Node.js**
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Manual (at least 32 characters)**
```
mySuper$ecretJWT2024Key!ForSoulSyncApp#Secure
```

---

### **Step 4: Redeploy Backend**

After adding environment variables:

1. **Go to Deployments Tab**
2. **Click on Latest Deployment**
3. **Click "Redeploy"**
4. **Wait for deployment to complete (2-3 minutes)**

---

### **Step 5: Verify Deployment**

#### **Test Endpoints:**

1. **Health Check:**
```bash
curl https://soul-sync-backend-six.vercel.app/
```

Expected Response:
```json
{
  "message": "SoulSync API is running",
  "version": "1.0.0"
}
```

2. **Test Login:**
```bash
curl -X POST https://soul-sync-backend-six.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected: Should not return 500 error

---

## 🔍 **Debugging Steps:**

### **Check Vercel Logs:**

1. **Go to Vercel Dashboard**
2. **Select Backend Project**
3. **Click "Deployments"**
4. **Click on Latest Deployment**
5. **Click "View Function Logs"**

Look for errors like:
- `MongooseError: Connection failed`
- `JWT_SECRET is not defined`
- `MONGODB_URI is not defined`

---

## 📋 **Environment Variables Checklist:**

### **Required Variables:**
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Secret key for JWT tokens
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Your frontend Vercel URL

### **Optional Variables:**
- [ ] `PORT` - Default 5000
- [ ] `RATE_LIMIT_WINDOW_MS` - Rate limiting window
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

---

## 🛠️ **Common Issues & Fixes:**

### **Issue 1: MongoDB Connection Timeout**
**Symptoms:** 500 error, logs show connection timeout

**Fix:**
1. Check MongoDB Atlas Network Access
2. Add 0.0.0.0/0 to IP whitelist
3. Verify connection string is correct
4. Check MongoDB Atlas cluster is running

### **Issue 2: JWT_SECRET Not Found**
**Symptoms:** 500 error on login/register

**Fix:**
1. Add JWT_SECRET to Vercel environment variables
2. Redeploy
3. Clear browser cache

### **Issue 3: CORS Errors**
**Symptoms:** CORS policy errors in browser console

**Fix:**
1. Verify FRONTEND_URL is set correctly
2. Check `vercel.json` has CORS headers
3. Redeploy backend

### **Issue 4: Function Timeout**
**Symptoms:** 504 Gateway Timeout

**Fix:**
1. Optimize database queries
2. Add indexes to MongoDB collections
3. Increase Vercel function timeout (Pro plan)

---

## 📝 **vercel.json Configuration**

Your current `vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-auth-token, Accept",
        "Access-Control-Allow-Credentials": "true"
      }
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🎯 **Step-by-Step Fix Process:**

### **1. Set Environment Variables (5 minutes)**
```
✅ Go to Vercel Dashboard
✅ Settings → Environment Variables
✅ Add MONGODB_URI
✅ Add JWT_SECRET
✅ Add NODE_ENV=production
✅ Add FRONTEND_URL
```

### **2. Configure MongoDB Atlas (5 minutes)**
```
✅ Login to MongoDB Atlas
✅ Network Access → Add IP (0.0.0.0/0)
✅ Database Access → Verify user exists
✅ Copy connection string
```

### **3. Redeploy (3 minutes)**
```
✅ Vercel Dashboard → Deployments
✅ Click Redeploy
✅ Wait for completion
```

### **4. Test (2 minutes)**
```
✅ Test health endpoint
✅ Test login endpoint
✅ Check frontend connection
```

---

## 🔐 **Security Best Practices:**

### **1. JWT Secret:**
- Use at least 32 characters
- Include special characters
- Never commit to Git
- Rotate periodically

### **2. MongoDB:**
- Use strong password
- Limit IP access when possible
- Enable MongoDB authentication
- Use SSL/TLS connections

### **3. Environment Variables:**
- Never expose in client-side code
- Use different values for dev/prod
- Rotate secrets regularly
- Use Vercel's encrypted storage

---

## 📊 **Testing Checklist:**

After deployment, test these endpoints:

### **Backend Health:**
- [ ] `GET /` - API health check
- [ ] `GET /api/users/me` - Auth check (with token)

### **Authentication:**
- [ ] `POST /api/users/register` - User registration
- [ ] `POST /api/users/login` - User login
- [ ] `GET /api/users/profile` - Get profile (with token)

### **Admin:**
- [ ] `POST /api/admin/login` - Admin login
- [ ] `GET /api/admin/dashboard` - Admin dashboard

### **Forum:**
- [ ] `GET /api/forum/posts` - Get posts
- [ ] `POST /api/forum/posts` - Create post

---

## 🚀 **Quick Fix Commands:**

### **Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Test Backend Locally:**
```bash
cd backend
npm install
npm start
```

### **Test Login Endpoint:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 📞 **Support Resources:**

### **Vercel Documentation:**
- Environment Variables: https://vercel.com/docs/environment-variables
- Serverless Functions: https://vercel.com/docs/serverless-functions
- Troubleshooting: https://vercel.com/docs/troubleshooting

### **MongoDB Atlas:**
- Connection Guide: https://docs.atlas.mongodb.com/connect-to-cluster/
- Network Access: https://docs.atlas.mongodb.com/security/ip-access-list/

---

## ✅ **Expected Results After Fix:**

### **Backend:**
- ✅ No 500 errors
- ✅ Login works
- ✅ Registration works
- ✅ All API endpoints respond
- ✅ Database queries succeed

### **Frontend:**
- ✅ Can login successfully
- ✅ Can register new users
- ✅ Dashboard loads
- ✅ All features work
- ✅ No CORS errors

---

## 🎯 **Summary:**

**The 500 error is caused by missing environment variables in Vercel.**

**Quick Fix (15 minutes):**
1. Add MONGODB_URI to Vercel env vars
2. Add JWT_SECRET to Vercel env vars
3. Add NODE_ENV=production
4. Add FRONTEND_URL
5. Configure MongoDB Atlas IP whitelist
6. Redeploy backend
7. Test endpoints

**After following these steps, your hosted application will work!** 🎉
