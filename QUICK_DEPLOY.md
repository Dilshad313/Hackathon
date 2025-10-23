# ⚡ Quick Deploy Checklist

## 🎯 Before Deployment

### ✅ Files Already Configured
- ✅ `vite.config.js` - Build configuration optimized
- ✅ `frontend/public/_redirects` - Client-side routing fixed
- ✅ `backend/server.js` - CORS configured for Vercel
- ✅ `.env.production` - Environment template created
- ✅ `index.html` - Meta tags and title updated

---

## 📝 Step-by-Step (5 Minutes)

### 1️⃣ Deploy Backend (Choose One)

**Option A: Render.com (Recommended - Free)**
```
1. Go to https://render.com
2. New + → Web Service
3. Connect GitHub repo
4. Root Directory: backend
5. Build: npm install
6. Start: npm start
7. Add env vars:
   - MONGO_URI
   - JWT_SECRET
   - NODE_ENV=production
8. Copy deployed URL
```

**Option B: Railway.app (Fast)**
```
1. Go to https://railway.app
2. New Project → GitHub repo
3. Auto-detects Node.js
4. Add same env vars
5. Copy deployed URL
```

---

### 2️⃣ Update Frontend Config

Edit `frontend/.env.production`:
```env
VITE_API_URL=https://YOUR_BACKEND_URL/api
```

Example:
```env
VITE_API_URL=https://soulsync-backend.onrender.com/api
```

---

### 3️⃣ Deploy Frontend to Vercel

**Via Dashboard (Easiest):**
```
1. Push code to GitHub
2. Go to vercel.com/dashboard
3. New Project → Import your repo
4. Settings:
   - Framework: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
5. Environment Variables:
   - VITE_API_URL = your_backend_url/api
6. Deploy!
```

**Via CLI:**
```bash
npm install -g vercel
cd frontend
vercel login
vercel
# Follow prompts
vercel env add VITE_API_URL production
# Paste your backend URL
vercel --prod
```

---

## 🔧 Environment Variables

### Backend (Render/Railway)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/soulsync
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## ✅ Verify Deployment

1. Open your Vercel URL
2. Check browser console (F12)
3. Try login/register
4. Verify API calls work

---

## 🐛 Common Fixes

**404 on refresh?**
✅ Already fixed with `_redirects` file

**CORS error?**
✅ Already fixed in `server.js`
- Allows all `.vercel.app` domains
- Add specific domain if needed

**API not connecting?**
- Check `VITE_API_URL` in Vercel env vars
- Verify backend is running
- Check backend URL is correct

**Build fails?**
```bash
# Test locally first
cd frontend
npm run build
```

---

## 🎉 Done!

Your app is live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

---

## 📞 Need Help?

Check full guide: `VERCEL_DEPLOYMENT_GUIDE.md`

**Common URLs:**
- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- Railway Dashboard: https://railway.app/dashboard
