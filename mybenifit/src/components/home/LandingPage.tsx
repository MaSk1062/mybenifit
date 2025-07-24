import React from 'react';

import { Link } from 'react-router';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo/Brand Name */}
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200">
            MyBenYfit
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link to="/sign-up" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Sign Up
            </Link>
            <a href="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Login
            </a>
            <Link to="/dash-board" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Profile
            </Link>
            <Link to="/settings" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Settings
            </Link>
            <Link to="/logout" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-md">
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Section */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Achieve Your Fitness Goals with <span className="text-gray-900">Ease</span> {/* Removed blue text */}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10">
            Track your activities, set ambitious goals, and monitor your progress with our intuitive and powerful fitness tracker. Your journey to a healthier you starts here.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="px-8 py-3 rounded-md bg-gray-800 text-white text-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-colors duration-200 shadow-md"
            >
              Get Started
            </Link>
            <a
              href="/dashboard"
              className="px-8 py-3 rounded-md border-2 border-gray-800 text-gray-800 text-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-colors duration-200 shadow-md"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </main>

      {/* Footer (Optional, but good practice) */}
      <footer className="bg-gray-800 text-white py-6 text-center text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} MyBenyfit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
