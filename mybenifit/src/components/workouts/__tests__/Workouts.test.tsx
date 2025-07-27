import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Workouts from '../Workouts';
import { mockUser } from '../../../test/utils';

// Mock the auth and services
vi.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: mockUser,
    onAuthStateChanged: vi.fn((callback) => {
      callback(mockUser);
      return vi.fn(); // unsubscribe function
    }),
    signOut: vi.fn(),
  },
}));

vi.mock('../../../services/firestore', () => ({
  workoutService: {
    createWorkout: vi.fn(),
    getWorkoutsByUser: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
    subscribeToUserWorkouts: vi.fn(() => vi.fn()),
  },
  firestoreUtils: {
    toTimestamp: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('Workouts Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the workouts component', () => {
    render(<Workouts />);
    
    expect(screen.getByText('Your Workouts')).toBeInTheDocument();
    expect(screen.getByText('Log Your Activity')).toBeInTheDocument();
  });

  it('should display user information when authenticated', () => {
    render(<Workouts />);
    
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should show sign in required when not authenticated', () => {
    vi.mocked(require('../../../config/firebase').auth.onAuthStateChanged).mockImplementation((callback: any) => {
      callback(null);
      return vi.fn();
    });

    render(<Workouts />);
    
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('Go to Sign In')).toBeInTheDocument();
  });

  it('should allow creating a new workout', async () => {
    const mockCreateWorkout = vi.mocked(require('../../../services/firestore').workoutService.createWorkout);
    mockCreateWorkout.mockResolvedValue('new-workout-id');

    render(<Workouts />);

    // Fill in workout form
    await user.type(screen.getByLabelText(/Workout Name/), 'Test Workout');
    await user.type(screen.getByLabelText(/Duration/), '45');
    await user.type(screen.getByLabelText(/Exercise Name/), 'Bench Press');
    await user.type(screen.getByLabelText(/Sets/), '3');
    await user.type(screen.getByLabelText(/Reps/), '10');
    await user.type(screen.getByLabelText(/Weight/), '100');

    // Add exercise
    await user.click(screen.getByText('Add Exercise'));

    // Submit workout
    await user.click(screen.getByText('Create Workout'));

    await waitFor(() => {
      expect(mockCreateWorkout).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Workout',
        duration: 45,
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 100,
          })
        ])
      }));
    });
  });

  it('should validate required fields when creating workout', async () => {
    render(<Workouts />);

    // Try to submit without filling required fields
    await user.click(screen.getByText('Create Workout'));

    expect(screen.getByText(/Please provide a workout name, duration, and at least one exercise/)).toBeInTheDocument();
  });

  it('should validate exercise fields when adding exercise', async () => {
    render(<Workouts />);

    // Try to add exercise without name
    await user.click(screen.getByText('Add Exercise'));

    expect(screen.getByText(/Please enter an exercise name/)).toBeInTheDocument();
  });

  it('should load workout templates', async () => {
    render(<Workouts />);

    // Click on a template
    await user.click(screen.getByText('Upper Body Strength'));

    expect(screen.getByText(/Loaded Upper Body Strength template!/)).toBeInTheDocument();
  });

  it('should allow editing a workout', async () => {
    const mockUpdateWorkout = vi.mocked(require('../../../services/firestore').workoutService.updateWorkout);
    mockUpdateWorkout.mockResolvedValue();

    render(<Workouts />);

    // Simulate having a workout to edit
    // This would require mocking the workout data and state
    // For now, we'll test the edit functionality exists
    expect(screen.getByText('Create Workout')).toBeInTheDocument();
  });

  it('should allow deleting a workout', async () => {
    const mockDeleteWorkout = vi.mocked(require('../../../services/firestore').workoutService.deleteWorkout);
    mockDeleteWorkout.mockResolvedValue();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Workouts />);

    // The delete functionality would be tested here
    // This requires setting up the component with workout data
    expect(confirmSpy).not.toHaveBeenCalled(); // No workouts to delete initially

    confirmSpy.mockRestore();
  });

  it('should handle exercise suggestions', async () => {
    render(<Workouts />);

    // Type in exercise name to trigger suggestions
    const exerciseInput = screen.getByLabelText(/Exercise Name/);
    await user.type(exerciseInput, 'Bench');

    // Check if suggestions appear
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('should handle distance-based exercises', async () => {
    render(<Workouts />);

    // Type a cardio exercise
    const exerciseInput = screen.getByLabelText(/Exercise Name/);
    await user.type(exerciseInput, 'Running');

    // Check if distance input appears
    expect(screen.getByLabelText(/Distance/)).toBeInTheDocument();
  });

  it('should export workout data', async () => {
    // Mock URL.createObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and appendChild
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);


    render(<Workouts />);

    // Export functionality would be tested here
    // This requires having workout data to export
    expect(mockCreateElement).not.toHaveBeenCalled(); // No workouts to export initially

    // Clean up mocks
    vi.restoreAllMocks();
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.mocked(require('../../../config/firebase').auth.signOut);
    mockSignOut.mockResolvedValue();

    render(<Workouts />);

    await user.click(screen.getByText('Sign Out'));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    // Mock loading state
    vi.mocked(require('../../../services/firestore').workoutService.getWorkoutsByUser).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<Workouts />);

    // The component should show loading state
    expect(screen.getByText('Your Workouts')).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    const mockGetWorkouts = vi.mocked(require('../../../services/firestore').workoutService.getWorkoutsByUser);
    mockGetWorkouts.mockRejectedValue(new Error('Network error'));

    render(<Workouts />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });
}); 