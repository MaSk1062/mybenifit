import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Profile,
  Activity,
  Progress,
  Goal,
  Workout,
  ExtendedActivity,
  Exercise
} from '../types/firestore';

// Profile Services
export const profileService = {
  // Create or update profile
  async createProfile(profile: Omit<Profile, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'profiles'), {
      ...profile,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
    const docRef = doc(db, 'profiles', id);
    await updateDoc(docRef, updates);
  },

  async getProfile(id: string): Promise<Profile | null> {
    const docRef = doc(db, 'profiles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Profile;
    }
    return null;
  },

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const q = query(collection(db, 'profiles'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Profile;
    }
    return null;
  },

  // Listen to profile changes
  subscribeToProfile(id: string, callback: (profile: Profile | null) => void) {
    const docRef = doc(db, 'profiles', id);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Profile);
      } else {
        callback(null);
      }
    });
  }
};

// Activity Services
export const activityService = {
  async createActivity(activity: Omit<Activity, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'activities'), activity);
    return docRef.id;
  },

  async getActivitiesByUser(userId: string, limitCount: number = 50): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity);
  },

  async getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity);
  },

  async updateActivity(id: string, updates: Partial<Activity>): Promise<void> {
    const docRef = doc(db, 'activities', id);
    await updateDoc(docRef, updates);
  },

  async deleteActivity(id: string): Promise<void> {
    const docRef = doc(db, 'activities', id);
    await deleteDoc(docRef);
  },

  // Listen to user activities
  subscribeToUserActivities(userId: string, callback: (activities: Activity[]) => void) {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity);
      callback(activities);
    });
  }
};

// Extended Activity Services (for the current MyActivity component)
export const extendedActivityService = {
  async createExtendedActivity(activity: Omit<ExtendedActivity, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'extendedActivities'), {
      ...activity,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  },

  async getExtendedActivitiesByUser(userId: string): Promise<ExtendedActivity[]> {
    const q = query(
      collection(db, 'extendedActivities'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ExtendedActivity);
  },

  async updateExtendedActivity(id: string, updates: Partial<ExtendedActivity>): Promise<void> {
    const docRef = doc(db, 'extendedActivities', id);
    await updateDoc(docRef, updates);
  },

  async deleteExtendedActivity(id: string): Promise<void> {
    const docRef = doc(db, 'extendedActivities', id);
    await deleteDoc(docRef);
  },

  // Listen to user extended activities
  subscribeToUserExtendedActivities(userId: string, callback: (activities: ExtendedActivity[]) => void) {
    const q = query(
      collection(db, 'extendedActivities'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ExtendedActivity);
      callback(activities);
    });
  }
};

// Progress Services
export const progressService = {
  async createProgress(progress: Omit<Progress, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'progress'), progress);
    return docRef.id;
  },

  async getProgressByUser(userId: string, type?: 'weekly' | 'monthly'): Promise<Progress[]> {
    let q = query(
      collection(db, 'progress'),
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );
    
    if (type) {
      q = query(
        collection(db, 'progress'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('startDate', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Progress);
  },

  async updateProgress(id: string, updates: Partial<Progress>): Promise<void> {
    const docRef = doc(db, 'progress', id);
    await updateDoc(docRef, updates);
  },

  async deleteProgress(id: string): Promise<void> {
    const docRef = doc(db, 'progress', id);
    await deleteDoc(docRef);
  }
};

// Goal Services
export const goalService = {
  async createGoal(goal: Omit<Goal, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'goals'), goal);
    return docRef.id;
  },

  async getGoalsByUser(userId: string, achieved?: boolean): Promise<Goal[]> {
    let q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('targetDate', 'desc')
    );
    
    if (achieved !== undefined) {
      q = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        where('achieved', '==', achieved),
        orderBy('targetDate', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Goal);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    const docRef = doc(db, 'goals', id);
    await updateDoc(docRef, updates);
  },

  async deleteGoal(id: string): Promise<void> {
    const docRef = doc(db, 'goals', id);
    await deleteDoc(docRef);
  },

  // Listen to user goals
  subscribeToUserGoals(userId: string, callback: (goals: Goal[]) => void) {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('targetDate', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Goal);
      callback(goals);
    });
  }
};

