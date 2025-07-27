#!/bin/bash

# MyBenefit Firebase Deployment Script
echo "🚀 Starting MyBenefit deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase
echo "🌐 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "🌍 Your app is now live at: https://mybenifit-app.web.app"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 