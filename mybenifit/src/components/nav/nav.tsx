import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { auth } from '../../firebase';

function NavBar() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo/Brand Name */}
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200">
            MyBenYfit
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link to="/activities" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Activities
                </Link>
                <Link to="/goals" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Goals
                </Link>
                <Link to="/workouts" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Workouts
                </Link>
                <Link to="/user-profile" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Profile
                </Link>
                <Link to="/settings" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Sign Up
                </Link>
                <Link to="/signup" className="text-gray-800 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
  );
}

export default NavBar;

  