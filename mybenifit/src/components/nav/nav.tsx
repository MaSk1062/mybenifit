import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { auth } from '../../firebase';

function NavBar() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-black">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-600 transition-colors duration-200">
          MyBenYfit
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="/activities" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Activities
              </Link>
              <Link to="/goals" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Goals
              </Link>
              <Link to="/workouts" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Workouts
              </Link>
              <Link to="/analytics" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Analytics
              </Link>
              <Link to="/user-profile" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Profile
              </Link>
              <Link to="/settings" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Sign Up
              </Link>
              <Link to="/login" className="text-black hover:text-gray-600 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-black hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/activities"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Activities
                </Link>
                <Link
                  to="/goals"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Goals
                </Link>
                <Link
                  to="/workouts"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Workouts
                </Link>
                <Link
                  to="/analytics"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Analytics
                </Link>
                <Link
                  to="/user-profile"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-black hover:text-gray-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="text-black hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;

  