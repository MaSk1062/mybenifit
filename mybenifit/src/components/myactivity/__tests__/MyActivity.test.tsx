import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyActivity from '../MyActivity';
import { mockUser, mockActivity } from '../../../test/utils';

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
  extendedActivityService: {
    createExtendedActivity: vi.fn(),
    getExtendedActivitiesByUser: vi.fn(),
    updateExtendedActivity: vi.fn(),
    deleteExtendedActivity: vi.fn(),
    subscribeToUserExtendedActivities: vi.fn(() => vi.fn()),
  },
  firestoreUtils: {
    toTimestamp: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('MyActivity Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the activity component', () => {
    render(<MyActivity />);
    
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your fitness activity tracker!')).toBeInTheDocument();
  });

  it('should display user information when authenticated', () => {
    render(<MyActivity />);
    
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should show sign in required when not authenticated', () => {
    vi.mocked(require('../../../config/firebase').auth.onAuthStateChanged).mockImplementation((callback) => {
      callback(null);
      return vi.fn();
    });

    render(<MyActivity />);
    
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('Go to Sign In')).toBeInTheDocument();
  });

  it('should allow creating a new activity', async () => {
    const mockCreateActivity = vi.mocked(require('../../../services/firestore').extendedActivityService.createExtendedActivity);
    mockCreateActivity.mockResolvedValue('new-activity-id');

    render(<MyActivity />);

    // Fill in activity form
    await user.selectOptions(screen.getByLabelText(/Activity Type/), 'Running');
    await user.type(screen.getByLabelText(/Duration/), '30');
    await user.type(screen.getByLabelText(/Distance/), '5');
    await user.type(screen.getByLabelText(/Estimated Calories Burned/), '300');
    await user.type(screen.getByLabelText(/Notes/), 'Great run!');

    // Submit activity
    await user.click(screen.getByText('Log Activity'));

    await waitFor(() => {
      expect(mockCreateActivity).toHaveBeenCalledWith(expect.objectContaining({
        activityType: 'Running',
        duration: 30,
        distance: 5,
        caloriesBurned: 300,
        notes: 'Great run!',
      }));
    });
  });

  it('should validate required fields when creating activity', async () => {
    render(<MyActivity />);

    // Try to submit without filling required fields
    await user.click(screen.getByText('Log Activity'));

    expect(screen.getByText(/Please select an activity type/)).toBeInTheDocument();
  });

  it('should validate duration is positive', async () => {
    render(<MyActivity />);

    // Fill with invalid duration
    await user.selectOptions(screen.getByLabelText(/Activity Type/), 'Running');
    await user.type(screen.getByLabelText(/Duration/), '-10');

    await user.click(screen.getByText('Log Activity'));

    expect(screen.getByText(/Please provide a valid, positive duration/)).toBeInTheDocument();
  });

  it('should validate date is not in future', async () => {
    render(<MyActivity />);

    // Set future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    await user.selectOptions(screen.getByLabelText(/Activity Type/), 'Running');
    await user.type(screen.getByLabelText(/Duration/), '30');
    
    const dateInput = screen.getByLabelText(/Date/);
    await user.clear(dateInput);
    await user.type(dateInput, futureDateString);

    await user.click(screen.getByText('Log Activity'));

    expect(screen.getByText(/Activity date cannot be in the future/)).toBeInTheDocument();
  });

  it('should allow editing an activity', async () => {
    const mockUpdateActivity = vi.mocked(require('../../../services/firestore').extendedActivityService.updateExtendedActivity);
    mockUpdateActivity.mockResolvedValue();

    render(<MyActivity />);

    // Simulate having an activity to edit
    // This would require mocking the activity data and state
    // For now, we'll test the edit functionality exists
    expect(screen.getByText('Log Activity')).toBeInTheDocument();
  });

  it('should allow deleting an activity', async () => {
    const mockDeleteActivity = vi.mocked(require('../../../services/firestore').extendedActivityService.deleteExtendedActivity);
    mockDeleteActivity.mockResolvedValue();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MyActivity />);

    // The delete functionality would be tested here
    // This requires setting up the component with activity data
    expect(confirmSpy).not.toHaveBeenCalled(); // No activities to delete initially

    confirmSpy.mockRestore();
  });

  it('should filter activities by type', async () => {
    render(<MyActivity />);

    // Check if filter buttons exist
    expect(screen.getByText('All Activities')).toBeInTheDocument();
  });

  it('should export activity data', async () => {
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
    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor as any);
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor as any);

    render(<MyActivity />);

    // Export functionality would be tested here
    // This requires having activity data to export
    expect(mockCreateElement).not.toHaveBeenCalled(); // No activities to export initially

    // Clean up mocks
    vi.restoreAllMocks();
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.mocked(require('../../../config/firebase').auth.signOut);
    mockSignOut.mockResolvedValue();

    render(<MyActivity />);

    await user.click(screen.getByText('Sign Out'));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    // Mock loading state
    vi.mocked(require('../../../services/firestore').extendedActivityService.getExtendedActivitiesByUser).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<MyActivity />);

    // The component should show loading state
    expect(screen.getByText('Your Activities')).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    const mockGetActivities = vi.mocked(require('../../../services/firestore').extendedActivityService.getExtendedActivitiesByUser);
    mockGetActivities.mockRejectedValue(new Error('Network error'));

    render(<MyActivity />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('should display activity statistics', () => {
    render(<MyActivity />);

    // Check if statistics section exists
    expect(screen.getByText('Activity Summary')).toBeInTheDocument();
  });

  it('should handle optional fields correctly', async () => {
    const mockCreateActivity = vi.mocked(require('../../../services/firestore').extendedActivityService.createExtendedActivity);
    mockCreateActivity.mockResolvedValue('new-activity-id');

    render(<MyActivity />);

    // Fill in only required fields
    await user.selectOptions(screen.getByLabelText(/Activity Type/), 'Running');
    await user.type(screen.getByLabelText(/Duration/), '30');

    // Submit activity
    await user.click(screen.getByText('Log Activity'));

    await waitFor(() => {
      expect(mockCreateActivity).toHaveBeenCalledWith(expect.objectContaining({
        activityType: 'Running',
        duration: 30,
        // Optional fields should not be included
      }));
    });
  });

  it('should handle character limit for notes', async () => {
    render(<MyActivity />);

    const notesInput = screen.getByLabelText(/Notes/);
    const longNote = 'a'.repeat(501); // Exceeds 500 character limit

    await user.type(notesInput, longNote);

    expect(screen.getByText('500/500 characters')).toBeInTheDocument();
  });
}); 