// Workout Services
export const workoutService = {
  async createWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'workouts'), workout);
    return docRef.id;
  },

  async getWorkoutsByUser(userId: string, limitCount: number = 50): Promise<Workout[]> {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Workout);
  },

  async getWorkout(id: string): Promise<Workout | null> {
    const docRef = doc(db, 'workouts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Workout;
    }
    return null;
  },

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<void> {
    const docRef = doc(db, 'workouts', id);
    await updateDoc(docRef, updates);
  },

  async deleteWorkout(id: string): Promise<void> {
    const docRef = doc(db, 'workouts', id);
    await deleteDoc(docRef);
  },

  // Listen to user workouts
  subscribeToUserWorkouts(userId: string, callback: (workouts: Workout[]) => void) {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Workout);
      callback(workouts);
    });
  }
};

// Dashboard Services
export const dashboardService = {
  // Daily Metrics
  async createDailyMetrics(metrics: {
    userId: string;
    date: string; // YYYY-MM-DD format
    steps: number;
    caloriesBurned: number;
    activeMinutes: number;
    distance: number;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, 'dailyMetrics'), {
      ...metrics,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getDailyMetrics(userId: string, date: string): Promise<any> {
    const q = query(
      collection(db, 'dailyMetrics'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async updateDailyMetrics(id: string, updates: any): Promise<void> {
    const docRef = doc(db, 'dailyMetrics', id);
    await updateDoc(docRef, updates);
  },

  async getWeeklyMetrics(userId: string, startDate: string, endDate: string): Promise<any[]> {
    const q = query(
      collection(db, 'dailyMetrics'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // User Settings
  async createUserSettings(settings: {
    userId: string;
    dailyStepsTarget: number;
    theme?: string;
    notifications?: boolean;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, 'userSettings'), {
      ...settings,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getUserSettings(userId: string): Promise<any> {
    const q = query(
      collection(db, 'userSettings'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async updateUserSettings(id: string, updates: any): Promise<void> {
    const docRef = doc(db, 'userSettings', id);
    await updateDoc(docRef, updates);
  },

  // Listen to user settings
  subscribeToUserSettings(userId: string, callback: (settings: any) => void) {
    const q = query(
      collection(db, 'userSettings'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },

  // Listen to daily metrics
  subscribeToDailyMetrics(userId: string, date: string, callback: (metrics: any) => void) {
    const q = query(
      collection(db, 'dailyMetrics'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },

  // Get aggregated dashboard data
  async getDashboardData(userId: string): Promise<{
    todayMetrics: any;
    weeklyData: any[];
    recentActivities: ExtendedActivity[];
    userGoals: Goal[];
    userSettings: any;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = new Date().toISOString().split('T')[0];

    const [todayMetrics, weeklyData, recentActivities, userGoals, userSettings] = await Promise.all([
      this.getDailyMetrics(userId, today),
      this.getWeeklyMetrics(userId, weekStartStr, weekEndStr),
      extendedActivityService.getExtendedActivitiesByUser(userId),
      goalService.getGoalsByUser(userId),
      this.getUserSettings(userId)
    ]);

    return {
      todayMetrics,
      weeklyData,
      recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
      userGoals,
      userSettings
    };
  }
};

// Utility functions
export const firestoreUtils = {
  // Convert Date to Firestore Timestamp
  toTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  },

  // Convert Firestore Timestamp to Date
  toDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  },

  // Get current timestamp
  now(): Timestamp {
    return Timestamp.now();
  },

  // Batch operations
  async batchCreate(collectionName: string, documents: any[]): Promise<void> {
    const batch = writeBatch(db);
    documents.forEach(doc => {
      const docRef = doc(collection(db, collectionName));
      batch.set(docRef, doc);
    });
    await batch.commit();
  },

  // Calculate date ranges
  getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  },

  getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return { start, end };
  }
}; 