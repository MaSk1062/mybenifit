import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

function LandingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter antialiased flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-black">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo/Brand Name */}
          <Link to="/" className="text-2xl font-bold text-black hover:text-gray-600 transition-colors duration-200">
            MyBenYfit
          </Link>

          {/* Navigation Links - Only show if user is not logged in */}
          {!currentUser ? (
            <div className="flex space-x-6">
              <Link to="/signup" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Sign Up
              </Link>
              <Link to="/login" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Login
              </Link>
            </div>
          ) : (
            <div className="flex space-x-6">
              <Link to="/dashboard" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="/profile" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Profile
              </Link>
              <Link to="/settings" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Section */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight mb-6">
            Achieve Your Fitness Goals with <span className="text-black">Ease</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Track your activities, set ambitious goals, and monitor your progress with our intuitive and powerful fitness tracker. Your journey to a healthier you starts here.
          </p>
          
          {/* Conditional buttons based on authentication status */}
          {!currentUser ? (
            <div className="flex justify-center space-x-4">
              <Link
                to="/signup"
                className="px-8 py-3 rounded-md bg-black text-white text-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 shadow-md"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 rounded-md border-2 border-black text-black text-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 shadow-md"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link
                to="/dashboard"
                className="px-8 py-3 rounded-md bg-black text-white text-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 shadow-md"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-8 py-3 rounded-md border-2 border-black text-black text-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 shadow-md"
              >
                View Profile
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 text-center text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} MyBenyfit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
