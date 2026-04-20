# Quick Cloud Run Deployment Script
# Run this in PowerShell from the project root directory

# Configuration
$PROJECT_ID = "ai-event-assistant-6a205"  # Change this to your project ID
$SERVICE_NAME = "eventmate-ai"
$REGION = "asia-south1"

Write-Host "🚀 Starting Cloud Run Deployment..." -ForegroundColor Green
Write-Host ""

# Step 1: Authenticate
Write-Host "📝 Step 1: Authenticating with Google Cloud..." -ForegroundColor Cyan
gcloud auth login

# Step 2: Set project
Write-Host "`n📝 Step 2: Setting project ID to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Step 3: Enable services
Write-Host "`n📝 Step 3: Enabling Google Cloud services..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com

# Step 4: Build and Deploy
Write-Host "`n📝 Step 4: Building and deploying to Cloud Run..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --port 8080 `
  --timeout 3600s `
  --set-env-vars="NODE_ENV=production"

# Step 5: Get the URL
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Your service URL:" -ForegroundColor Cyan

$url = gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
Write-Host $url -ForegroundColor Yellow

Write-Host ""
Write-Host "🧪 Test your service:" -ForegroundColor Cyan
Write-Host "  Health check: curl $url/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "  gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy deploying!" -ForegroundColor Green
