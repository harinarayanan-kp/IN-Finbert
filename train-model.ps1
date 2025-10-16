# Script to train the sentiment analysis model

Write-Host "🚀 Starting model training process..." -ForegroundColor Green

# Build the training service
Write-Host "📦 Building model training container..." -ForegroundColor Yellow
docker-compose --profile training build model-training

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build training container" -ForegroundColor Red
    exit 1
}

# Run the training
Write-Host "🎯 Starting model training..." -ForegroundColor Yellow
docker-compose --profile training up model-training

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Model training failed" -ForegroundColor Red
    exit 1
}

# Check if model was created successfully
Write-Host "✅ Checking if model was created..." -ForegroundColor Yellow
$modelCheck = docker run --rm -v sentiment-model-data:/data alpine ls -la /data/indianFinbert.pt 2>$null

if ($modelCheck) {
    Write-Host "🎉 Model training completed successfully!" -ForegroundColor Green
    Write-Host "📁 Model file 'indianFinbert.pt' is now available in the shared volume." -ForegroundColor Cyan
    Write-Host "🚀 You can now start the backend and frontend services with:" -ForegroundColor Cyan
    Write-Host "   docker-compose up backend frontend" -ForegroundColor White
}
else {
    Write-Host "❌ Model training failed or model file not found." -ForegroundColor Red
    Write-Host "📋 Check the training logs above for errors." -ForegroundColor Yellow
    exit 1
}