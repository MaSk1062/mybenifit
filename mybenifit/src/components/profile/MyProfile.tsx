import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import NavBar from '../nav/nav';
import { profileService } from '../../services/firestore';
import type { Profile } from '../../types/firestore';

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
    className={`w-full p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
    {...props}
  />
);

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-black mb-1 ${className}`}>
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
    className={`px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // State for user profile data
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userAge, setUserAge] = useState(0);
  const [userHeight, setUserHeight] = useState(0);
  const [userWeight, setUserWeight] = useState(0);
  const [userGender, setUserGender] = useState('');

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
        loadUserProfile(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setUserName(userProfile.fullName || '');
        setUserEmail(userProfile.email || '');
        setUserBio(userProfile.bio || '');
        setUserLocation(userProfile.location || '');
        setUserAge(userProfile.age || 0);
        setUserHeight(userProfile.height || 0);
        setUserWeight(userProfile.weight || 0);
        setUserGender(userProfile.gender || '');
      } else {
        // Create default profile if none exists
        const defaultProfile: Omit<Profile, 'id' | 'createdAt'> = {
          fullName: currentUser?.displayName || '',
          email: currentUser?.email || '',
          bio: '',
          location: '',
          age: 0,
          height: 0,
          weight: 0,
          gender: '',
        };
        await profileService.createProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Handle saving changes
  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      
      const profileData: Partial<Profile> = {
        fullName: userName,
        email: userEmail,
        bio: userBio,
        location: userLocation,
        age: userAge,
        height: userHeight,
        weight: userWeight,
        gender: userGender,
      };

      if (profile?.id) {
        // Update existing profile
        await profileService.updateProfile(profile.id, profileData);
      } else {
        // Create new profile
        const newProfile: Omit<Profile, 'id' | 'createdAt'> = {
          fullName: userName,
          email: userEmail,
          bio: userBio,
          location: userLocation,
          age: userAge,
          height: userHeight,
          weight: userWeight,
          gender: userGender,
        };
        await profileService.createProfile(newProfile);
      }
      
      // Reload profile data
      await loadUserProfile(currentUser.uid);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
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

  // Calculate BMI
  const calculateBMI = () => {
    if (userHeight > 0 && userWeight > 0) {
      const heightInMeters = userHeight / 100; // Convert cm to meters
      const bmi = userWeight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? 
    (parseFloat(bmi) < 18.5 ? 'Underweight' :
     parseFloat(bmi) < 25 ? 'Normal weight' :
     parseFloat(bmi) < 30 ? 'Overweight' : 'Obese') : null;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show sign in required if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Sign In Required</h1>
          <p className="text-black mb-6">Please sign in to view your profile.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-black mb-8 text-center">User Profile</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-black">
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-black">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-white text-3xl font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-black">{userName || 'User'}</h2>
            <p className="text-md text-black">{userEmail}</p>
            <p className="text-sm text-gray-600 mt-1">
              Member since {currentUser.metadata.creationTime ? formatDate(currentUser.metadata.creationTime) : 'Recently'}
            </p>
          </div>

          {/* Firebase Auth Information Section */}
          <div className="mb-8 p-6 bg-gray-100 rounded-lg border border-black">
            <h3 className="text-xl font-semibold text-black mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">User ID</Label>
                <p className="text-sm text-black font-mono bg-white p-2 rounded border border-black">
                  {currentUser.uid}
                </p>
              </div>
              <div>
                <Label className="text-black font-medium">Sign-in Provider</Label>
                <p className="text-sm text-black bg-white p-2 rounded border border-black">
                  {getProviderName()}
                </p>
              </div>
              <div>
                <Label className="text-black font-medium">Email Verified</Label>
                <p className="text-sm text-black bg-white p-2 rounded border border-black">
                  {currentUser.emailVerified ? (
                    <span className="text-black font-medium">✓ Verified</span>
                  ) : (
                    <span className="text-black font-medium">✗ Not Verified</span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-black font-medium">Last Sign In</Label>
                <p className="text-sm text-black bg-white p-2 rounded border border-black">
                  {currentUser.metadata.lastSignInTime ? formatDate(currentUser.metadata.lastSignInTime) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bio Section */}
            <div>
              <Label htmlFor="userBio" className="text-lg font-semibold text-black">Bio</Label>
              {isEditing ? (
                <textarea
                  id="userBio"
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="w-full p-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px]"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                  {userBio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Other Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName" className="text-lg font-semibold text-black">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userName || 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userEmail" className="text-lg font-semibold text-black">Email</Label>
                <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="userLocation" className="text-lg font-semibold text-black">Location</Label>
                {isEditing ? (
                  <Input
                    id="userLocation"
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userLocation || 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userAge" className="text-lg font-semibold text-black">Age</Label>
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
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userAge || 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userHeight" className="text-lg font-semibold text-black">Height (cm)</Label>
                {isEditing ? (
                  <Input
                    id="userHeight"
                    type="number"
                    value={userHeight || 0}
                    onChange={(e) => setUserHeight(parseInt(e.target.value) || 0)}
                    placeholder="Enter your height in cm"
                    min="50"
                    max="300"
                  />
                ) : (
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userHeight ? `${userHeight} cm` : 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userWeight" className="text-lg font-semibold text-black">Weight (kg)</Label>
                {isEditing ? (
                  <Input
                    id="userWeight"
                    type="number"
                    value={userWeight || 0}
                    onChange={(e) => setUserWeight(parseInt(e.target.value) || 0)}
                    placeholder="Enter your weight in kg"
                    min="20"
                    max="500"
                  />
                ) : (
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userWeight ? `${userWeight} kg` : 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="userGender" className="text-lg font-semibold text-black">Gender</Label>
                {isEditing ? (
                  <select
                    id="userGender"
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="w-full p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-black mt-1 p-3 bg-gray-100 rounded-md border border-black">
                    {userGender || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Health Metrics Section */}
            {bmi && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-black">
                <h3 className="text-lg font-semibold text-black mb-2">Health Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black font-medium">BMI</Label>
                    <p className="text-2xl font-bold text-black">{bmi}</p>
                    <p className="text-sm text-gray-600">{bmiCategory}</p>
                  </div>
                  <div>
                    <Label className="text-black font-medium">BMI Range</Label>
                    <p className="text-sm text-black">
                      Underweight: &lt; 18.5<br/>
                      Normal: 18.5 - 24.9<br/>
                      Overweight: 25 - 29.9<br/>
                      Obese: ≥ 30
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <Button onClick={handleSignOut} className="bg-black hover:bg-gray-800">
              Sign Out
            </Button>
            
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700">
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
    </div>
  );
}

export default ProfilePage;
