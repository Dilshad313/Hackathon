# 🚀 Vercel Deployment Guide for SoulSync

This guide will help you deploy your SoulSync application to Vercel successfully.

## 📋 Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Backend API deployed (Render, Railway, or Vercel)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Deploy Backend First**

Your backend needs to be deployed before the frontend. Choose one of these options:

#### Option A: Deploy Backend on Render (Recommended)
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `soulsync-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   PORT=5000
   ```
7. Click "Create Web Service"
8. **Copy the deployed URL** (e.g., `https://soulsync-backend.onrender.com`)

#### Option B: Deploy Backend on Railway
1. Go to https://railway.app
2. Sign up/Login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as above)
6. Railway will auto-detect Node.js and deploy
7. **Copy the deployed URL**

---

### **Step 2: Configure Frontend Environment**

1. Open `frontend/.env.production` file
2. Update the API URL with your backend URL:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   
   **Example:**
   ```env
   VITE_API_URL=https://soulsync-backend.onrender.com/api
   ```

---

### **Step 3: Deploy Frontend to Vercel**

#### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   cd frontend
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

3. **Import Git Repository**
   - Click "Import" next to your repository
   - If not listed, click "Adjust GitHub App Permissions"

4. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.onrender.com/api
     ```

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-project.vercel.app`

#### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `soulsync`
   - In which directory is your code located? `./`
   - Want to override settings? `Y`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Development Command: `npm run dev`

5. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL production
   ```
   Then paste your backend URL when prompted

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🔧 Vercel Project Settings

After deployment, configure these settings in Vercel Dashboard:

### 1. **Build & Development Settings**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `frontend`

### 2. **Environment Variables**
Add in Settings → Environment Variables:
```
VITE_API_URL = https://your-backend-url.onrender.com/api
```

### 3. **Domains** (Optional)
- Add custom domain if you have one
- Settings → Domains → Add Domain

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Can access landing page
- [ ] Login page works
- [ ] Registration works
- [ ] API calls are successful (check browser console)
- [ ] No CORS errors
- [ ] All routes work (client-side routing)

---

## 🐛 Common Issues & Fixes

### Issue 1: "404 Not Found" on page refresh
**Solution**: Already fixed with `_redirects` file in `public/` folder

### Issue 2: API calls failing with CORS error
**Solution**: Update backend CORS configuration:
```javascript
// backend/server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### Issue 3: Environment variables not working
**Solution**: 
1. Ensure variable name starts with `VITE_`
2. Redeploy after adding environment variables
3. Check in Vercel Dashboard → Settings → Environment Variables

### Issue 4: Build fails
**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Check Node.js version compatibility

### Issue 5: Blank page after deployment
**Solution**:
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly
3. Check if backend is running
4. Verify API endpoints are accessible

---

## 🔄 Redeployment

To redeploy after making changes:

1. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic deployment**
   - Vercel automatically redeploys on push to main branch
   - Check deployment status in Vercel dashboard

3. **Manual redeploy**
   - Go to Vercel Dashboard
   - Select your project
   - Click "Deployments"
   - Click "..." → "Redeploy"

---

## 📊 Monitoring

### View Logs
- Vercel Dashboard → Your Project → Deployments
- Click on a deployment → View Function Logs

### Analytics
- Vercel Dashboard → Your Project → Analytics
- View page views, performance metrics

---

## 🎉 Success!

Your SoulSync application should now be live on Vercel!

**Frontend URL**: `https://your-project.vercel.app`
**Backend URL**: `https://your-backend.onrender.com`

---

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify backend is running
4. Check environment variables
5. Review CORS configuration

---

## 🔐 Security Checklist

Before going live:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelist (allow all: 0.0.0.0/0 for cloud)
- [ ] Set NODE_ENV=production
- [ ] Remove console.logs from production code
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags if using cookies

---

## 📝 Notes

- **Free Tier Limits**: 
  - Vercel: 100GB bandwidth/month
  - Render: 750 hours/month (backend may sleep after 15 min inactivity)
  
- **Cold Starts**: 
  - Render free tier has cold starts (first request after sleep takes 30-60 seconds)
  - Consider upgrading to paid plan for production

- **Database**: 
  - MongoDB Atlas free tier: 512MB storage
  - Upgrade if you need more

---

## 🚀 Next Steps

1. Add custom domain
2. Set up monitoring/alerts
3. Configure CI/CD pipeline
4. Add error tracking (Sentry)
5. Set up analytics (Google Analytics)
6. Optimize performance
7. Add SEO meta tags
8. Set up backup strategy

---

**Happy Deploying! 🎊**
