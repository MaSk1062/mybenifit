@echo off
REM MyBenefit Firebase Deployment Script for Windows
echo 🚀 Starting MyBenefit deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo firebase login
    pause
    exit /b 1
)

REM Build the application
echo 📦 Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Deploy to Firebase
echo 🌐 Deploying to Firebase...
firebase deploy

if %errorlevel% equ 0 (
    echo 🎉 Deployment completed successfully!
    echo 🌍 Your app is now live at: https://mybenifit-app.web.app
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause 