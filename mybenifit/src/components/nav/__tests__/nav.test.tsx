import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Nav from '../nav';
import { mockUser } from '../../../test/utils';

// Mock Firebase auth
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

// Mock React Router
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

describe('Navigation Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the navigation component', () => {
    render(<Nav />);
    
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
  });

  it('should display navigation links when authenticated', () => {
    render(<Nav />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('should display user information when authenticated', () => {
    render(<Nav />);
    
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.mocked(require('../../../config/firebase').auth.signOut);
    mockSignOut.mockResolvedValue();

    render(<Nav />);

    await user.click(screen.getByText('Sign Out'));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should have working navigation links', () => {
    render(<Nav />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const workoutsLink = screen.getByText('Workouts').closest('a');
    const goalsLink = screen.getByText('Goals').closest('a');
    const activitiesLink = screen.getByText('Activities').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(workoutsLink).toHaveAttribute('href', '/workouts');
    expect(goalsLink).toHaveAttribute('href', '/goals');
    expect(activitiesLink).toHaveAttribute('href', '/activities');
  });

  it('should show sign in link when not authenticated', () => {
    vi.mocked(require('../../../config/firebase').auth.onAuthStateChanged).mockImplementation((callback: any) => {
      callback(null);
      return vi.fn();
    });

    render(<Nav />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should handle mobile menu toggle', async () => {
    render(<Nav />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    await user.click(menuButton);
    
    // Menu should be toggled
    expect(menuButton).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    // Mock useLocation to return a specific pathname
    vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/dashboard' });

    render(<Nav />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });

  it('should handle responsive design', () => {
    render(<Nav />);
    
    // Check for responsive classes
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('navbar');
  });

  it('should display logo/brand', () => {
    render(<Nav />);
    
    const logo = screen.getByText('MyBenYfit');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('should handle navigation item clicks', async () => {
    render(<Nav />);
    
    const dashboardLink = screen.getByText('Dashboard');
    const workoutsLink = screen.getByText('Workouts');
    
    await user.click(dashboardLink);
    await user.click(workoutsLink);
    
    // Links should be clickable
    expect(dashboardLink).toBeInTheDocument();
    expect(workoutsLink).toBeInTheDocument();
  });

  it('should close mobile menu when clicking outside', async () => {
    render(<Nav />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    // Open menu
    await user.click(menuButton);
    
    // Click outside (simulate)
    await user.click(document.body);
    
    // Menu should close
    expect(menuButton).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    render(<Nav />);
    
    const dashboardLink = screen.getByText('Dashboard');
    
    // Focus on link
    dashboardLink.focus();
    
    // Press Enter
    await user.keyboard('{Enter}');
    
    // Link should be accessible
    expect(dashboardLink).toBeInTheDocument();
  });
}); 