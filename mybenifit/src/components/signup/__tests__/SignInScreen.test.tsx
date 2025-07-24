import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInScreen from '../SignInScreen';

// Mock Firebase auth
vi.mock('../../../config/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
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

describe('SignInScreen Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the sign in screen', () => {
    render(<SignInScreen />);
    
    expect(screen.getByText('MyBenYfit')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should display form fields', () => {
    render(<SignInScreen />);
    
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should allow switching between sign in and sign up modes', async () => {
    render(<SignInScreen />);

    // Initially in sign in mode
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();

    // Switch to sign up mode
    await user.click(screen.getByText('Create Account'));

    // Should show sign up form
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign In'));

    // Should show validation error
    expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
  });

  it('should validate password length', async () => {
    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    // Enter short password
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');

    await user.click(screen.getByText('Sign In'));

    // Should show validation error
    expect(screen.getByText(/Password must be at least 6 characters/)).toBeInTheDocument();
  });

  it('should handle successful sign in', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockResolvedValue({ user: { uid: 'test-uid' } });

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle successful sign up', async () => {
    const mockSignUp = vi.mocked(require('../../../config/firebase').auth.createUserWithEmailAndPassword);
    mockSignUp.mockResolvedValue({ user: { uid: 'test-uid' } });

    render(<SignInScreen />);

    // Switch to sign up mode
    await user.click(screen.getByText('Create Account'));

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
    });
  });

  it('should handle sign in errors', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockRejectedValue(new Error('Invalid email or password'));

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/)).toBeInTheDocument();
    });
  });

  it('should handle sign up errors', async () => {
    const mockSignUp = vi.mocked(require('../../../config/firebase').auth.createUserWithEmailAndPassword);
    mockSignUp.mockRejectedValue(new Error('Email already in use'));

    render(<SignInScreen />);

    // Switch to sign up mode
    await user.click(screen.getByText('Create Account'));

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByText(/Email already in use/)).toBeInTheDocument();
    });
  });

  it('should show loading state during authentication', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign In'));

    // Should show loading state
    expect(screen.getByText(/Signing in.../)).toBeInTheDocument();
  });

  it('should clear form after successful authentication', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockResolvedValue({ user: { uid: 'test-uid' } });

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('should handle network errors', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockRejectedValue(new Error('Network error'));

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(<SignInScreen />);

    // Try to submit without filling fields
    await user.click(screen.getByText('Sign In'));

    expect(screen.getByText(/Please enter your email/)).toBeInTheDocument();
    expect(screen.getByText(/Please enter your password/)).toBeInTheDocument();
  });

  it('should handle password visibility toggle', async () => {
    render(<SignInScreen />);

    const passwordInput = screen.getByLabelText(/Password/);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Password should be hidden initially
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle visibility
    await user.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back
    await user.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle form submission with Enter key', async () => {
    const mockSignIn = vi.mocked(require('../../../config/firebase').auth.signInWithEmailAndPassword);
    mockSignIn.mockResolvedValue({ user: { uid: 'test-uid' } });

    render(<SignInScreen />);

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Password/);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Press Enter in password field
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
}); 