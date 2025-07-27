# MyBenefit Firebase Deployment Guide

This guide will help you deploy the MyBenefit fitness application to Firebase.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `mybenifit-app`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

In your Firebase project, enable the following services:

#### Authentication
- Go to Authentication > Sign-in method
- Enable Email/Password
- Enable Google Sign-in
- Add your domain to authorized domains

#### Firestore Database
- Go to Firestore Database
- Create database in production mode
- Choose a location (recommend: us-central1)

#### Storage
- Go to Storage
- Start in production mode
- Choose a location (recommend: us-central1)

#### Hosting
- Go to Hosting
- Get started with Hosting

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web app
4. Register app with name "MyBenefit Web"
5. Copy the configuration object

## Environment Variables Setup

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=mybenifit-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mybenifit-app
VITE_FIREBASE_STORAGE_BUCKET=mybenifit-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Deployment Steps

### Option 1: Using Deployment Scripts (Recommended)

#### Windows
```bash
deploy.bat
```

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Option 3: Using npm Scripts

```bash
# Deploy everything
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only Firestore rules
npm run deploy:firestore

# Deploy only Storage rules
npm run deploy:storage
```

## Deployment Configuration

### Firebase Configuration Files

- **`firebase.json`** - Main Firebase configuration
- **`.firebaserc`** - Project configuration
- **`firestore.rules`** - Firestore security rules
- **`firestore.indexes.json`** - Firestore indexes
- **`storage.rules`** - Storage security rules

### Build Output

The build process creates optimized files in the `build/client` directory:
- Minified JavaScript bundles
- Optimized CSS
- Compressed assets
- Service worker (if configured)

## Security Rules

### Firestore Rules
- Users can only access their own data
- All collections require authentication
- Proper validation for data creation

### Storage Rules
- Users can only upload/access their own files
- File type and size restrictions
- Organized file structure

## Post-Deployment

### 1. Verify Deployment
- Visit your app: `https://mybenifit-app.web.app`
- Test authentication
- Test data creation and retrieval

### 2. Set Up Custom Domain (Optional)
1. Go to Firebase Hosting
2. Click "Add custom domain"
3. Follow the verification steps

### 3. Monitor Performance
- Use Firebase Analytics
- Monitor Firestore usage
- Check Storage usage

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Verify all dependencies are installed

2. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check authorized domains
   - Verify API keys in environment variables

3. **Database Access Issues**
   - Check Firestore rules
   - Verify database is created
   - Check indexes are deployed

4. **Storage Issues**
   - Verify Storage is enabled
   - Check storage rules
   - Verify file size limits

### Useful Commands

```bash
# Check Firebase CLI version
firebase --version

# List Firebase projects
firebase projects:list

# View deployment history
firebase hosting:history

# Test security rules locally
firebase emulators:start

# Export/Import emulator data
firebase emulators:export ./emulator-data
firebase emulators:start --import=./emulator-data
```

## Environment-Specific Deployments

### Development
```bash
npm run dev
firebase emulators:start
```

### Staging
```bash
firebase use staging
npm run deploy
```

### Production
```bash
firebase use production
npm run deploy
```

## Performance Optimization

1. **Enable Firebase Performance Monitoring**
2. **Set up proper caching headers**
3. **Optimize images and assets**
4. **Use Firebase CDN for global distribution**

## Support

For issues related to:
- **Firebase**: Check [Firebase Documentation](https://firebase.google.com/docs)
- **Deployment**: Check Firebase Console logs
- **Application**: Check browser console and network tab

## Security Best Practices

1. **Never commit `.env` files**
2. **Regularly review security rules**
3. **Monitor Firebase usage**
4. **Keep dependencies updated**
5. **Use HTTPS only in production** 