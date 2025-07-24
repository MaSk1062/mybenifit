# MyBenYfit - Fitness Tracking App

A comprehensive fitness tracking application built with React, TypeScript, and Firebase Firestore. This app allows users to track their fitness activities, set goals, manage workouts, and maintain their profile information.

## Features

### 🔥 Firebase Firestore Integration
- **Real-time data synchronization** across all devices
- **Secure user authentication** with Firebase Auth
- **Cloud data storage** with automatic backups
- **Offline support** with data synchronization when online

### 📊 Activity Tracking
- Log various types of fitness activities (Running, Strength Training, Cycling, Swimming, Yoga, Walking)
- Track duration, distance, and calories burned
- Add personal notes to each activity
- View activity history with detailed information
- Delete activities as needed

### 🎯 Goal Management
- Set fitness goals for steps, calories, weight, or distance
- Track progress with visual progress bars
- Update current progress in real-time
- Mark goals as achieved when targets are met
- Set target dates for goal completion

### 💪 Workout Management
- Create detailed workout sessions
- Add multiple exercises to each workout
- Track sets, reps, weight, duration, and distance for each exercise
- View workout history with exercise details
- Manage workout templates

### 👤 User Profile
- Complete user profile management
- Track personal information (age, gender, height, weight)
- Calculate and display BMI
- Profile picture support via URL
- Account creation date tracking

## Firebase Firestore Collections

### 1. Profiles Collection
```typescript
{
  id: string;
  fullName: string;
  email: string;
  createdAt: Timestamp;
  avatarUrl?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
}
```

### 2. Activities Collection
```typescript
{
  id: string;
  userId: string;
  date: Timestamp;
  steps: number;
  caloriesBurned: number;
  distance: number;
  activeMinutes: number;
}
```

### 3. Extended Activities Collection (Custom Activities)
```typescript
{
  id: string;
  userId: string;
  activityType: string;
  duration: number;
  distance?: number;
  caloriesBurned?: number;
  notes?: string;
  date: Timestamp;
  timestamp: Timestamp;
}
```

### 4. Progress Collection
```typescript
{
  id: string;
  userId: string;
  type: "weekly" | "monthly";
  startDate: Timestamp;
  endDate: Timestamp;
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
}
```

### 5. Goals Collection
```typescript
{
  id: string;
  userId: string;
  type: "steps" | "calories" | "weight" | "distance";
  target: number;
  current: number;
  startDate: Timestamp;
  targetDate: Timestamp;
  achieved: boolean;
}
```

### 6. Workouts Collection
```typescript
{
  id: string;
  userId: string;
  name: string;
  date: Timestamp;
  duration: number;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **UI Components**: Custom shadcn/ui inspired components
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mybenifit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config to `src/config/firebase.ts`

4. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /profiles/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /activities/{docId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       match /extendedActivities/{docId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       match /progress/{docId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       match /goals/{docId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       match /workouts/{docId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── myactivity/          # Activity tracking component
│   ├── goals/              # Goal management component
│   ├── workouts/           # Workout management component
│   ├── profile/            # User profile component
│   └── signup/             # Authentication components
├── config/
│   └── firebase.ts         # Firebase configuration
├── services/
│   └── firestore.ts        # Firestore service functions
├── types/
│   └── firestore.ts        # TypeScript type definitions
└── main.tsx               # Application entry point
```

## Key Features Implementation

### Real-time Data Synchronization
- Uses Firebase Firestore's `onSnapshot` listeners for real-time updates
- Automatic data synchronization across multiple devices
- Offline support with data persistence

### User Authentication
- Firebase Authentication integration
- Automatic profile creation on first sign-in
- Protected routes and components

### Data Validation
- Client-side form validation
- TypeScript type safety
- Firestore security rules for server-side validation

### Performance Optimization
- Efficient queries with proper indexing
- Pagination for large datasets
- Optimistic UI updates

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
