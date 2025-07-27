import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Example function for user profile creation
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;
    
    // Create user profile in Firestore
    await admin.firestore().collection('profiles').doc(uid).set({
      userId: uid,
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Default fitness settings
      fitnessGoals: [],
      preferences: {
        units: 'metric', // metric or imperial
        notifications: true,
        privacy: 'private'
      }
    });

    console.log(`User profile created for: ${uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Example function for user profile deletion
export const deleteUserProfile = functions.auth.user().onDelete(async (user) => {
  try {
    const { uid } = user;
    
    // Delete user data from all collections
    const batch = admin.firestore().batch();
    
    // Delete profile
    batch.delete(admin.firestore().collection('profiles').doc(uid));
    
    // Delete activities
    const activitiesSnapshot = await admin.firestore()
      .collection('activities')
      .where('userId', '==', uid)
      .get();
    
    activitiesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete extended activities
    const extendedActivitiesSnapshot = await admin.firestore()
      .collection('extendedActivities')
      .where('userId', '==', uid)
      .get();
    
    extendedActivitiesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete goals
    const goalsSnapshot = await admin.firestore()
      .collection('goals')
      .where('userId', '==', uid)
      .get();
    
    goalsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete workouts
    const workoutsSnapshot = await admin.firestore()
      .collection('workouts')
      .where('userId', '==', uid)
      .get();
    
    workoutsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete progress
    const progressSnapshot = await admin.firestore()
      .collection('progress')
      .where('userId', '==', uid)
      .get();
    
    progressSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete metrics
    const metricsCollections = ['dailyMetrics', 'weeklyMetrics', 'monthlyMetrics'];
    for (const collection of metricsCollections) {
      const metricsSnapshot = await admin.firestore()
        .collection(collection)
        .where('userId', '==', uid)
        .get();
      
      metricsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    // Delete user settings
    batch.delete(admin.firestore().collection('userSettings').doc(uid));
    
    // Commit all deletions
    await batch.commit();
    
    console.log(`User data deleted for: ${uid}`);
  } catch (error) {
    console.error('Error deleting user data:', error);
  }
});

// Example HTTP function for health check
export const healthCheck = functions.https.onRequest((request, response) => {
  response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MyBenefit API'
  });
});

// Example function for calculating weekly progress
export const calculateWeeklyProgress = functions.pubsub
  .schedule('every sunday 00:00')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getDay(), 0);
      const weekEnd = new Date(now.getFullYear(), now.getDay(), 6);
      
      // Get all users
      const usersSnapshot = await admin.firestore()
        .collection('profiles')
        .get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        // Calculate weekly metrics
        const activitiesSnapshot = await admin.firestore()
          .collection('extendedActivities')
          .where('userId', '==', userId)
          .where('date', '>=', weekStart)
          .where('date', '<=', weekEnd)
          .get();
        
        let totalSteps = 0;
        let totalCalories = 0;
        let totalActiveMinutes = 0;
        let totalDistance = 0;
        
        activitiesSnapshot.docs.forEach(doc => {
          const activity = doc.data();
          totalSteps += activity.steps || 0;
          totalCalories += activity.caloriesBurned || 0;
          totalActiveMinutes += activity.activeMinutes || 0;
          totalDistance += activity.distance || 0;
        });
        
        // Save weekly metrics
        await admin.firestore()
          .collection('weeklyMetrics')
          .doc(`${userId}_${weekStart.toISOString().split('T')[0]}`)
          .set({
            userId,
            weekStart: weekStart,
            weekEnd: weekEnd,
            totalSteps,
            totalCalories,
            totalActiveMinutes,
            totalDistance,
            activitiesCount: activitiesSnapshot.size,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
      }
      
      console.log('Weekly progress calculation completed');
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
    }
  }); 