import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../home';

// Mock React Router
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

describe('Home Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the home component', () => {
    render(<Home />);
    
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your fitness journey!')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(<Home />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    render(<Home />);
    
    expect(screen.getByText('Track Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Set Goals')).toBeInTheDocument();
    expect(screen.getByText('Log Activities')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('should have working navigation links', () => {
    render(<Home />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const workoutsLink = screen.getByText('Workouts').closest('a');
    const goalsLink = screen.getByText('Goals').closest('a');
    const activitiesLink = screen.getByText('Activities').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(workoutsLink).toHaveAttribute('href', '/workouts');
    expect(goalsLink).toHaveAttribute('href', '/goals');
    expect(activitiesLink).toHaveAttribute('href', '/activities');
  });

  it('should display call-to-action buttons', () => {
    render(<Home />);
    
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('should handle button clicks', async () => {
    render(<Home />);
    
    const getStartedButton = screen.getByText('Get Started');
    const learnMoreButton = screen.getByText('Learn More');

    await user.click(getStartedButton);
    await user.click(learnMoreButton);

    // Buttons should be clickable
    expect(getStartedButton).toBeInTheDocument();
    expect(learnMoreButton).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<Home />);
    
    expect(screen.getByText(/Start your fitness journey today/)).toBeInTheDocument();
  });

  it('should display app description', () => {
    render(<Home />);
    
    expect(screen.getByText(/comprehensive fitness tracking app/)).toBeInTheDocument();
  });

  it('should have responsive design elements', () => {
    render(<Home />);
    
    // Check for responsive classes
    const container = screen.getByText('MyBenYfit').closest('div');
    expect(container).toHaveClass('container');
  });

  it('should display footer information', () => {
    render(<Home />);
    
    expect(screen.getByText(/© 2024 MyBenYfit/)).toBeInTheDocument();
  });
}); 