#!/bin/bash

# Script to train the sentiment analysis model

echo "🚀 Starting model training process..."

# Build the training service
echo "📦 Building model training container..."
docker-compose --profile training build model-training

# Run the training
echo "🎯 Starting model training..."
docker-compose --profile training up model-training

# Check if model was created successfully
echo "✅ Checking if model was created..."
if docker run --rm -v sentiment-model-data:/data alpine ls -la /data/indianFinbert.pt 2>/dev/null; then
    echo "🎉 Model training completed successfully!"
    echo "📁 Model file 'indianFinbert.pt' is now available in the shared volume."
    echo "🚀 You can now start the backend and frontend services with:"
    echo "   docker-compose up backend frontend"
else
    echo "❌ Model training failed or model file not found."
    echo "📋 Check the training logs above for errors."
    exit 1
fi