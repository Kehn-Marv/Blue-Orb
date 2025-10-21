# Blue Orb - Free Hosting Deployment Guide

## 🚀 Complete Free Hosting Setup

This guide will help you deploy your Blue Orb project completely for FREE using:
- **Frontend**: Vercel (React app)
- **Backend**: Render (Node.js API)
- **Database**: Turso (already configured)

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Vercel Account** (free)
3. **Render Account** (free)
4. **Turso Account** (free - you already have this)

## 🎯 Step 1: Deploy Backend to Render

### 1.1 Prepare Your Repository
1. Push your code to GitHub (if not already done)
2. Make sure your `package.json` has the `engines` field (already added)

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Select your Blue-orb repository
6. Render will automatically detect it's a Node.js app

### 1.3 Configure Build Settings
In Render dashboard:
1. Set the following:
   - **Name**: `blue-orb-backend` (or your preferred name)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (uses root)

### 1.4 Configure Environment Variables
In Render dashboard:
1. Go to Environment tab
2. Add these environment variables:

```
TURSO_DATABASE_URL=your_turso_database_url_here
TURSO_AUTH_TOKEN=your_turso_auth_token_here
NODE_ENV=production
NOSTR_RELAY=wss://relay.damus.io
ADMIN_NOSTR_KEY=your_admin_nostr_private_key_here (optional)
COMMUNITY_RATE_LIMIT=100
POST_RATE_LIMIT=10
KEY_GEN_RATE_LIMIT=5
ADMIN_RATE_LIMIT=200
```

### 1.5 Deploy
1. Click "Create Web Service"
2. Render will build and deploy your backend
3. Wait for deployment to complete (usually 2-3 minutes)

### 1.6 Get Your Backend URL
- Render will give you a URL like: `https://blue-orb-backend.onrender.com`
- **Save this URL** - you'll need it for the frontend

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend
1. Make sure your `frontend/vite.config.js` is updated (already done)
2. Make sure `vercel.json` is in your root directory (already added)

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it's a React app

### 2.3 Configure Build Settings
In Vercel dashboard:
1. Go to your project → Settings → Build & Development Settings
2. Set:
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

### 2.4 Configure Environment Variables
In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### 2.5 Update Frontend API Configuration
You'll need to update your frontend to use the production API URL. In your frontend code, make sure API calls use `import.meta.env.VITE_API_URL` instead of hardcoded localhost. (already added)

## 🔗 Step 3: Connect Frontend to Backend

### 3.1 Update CORS Settings
In your backend `src/app.js`, make sure CORS allows your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', // for development
    'https://your-app-name.vercel.app' // your Vercel domain
  ]
}));
```

### 3.2 Test the Connection
1. Deploy both services
2. Visit your Vercel URL
3. Check browser console for any API errors
4. Test the functionality

## 🎉 Step 4: Custom Domain (Optional)

### 4.1 Vercel Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain (if you have one)
3. Follow DNS setup instructions

### 4.2 Render Custom Domain
1. In Render dashboard → Settings → Custom Domains
2. Add your custom domain
3. Update CORS settings in backend

## 📊 Monitoring & Maintenance

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Turso**: 500MB database, 1 billion row reads/month

### Monitoring:
- Vercel provides analytics in dashboard
- Render shows usage, logs, and metrics
- Turso has built-in monitoring

## 🆘 Troubleshooting

### Common Issues:
1. **CORS errors**: Update backend CORS settings
2. **Environment variables**: Double-check all are set correctly
3. **Build failures**: Check logs in respective dashboards
4. **Database connection**: Verify Turso credentials

### Getting Help:
- Vercel: [docs.vercel.com](https://docs.vercel.com)
- Render: [render.com/docs](https://render.com/docs)
- Turso: [docs.turso.tech](https://docs.turso.tech)

## 🎯 Final Result

After deployment, you'll have:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`
- **Database**: Turso (managed)

Your Blue Orb education platform will be live and accessible worldwide! 🌍

## 💡 Pro Tips

1. **Enable auto-deployments**: Both platforms auto-deploy on git push
2. **Use preview deployments**: Test changes before going live
3. **Monitor usage**: Stay within free tier limits
4. **Backup data**: Export from Turso regularly
5. **Performance**: Use Vercel's analytics to optimize
6. **Render sleep**: Free tier sleeps after 15min inactivity (first request may be slow)

---

**Total Cost: $0** 🎉
**Setup Time: ~30 minutes**
**Maintenance: Minimal**
