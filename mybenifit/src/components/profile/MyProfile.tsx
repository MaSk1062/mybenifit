import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

// Helper components defined at the top
interface InputProps {
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
}

const Input: React.FC<InputProps> = ({ type = 'text', placeholder = '', value, onChange, className = '', ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
    {children}
  </label>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  
  // State for user profile data
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userAge, setUserAge] = useState(0);

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        setUserName(user.displayName || '');
        setUserEmail(user.email || '');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || '');
      setUserEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Handle saving changes
  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, you would save to Firestore here
      console.log('Saving profile data:', {
        fullName: userName,
        email: userEmail,
        bio: userBio,
        location: userLocation,
        age: userAge,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get provider name
  const getProviderName = () => {
    if (!currentUser) return 'Unknown';
    
    const providers = currentUser.providerData;
    if (providers.length > 0) {
      const provider = providers[0];
      switch (provider.providerId) {
        case 'google.com':
          return 'Google';
        case 'facebook.com':
          return 'Facebook';
        case 'twitter.com':
          return 'Twitter';
        case 'github.com':
          return 'GitHub';
        case 'password':
          return 'Email/Password';
        default:
          return 'Custom';
      }
    }
    return 'Email/Password';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show sign in required if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-800 mb-6">Please sign in to view your profile.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter antialiased flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">User Profile</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-blue-500">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{userName || 'User'}</h2>
            <p className="text-md text-gray-800">{userEmail}</p>
            <p className="text-sm text-gray-700 mt-1">
              Member since {currentUser.metadata.creationTime ? formatDate(currentUser.metadata.creationTime) : 'Recently'}
            </p>
          </div>

          {/* Firebase Auth Information Section */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-900 font-medium">User ID</Label>
                <p className="text-sm text-gray-800 font-mono bg-white p-2 rounded border">
                  {currentUser.uid}
                </p>
              </div>
              <div>
                <Label className="text-blue-900 font-medium">Sign-in Provider</Label>
                <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                  {getProviderName()}
                </p>
              </div>
              <div>
                <Label className="text-blue-900 font-medium">Email Verified</Label>
                <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                  {currentUser.emailVerified ? (
                    <span className="text-green-600 font-medium">✓ Verified</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Not Verified</span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-blue-900 font-medium">Last Sign In</Label>
                <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                  {currentUser.metadata.lastSignInTime ? formatDate(currentUser.metadata.lastSignInTime) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bio Section */}
            <div>
              <Label htmlFor="userBio" className="text-lg font-semibold text-gray-900">Bio</Label>
              {isEditing ? (
                <textarea
                  id="userBio"
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md border border-gray-100">
                  {userBio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Other Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName" className="text-lg font-semibold text-gray-900">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md border border-gray-100">
                    {userName || 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userEmail" className="text-lg font-semibold text-gray-900">Email</Label>
                <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md border border-gray-100">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="userLocation" className="text-lg font-semibold text-gray-900">Location</Label>
                {isEditing ? (
                  <Input
                    id="userLocation"
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md border border-gray-100">
                    {userLocation || 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userAge" className="text-lg font-semibold text-gray-900">Age</Label>
                {isEditing ? (
                  <Input
                    id="userAge"
                    type="number"
                    value={userAge || 0}
                    onChange={(e) => setUserAge(parseInt(e.target.value) || 0)}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-md border border-gray-100">
                    {userAge || 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <Button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">
              Sign Out
            </Button>
            
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
