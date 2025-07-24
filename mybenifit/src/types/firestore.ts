import { Timestamp } from 'firebase/firestore';

// Profile Collection Types
export interface Profile {
  id?: string;
  fullName: string;
  email: string;
  createdAt: Timestamp;
  avatarUrl?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bio?: string;
  location?: string;
}

// Activities Collection Types
export interface Activity {
  id?: string;
  userId: string;
  date: Timestamp;
  steps: number;
  caloriesBurned: number;
  distance: number;
  activeMinutes: number;
}

// Progress Collection Types
export interface Progress {
  id?: string;
  userId: string;
  type: 'weekly' | 'monthly';
  startDate: Timestamp;
  endDate: Timestamp;
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
}

// Goals Collection Types
export interface Goal {
  id?: string;
  userId: string;
  type: 'steps' | 'calories' | 'weight' | 'distance';
  target: number;
  current: number;
  startDate: Timestamp;
  targetDate: Timestamp;
  achieved: boolean;
}

// Workouts Collection Types
export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // for cardio exercises
}

export interface Workout {
  id?: string;
  userId: string;
  name: string;
  date: Timestamp;
  duration: number; // minutes
  exercises: Exercise[];
}

// Extended Activity Type for the current MyActivity component
export interface ExtendedActivity {
  id?: string;
  userId: string;
  activityType: string;
  duration: number; // minutes
  distance?: number;
  caloriesBurned?: number;
  notes?: string;
  date: Timestamp;
  timestamp: Timestamp;
} 