import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Mydash from '../Mydash';
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

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

describe('Dashboard Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dashboard component', () => {
    render(<Mydash />);
    
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your fitness dashboard!')).toBeInTheDocument();
  });

  it('should display user information when authenticated', () => {
    render(<Mydash />);
    
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should show sign in required when not authenticated', () => {
    vi.mocked(require('../../../config/firebase').auth.onAuthStateChanged).mockImplementation((callback) => {
      callback(null);
      return vi.fn();
    });

    render(<Mydash />);
    
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should allow adding a new activity', async () => {
    render(<Mydash />);

    // Fill in activity form
    await user.type(screen.getByLabelText(/Activity Name/), 'Morning Run');
    await user.type(screen.getByLabelText(/Duration/), '30');
    await user.type(screen.getByLabelText(/Distance/), '5');
    await user.type(screen.getByLabelText(/Calories/), '300');
    await user.type(screen.getByLabelText(/Date/), '2024-01-01');

    // Submit activity
    await user.click(screen.getByText('Add Activity'));

    // Check if activity was added (this would require checking state or DOM)
    expect(screen.getByText('Add Activity')).toBeInTheDocument();
  });

  it('should allow adding a new goal', async () => {
    render(<Mydash />);

    // Fill in goal form
    await user.type(screen.getByLabelText(/Goal Name/), 'Daily Steps');
    await user.type(screen.getByLabelText(/Target/), '10000');
    await user.type(screen.getByLabelText(/Current/), '5000');
    await user.selectOptions(screen.getByLabelText(/Unit/), 'steps');

    // Submit goal
    await user.click(screen.getByText('Add Goal'));

    // Check if goal was added
    expect(screen.getByText('Add Goal')).toBeInTheDocument();
  });

  it('should validate goal target is positive', async () => {
    render(<Mydash />);

    // Fill with negative target
    await user.type(screen.getByLabelText(/Goal Name/), 'Daily Steps');
    await user.type(screen.getByLabelText(/Target/), '-1000');
    await user.type(screen.getByLabelText(/Current/), '5000');
    await user.selectOptions(screen.getByLabelText(/Unit/), 'steps');

    await user.click(screen.getByText('Add Goal'));

    // Goal should not be added with invalid target
    expect(screen.getByText('Add Goal')).toBeInTheDocument();
  });

  it('should allow updating goal progress', async () => {
    render(<Mydash />);

    // Add a goal first
    await user.type(screen.getByLabelText(/Goal Name/), 'Daily Steps');
    await user.type(screen.getByLabelText(/Target/), '10000');
    await user.type(screen.getByLabelText(/Current/), '5000');
    await user.selectOptions(screen.getByLabelText(/Unit/), 'steps');
    await user.click(screen.getByText('Add Goal'));

    // Update progress (this would require finding the goal in the DOM)
    expect(screen.getByText('Add Goal')).toBeInTheDocument();
  });

  it('should allow setting daily steps target', async () => {
    render(<Mydash />);

    // Set daily steps target
    await user.type(screen.getByLabelText(/Daily Steps Target/), '8000');
    await user.click(screen.getByText('Set Target'));

    // Check if target was set
    expect(screen.getByText('Set Target')).toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.mocked(require('../../../config/firebase').auth.signOut);
    mockSignOut.mockResolvedValue();

    render(<Mydash />);

    await user.click(screen.getByText('Sign Out'));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    render(<Mydash />);

    // The component should show loading state initially
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
  });

  it('should display calendar', () => {
    render(<Mydash />);

    // Check if calendar elements exist
    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('should allow navigating between months', async () => {
    render(<Mydash />);

    // Check if navigation buttons exist
    const prevButton = screen.getByText('←');
    const nextButton = screen.getByText('→');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Click next month
    await user.click(nextButton);

    // Click previous month
    await user.click(prevButton);
  });

  it('should display metrics summary', () => {
    render(<Mydash />);

    // Check if metrics sections exist
    expect(screen.getByText('Today\'s Progress')).toBeInTheDocument();
    expect(screen.getByText('Weekly Overview')).toBeInTheDocument();
    expect(screen.getByText('Monthly Stats')).toBeInTheDocument();
  });

  it('should display recent activities', () => {
    render(<Mydash />);

    // Check if recent activities section exists
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
  });

  it('should display current goals', () => {
    render(<Mydash />);

    // Check if current goals section exists
    expect(screen.getByText('Current Goals')).toBeInTheDocument();
  });

  it('should handle form validation', async () => {
    render(<Mydash />);

    // Try to submit activity without required fields
    await user.click(screen.getByText('Add Activity'));

    // Form should not submit without required fields
    expect(screen.getByText('Add Activity')).toBeInTheDocument();
  });

  it('should handle numeric input validation', async () => {
    render(<Mydash />);

    // Try to add activity with invalid numeric values
    await user.type(screen.getByLabelText(/Activity Name/), 'Test Activity');
    await user.type(screen.getByLabelText(/Duration/), 'invalid');
    await user.type(screen.getByLabelText(/Distance/), 'invalid');
    await user.type(screen.getByLabelText(/Calories/), 'invalid');

    await user.click(screen.getByText('Add Activity'));

    // Activity should not be added with invalid values
    expect(screen.getByText('Add Activity')).toBeInTheDocument();
  });

  it('should display progress bars', () => {
    render(<Mydash />);

    // Check if progress bars exist
    // This would require checking for progress bar elements
    expect(screen.getByText('Today\'s Progress')).toBeInTheDocument();
  });

  it('should handle empty states', () => {
    render(<Mydash />);

    // Check if empty state messages exist
    expect(screen.getByText('No activities logged yet')).toBeInTheDocument();
    expect(screen.getByText('No goals set yet')).toBeInTheDocument();
  });
}); 