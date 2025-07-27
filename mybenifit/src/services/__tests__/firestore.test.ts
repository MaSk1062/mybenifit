import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  workoutService, 
  goalService, 
  activityService, 
  extendedActivityService,
  firestoreUtils 
} from '../firestore';
import { mockWorkout, mockGoal, mockActivity } from '../../test/utils';

// Mock Firebase Firestore functions
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockQuerySnapshot = {
  docs: [
    {
      id: 'doc-1',
      data: () => mockWorkout
    }
  ]
};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: mockOnSnapshot,
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() }))
  },
  serverTimestamp: vi.fn()
}));

describe('Firestore Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('workoutService', () => {
    it('should create a workout', async () => {
      const { id, ...workoutData } = mockWorkout;
      
      mockAddDoc.mockResolvedValue({ id: 'new-workout-id' });
      
      const result = await workoutService.createWorkout(workoutData);
      
      expect(result).toBe('new-workout-id');
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), workoutData);
    });

    it('should get workouts by user', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      
      const result = await workoutService.getWorkoutsByUser('user-id');
      
      expect(result).toEqual([{ id: 'doc-1', ...mockWorkout }]);
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it('should update a workout', async () => {
      const updates = { name: 'Updated Workout' };
      
      await workoutService.updateWorkout('workout-id', updates);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), updates);
    });

    it('should delete a workout', async () => {
      await workoutService.deleteWorkout('workout-id');
      
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('goalService', () => {
    it('should create a goal', async () => {
      const goalData = { ...mockGoal };
      delete goalData.id;
      
      mockAddDoc.mockResolvedValue({ id: 'new-goal-id' });
      
      const result = await goalService.createGoal(goalData);
      
      expect(result).toBe('new-goal-id');
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), goalData);
    });

    it('should get goals by user', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: 'goal-1', data: () => mockGoal }]
      });
      
      const result = await goalService.getGoalsByUser('user-id');
      
      expect(result).toEqual([{ id: 'goal-1', ...mockGoal }]);
      expect(mockGetDocs).toHaveBeenCalled();
    });

    it('should update a goal', async () => {
      const updates = { current: 7500 };
      
      await goalService.updateGoal('goal-id', updates);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), updates);
    });

    it('should delete a goal', async () => {
      await goalService.deleteGoal('goal-id');
      
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('activityService', () => {
    it('should create an activity', async () => {
      const activityData = { ...mockActivity };
      delete activityData.id;
      
      mockAddDoc.mockResolvedValue({ id: 'new-activity-id' });
      
      const result = await activityService.createActivity(activityData);
      
      expect(result).toBe('new-activity-id');
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), activityData);
    });

    it('should get activities by user', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: 'activity-1', data: () => mockActivity }]
      });
      
      const result = await activityService.getActivitiesByUser('user-id');
      
      expect(result).toEqual([{ id: 'activity-1', ...mockActivity }]);
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });

  describe('extendedActivityService', () => {
    it('should create an extended activity', async () => {
      const activityData = { ...mockActivity };
      delete activityData.id;
      delete activityData.timestamp;
      
      mockAddDoc.mockResolvedValue({ id: 'new-activity-id' });
      
      const result = await extendedActivityService.createExtendedActivity(activityData);
      
      expect(result).toBe('new-activity-id');
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(activityData));
    });

    it('should get extended activities by user', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: 'activity-1', data: () => mockActivity }]
      });
      
      const result = await extendedActivityService.getExtendedActivitiesByUser('user-id');
      
      expect(result).toEqual([{ id: 'activity-1', ...mockActivity }]);
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });

  describe('firestoreUtils', () => {
    it('should convert date to timestamp', () => {
      const date = new Date('2024-01-01');
      const result = firestoreUtils.toTimestamp(date);
      
      expect(result).toBeDefined();
    });

    it('should convert timestamp to date', () => {
      const timestamp = { toDate: () => new Date('2024-01-01') };
      const result = firestoreUtils.toDate(timestamp as any);
      
      expect(result).toBeInstanceOf(Date);
    });

    it('should get current timestamp', () => {
      const result = firestoreUtils.now();
      
      expect(result).toBeDefined();
    });
  });
}); 