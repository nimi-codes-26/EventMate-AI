# Google Cloud Run Deployment Guide

## Project Information
- **App Name**: EventMate AI
- **Region**: asia-south1
- **Type**: Full-stack (React frontend + Express backend)

---

## 📋 DEPLOYMENT STEPS

### **Step 1: Authenticate with Google Cloud**
```powershell
gcloud auth login
```
- This opens a browser to authenticate your Google account
- Choose the account with access to Google Cloud resources

### **Step 2: Set Your Project ID**
```powershell
gcloud config set project ai-event-assistant-6a205
```
- Replace `ai-event-assistant-6a205` with your actual Google Cloud Project ID
- Verify: `gcloud config get-value project`

### **Step 3: Enable Required Google Cloud Services**
```powershell
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
```

This enables:
- **Cloud Run**: Container orchestration
- **Container Registry**: Stores Docker images
- **Cloud Build**: Builds Docker images

### **Step 4: Configure Environment Variables (Important!)**

Create or update your `.env` file with:
```
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
```

⚠️ **BEFORE DEPLOYMENT**: Ensure `.env` is properly set with your API keys, or Cloud Run will fall back to the default responses.

You can also set env vars directly in Cloud Run after deployment via the console.

### **Step 5: Build and Deploy to Cloud Run**

Run this command from your project root:

```powershell
gcloud run deploy eventmate-ai `
  --source . `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --port 8080 `
  --timeout 3600s `
  --set-env-vars="NODE_ENV=production"
```

**Parameters Explained**:
- `eventmate-ai`: Service name (change if you prefer)
- `--source .`: Builds from current directory (auto-detects Dockerfile)
- `--platform managed`: Fully managed Cloud Run
- `--region asia-south1`: Region (India - Mumbai)
- `--allow-unauthenticated`: Makes service public (no authentication required)
- `--memory 512Mi`: Memory allocation
- `--cpu 1`: CPU units (1 vCPU)
- `--port 8080`: Port the app listens on
- `--timeout 3600s`: Request timeout (1 hour)

### **Step 6: Set Additional Environment Variables (If Needed)**

If you didn't set `.env`, or want to override values:

```powershell
gcloud run deploy eventmate-ai `
  --update-env-vars="GEMINI_API_KEY=your_key,OPENAI_API_KEY=your_key" `
  --region asia-south1
```

### **Step 7: Get Your Service URL**

After deployment succeeds, retrieve your service URL:

```powershell
gcloud run services describe eventmate-ai --region asia-south1 --format="value(status.url)"
```

This will output something like:
```
https://eventmate-ai-xxxxx-in.a.run.app
```

---

## 🔍 VERIFICATION & MONITORING

### Check Service Status
```powershell
gcloud run services describe eventmate-ai --region asia-south1
```

### View Real-time Logs
```powershell
gcloud run services logs read eventmate-ai --region asia-south1 --limit 50 --follow
```

### Test the Health Endpoint
```powershell
# Replace URL with your actual Cloud Run URL
curl https://eventmate-ai-xxxxx-in.a.run.app/api/health
```

### Test the Chat API
```powershell
$url = "https://eventmate-ai-xxxxx-in.a.run.app/api/chat"
$body = @{ message = "Hello" } | ConvertTo-Json
Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json"
```

---

## 📊 WHAT HAPPENS DURING DEPLOYMENT

1. **Docker Build**: Cloud Build compiles your Dockerfile
   - Builds React frontend (Vite)
   - Copies frontend to Express server
   - Installs production dependencies only

2. **Image Storage**: Docker image is stored in Container Registry

3. **Container Run**: Cloud Run starts your container with:
   - PORT set to 8080
   - NODE_ENV set to production
   - All environment variables from `.env` (if passed)

4. **Auto-scaling**: Cloud Run automatically scales:
   - Scales up when traffic increases
   - Scales down to 0 when idle (saves cost)

---

## 💰 PRICING

- **Always Free Tier**: 2 million requests/month
- **After free tier**: $0.24 per 1M requests + compute time
- **Your app should easily fit in the free tier** if traffic is moderate

---

## 🔐 SECURITY NOTES

1. **Do NOT commit `.env` to Git** - use `.gitignore`
2. **Use Secret Manager** for production (recommended):
   ```powershell
   gcloud secrets create gemini-key --data-file=-
   # Paste your key and press Ctrl+D
   ```

3. **Grant Cloud Run service account access to secrets**:
   ```powershell
   gcloud secrets add-iam-policy-binding gemini-key `
     --member=serviceAccount:SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com `
     --role=roles/secretmanager.secretAccessor
   ```

---

## 🆘 TROUBLESHOOTING

### Deployment fails: "Source code not recognized"
- **Solution**: Make sure Dockerfile is in root directory (not in subfolder)

### App crashes: "Cannot find module"
- **Solution**: Run `npm install` locally first to ensure package-lock.json is up-to-date

### 502 Bad Gateway
- **Solution**: 
  - Check logs: `gcloud run services logs read eventmate-ai --region asia-south1`
  - Ensure server listens on `process.env.PORT`

### Health check fails
- **Solution**: 
  - Server must respond within 4 minutes on startup
  - Check: `curl https://YOUR-URL/api/health`

---

## 📝 UPDATE DEPLOYMENT

To push updates:

```powershell
# Make code changes
git add .
git commit -m "Your changes"

# Deploy (same command as Step 5)
gcloud run deploy eventmate-ai `
  --source . `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated
```

Cloud Run will:
1. Detect new source code
2. Rebuild Docker image
3. Deploy new version (old requests complete before switching)

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Project ID set correctly
- [ ] `.env` file has API keys (or will set env vars after deployment)
- [ ] Dockerfile exists in root
- [ ] package.json has "start" script
- [ ] server/index.js listens on process.env.PORT (already done ✓)
- [ ] Firebase config is valid
- [ ] Run all gcloud commands from project root directory

---

Generated: April 20, 2026
Project: EventMate AI - Full Stack Deployment
