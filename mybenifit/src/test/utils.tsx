import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock user data
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  metadata: {
    lastSignInTime: '2024-01-01T00:00:00.000Z'
  }
};

// Mock workout data
export const mockWorkout = {
  id: 'workout-1',
  userId: 'test-user-id',
  name: 'Test Workout',
  date: new Date('2024-01-01'),
  duration: 60,
  exercises: [
    {
      name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 100
    },
    {
      name: 'Squats',
      sets: 4,
      reps: 8,
      weight: 150
    }
  ]
};

// Mock activity data
export const mockActivity = {
  id: 'activity-1',
  userId: 'test-user-id',
  activityType: 'Running',
  duration: 30,
  distance: 5,
  caloriesBurned: 300,
  notes: 'Great run!',
  date: new Date('2024-01-01'),
  timestamp: new Date('2024-01-01')
};

// Mock goal data
export const mockGoal = {
  id: 'goal-1',
  userId: 'test-user-id',
  type: 'steps' as const,
  target: 10000,
  current: 5000,
  startDate: new Date('2024-01-01'),
  targetDate: new Date('2024-01-31'),
  achieved: false
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render }; 