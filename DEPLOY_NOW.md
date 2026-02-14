# Quick Production Deployment Guide

## Current Issue
The production site (kalamschool.org) is showing OLD content because it's serving an outdated build.

## Solution: Rebuild and Redeploy

### Step 1: Rebuild the Frontend
Open **Command Prompt** (not PowerShell):

```cmd
cd c:\wamp64\www\quiz-ui
npm run build
```

This creates a fresh `dist` folder with:
✅ Updated landing page
✅ Restored CDN for styling  
✅ All latest code changes

### Step 2: Upload to Production Server

You need to upload the `dist` folder contents to your production server.

**Upload these files to your web root:**
- `c:\wamp64\www\quiz-ui\dist\index.html`
- `c:\wamp64\www\quiz-ui\dist\assets\*` (all files in assets folder)
- `c:\wamp64\www\quiz-ui\dist\.htaccess` (if it exists)

**Where to upload:**
Depending on your hosting setup:
- **cPanel/FTP**: Upload to `public_html` or `www` folder
- **DigitalOcean/VPS**: Upload to `/var/www/html` or your configured web root
- **Vercel/Netlify**: Push to git and auto-deploy

### Step 3: Clear Browser Cache
After deployment:
1. Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache completely

### Step 4: Verify
Visit https://kalamschool.org and you should see:
- ✅ Modern lavender/skyblue themed landing page
- ✅ Proper styling (from CDN)
- ✅ Updated content

## What Changed from Old Build
- ❌ Old "Gameplay Preview" section
- ✅ New professional landing page with features grid
- ✅ Modern color scheme (lavender & skyblue)
- ✅ Responsive design
- ✅ Google login integration

## Next Steps After Deployment Works
Later we can:
1. Migrate to Tailwind v3 (compiled CSS, no CDN)
2. Optimize performance
3. Add .htaccess for SPA routing fix
