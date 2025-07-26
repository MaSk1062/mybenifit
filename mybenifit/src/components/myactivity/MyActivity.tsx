import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { extendedActivityService, firestoreUtils } from '../../services/firestore';
import type { ExtendedActivity } from '../../types/firestore';
import NavBar from '../nav/nav';

// --- shadcn/ui Component Definitions (Minimal for Self-Containment) ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant || 'default']} ${sizeClasses[size || 'default']} ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
    {...props}
  />
));
Label.displayName = "Label";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return (
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border bg-card text-card-foreground shadow ${className || ''}`}
    {...props}
  />
));
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props} />
));
CardContent.displayName = "CardContent";

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className || ''}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// --- End shadcn/ui Component Definitions ---

/**
 * ActivityLogger Component
 * Allows users to log fitness activities and view their past logs.
 * Data is stored in Firebase Firestore and persists across sessions.
 */
function ActivityLogger() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [activityType, setActivityType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingActivity, setEditingActivity] = useState<ExtendedActivity | null>(null);
  const [filterActivityType, setFilterActivityType] = useState<string>('all');

  // Listen for auth state changes and update currentUser state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? `User ${user.uid} signed in` : 'User signed out');
      setCurrentUser(user);
      
      if (user) {
        console.log('User details:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user activities on component mount and set up real-time listener
  // This useEffect ensures activities are always up-to-date and specific to the current user.
  useEffect(() => {
    let unsubscribeFromFirestore: () => void;

    if (currentUser) {
      loadUserActivities(); // Initial load

      // Set up real-time listener for activity updates
      // This listener will automatically update 'activities' state whenever data changes in Firestore
      unsubscribeFromFirestore = extendedActivityService.subscribeToUserExtendedActivities(currentUser.uid, (updatedActivities) => {
        setActivities(updatedActivities);
        // Clear initial loading message if real-time data comes in quickly
        if (message.includes('No activities found') || message.includes('Successfully loaded')) {
          setMessage(''); 
        }
      });
    } else {
      // Clear activities when user is not authenticated
      setActivities([]);
      setMessage('');
      setError('');
    }

    // Cleanup function: unsubscribe from real-time updates when component unmounts or currentUser changes
    return () => {
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, [currentUser]); // Re-run this effect when currentUser changes

  const loadUserActivities = async () => {
    if (!currentUser) {
      setError('User not authenticated. Please sign in to view your activities.');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      setMessage(''); // Clear any previous messages
      
      console.log('Loading activities for user:', currentUser.uid);
      const userActivities = await extendedActivityService.getExtendedActivitiesByUser(currentUser.uid);
      
      console.log('Loaded activities:', userActivities);
      setActivities(userActivities); // Update state with fetched data
      
      if (userActivities.length === 0) {
        setMessage('No activities found. Log your first activity to get started!');
      } else {
        setMessage(`Successfully loaded ${userActivities.length} activit${userActivities.length === 1 ? 'y' : 'ies'}`);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      
      // Handle specific error types for better user feedback
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          setError('Permission denied. Please check your authentication status and Firestore security rules.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Failed to load activities: ${error.message}`);
        }
      } else {
        setError('Failed to load activities. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentUser) {
      setError('Please sign in to log activities');
      return;
    }

    // Input validation
    if (!activityType.trim()) {
      setError("Please select an activity type.");
      return;
    }
    if (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      setError("Please provide a valid, positive duration in minutes.");
      return;
    }

    // Validate date
    const selectedDate = new Date(activityDate);
    const today = new Date();
    // Normalize today to the end of the day for comparison
    today.setHours(23, 59, 59, 999); 
    if (selectedDate > today) {
      setError("Activity date cannot be in the future.");
      return;
    }

    // Prepare activity data - Start with required fields
    const activityData: Omit<ExtendedActivity, 'id' | 'timestamp'> = {
      userId: currentUser.uid,
      activityType,
      duration: parseFloat(duration),
      date: firestoreUtils.toTimestamp(new Date(activityDate)) // Convert string date to Firestore Timestamp
    };

    // Conditionally add optional fields only if they have a non-empty string value
    if (distance.trim() !== '') {
      activityData.distance = parseFloat(distance);
    }
    
    if (caloriesBurned.trim() !== '') {
      activityData.caloriesBurned = parseFloat(caloriesBurned);
    }

    if (notes.trim() !== '') {
        activityData.notes = notes;
    }

    try {
      setIsSubmitting(true);
      
      if (editingActivity) {
        // Update existing activity
        if (!editingActivity.id) {
          setError("Cannot update activity: ID is missing.");
          return;
        }
        await extendedActivityService.updateExtendedActivity(editingActivity.id, activityData);
        setMessage("Activity updated successfully!");
      } else {
        // Create new activity
        await extendedActivityService.createExtendedActivity(activityData);
        setMessage("Activity logged successfully!");
      }

      // Reset form after successful operation
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error logging activity:', error);
      setError('Failed to log activity. Please try again. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditActivity = (activity: ExtendedActivity) => {
    setEditingActivity(activity);
    setActivityType(activity.activityType);
    setDuration(activity.duration.toString());
    setDistance(activity.distance?.toString() || '');
    setCaloriesBurned(activity.caloriesBurned?.toString() || '');
    setNotes(activity.notes || '');
    // Ensure date is correctly converted to YYYY-MM-DD string
    // Add check for null/undefined activity.date before calling toDate()
    setActivityDate(
      activity.date 
        ? (activity.date instanceof Date 
            ? activity.date.toISOString().split('T')[0]
            : activity.date.toDate().toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0] // Fallback to current date if date is null/undefined
    );
    
    // Scroll to form for easier editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }
    
    try {
      await extendedActivityService.deleteExtendedActivity(activityId);
      setMessage('Activity deleted successfully!');
      
      // If the deleted activity was being edited, clear the edit state
      if (editingActivity && editingActivity.id === activityId) {
        handleCancelEdit();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. ' + (error instanceof Error ? error.message : ''));
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
      // No need to clear states here, auth.onAuthStateChanged will handle it
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleExportActivities = () => {
    if (activities.length === 0) {
      setError('No activities to export.');
      return;
    }

    try {
      const exportData = {
        userId: currentUser?.uid,
        exportDate: new Date().toISOString(),
        totalActivities: activities.length,
        activities: activities.map(activity => ({
          ...activity,
          // Convert Firestore Timestamp objects to ISO date strings for export
          // Add null/undefined checks for activity.date and activity.timestamp
          date: activity.date 
            ? (activity.date instanceof Date 
                ? activity.date.toISOString()
                : activity.date.toDate().toISOString())
            : null, // or a default value, e.g., ''
          timestamp: activity.timestamp 
            ? (activity.timestamp instanceof Date 
                ? activity.timestamp.toISOString()
                : activity.timestamp.toDate().toISOString())
            : null // or a default value, e.g., ''
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-${currentUser?.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the URL object

      setMessage('Activity data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting activities:', error);
      setError('Failed to export activity data. ' + (error instanceof Error ? error.message : ''));
    }
  };
  
  // Reset form helper
  const resetForm = () => {
    setActivityType('Running'); // Default to a common type
    setDuration('');
    setDistance('');
    setCaloriesBurned('');
    setNotes('');
    setActivityDate(new Date().toISOString().split('T')[0]); // Current date
    setEditingActivity(null); // Clear editing state
    setError(''); // Clear errors
    // Do not clear 'message' here, let the setTimeout handle it
  };

  // Calculate total stats
  const getTotalStats = () => {
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
    const totalCalories = activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
    
    return { 
      totalDuration: parseFloat(totalDuration.toFixed(1)), // Keep one decimal for duration
      totalDistance: parseFloat(totalDistance.toFixed(2)), // Keep two decimals for distance
      totalCalories: Math.round(totalCalories) // Round calories to nearest whole number
    };
  };

  // Filter activities by type
  const filteredActivities = filterActivityType === 'all' 
    ? activities 
    : activities.filter(activity => activity.activityType === filterActivityType);

  // Get unique activity types for filter dropdown/buttons
  // Sort them alphabetically for better UX
  const activityTypes = ['all', ...Array.from(new Set(activities.map(a => a.activityType))).sort()];

  const stats = getTotalStats();

  // --- Render based on authentication status ---
  if (!currentUser) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-black">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-black">Please sign in to log and view your activities.</p>
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/signin'} // Redirect to your sign-in page
                >
                  Go to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto mt-8">
      {/* User Information */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black">
              Hello!, {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}!
            </h3>
            <p className="text-sm text-gray-600">
              User ID: {currentUser.uid}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {currentUser.email}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Last sign in: {currentUser.metadata.lastSignInTime ? 
                new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
            </p>
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-black border-black hover:bg-gray-200"
            >
              Sign Out
            </Button> */}
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      {activities.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-black">Activity Summary</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportActivities}
              className="text-black border-black hover:bg-gray-200"
            >
              Export Data
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{activities.length}</div>
              <div className="text-black">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{stats.totalDuration}</div>
              <div className="text-black">Total Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{stats.totalDistance.toFixed(1)}</div>
              <div className="text-black">Total Distance (km)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{stats.totalCalories}</div>
              <div className="text-black">Total Calories</div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-black">
              {editingActivity ? 'Edit Activity' : 'Log Your Activity'}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadUserActivities}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

          <form onSubmit={handleLogActivity} className="space-y-4">
            <div>
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                id="activityType"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                required
              >
                {/* You can populate these options dynamically from a constant or database if preferred */}
                <option value="Running">Running</option>
                <option value="Strength Training">Strength Training</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Yoga">Yoga</option>
                <option value="Walking">Walking</option>
                <option value="Hiking">Hiking</option>
                <option value="Basketball">Basketball</option>
                <option value="Soccer">Soccer</option>
                <option value="Tennis">Tennis</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 30"
                min="1"
                max="1440" // Max 24 hours
                required
              />
            </div>

            <div>
              <Label htmlFor="distance">Distance (km, optional)</Label>
              <Input
                type="number"
                id="distance"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g., 5.2"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="caloriesBurned">Estimated Calories Burned (optional)</Label>
              <Input
                type="number"
                id="caloriesBurned"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                placeholder="e.g., 300"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Felt great today! Focused on upper body."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
            </div>

            <div>
              <Label htmlFor="activityDate">Date</Label>
              <Input
                type="date"
                id="activityDate"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Prevents future dates
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (editingActivity ? 'Updating...' : 'Logging Activity...') : (editingActivity ? 'Update Activity' : 'Log Activity')}
              </Button>
              {editingActivity && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activities Display Section */}
      <div className="mt-8">
        {/* Filter Controls */}
        {activities.length > 0 && (
          <div className="mb-4">
            <Label className="block mb-2">Filter by Activity Type</Label>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={filterActivityType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActivityType(type)}
                >
                  {type === 'all' ? 'All Activities' : type}
                </Button>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-black mb-4 text-center">Your Activities</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="text-black">Loading your activities...</span>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-4">Start your fitness journey by logging your first activity!</p>
            <Button 
              onClick={() => document.getElementById('activityType')?.focus()}
              className="bg-black text-white hover:bg-gray-800"
            >
              Log Your First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="bg-white p-4 shadow-sm border border-black">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold text-black">
                        {activity.activityType}
                      </CardTitle>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-black">
                        {/* Render date based on type, assuming Timestamp or Date object */}
                        {activity.date 
                          ? (activity.date instanceof Date 
                              ? activity.date.toLocaleDateString()
                              : activity.date.toDate().toLocaleDateString())
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold text-black">{activity.duration} min</p>
                      </div>
                      {activity.distance !== undefined && activity.distance !== null && (
                        <div>
                          <p className="text-gray-600">Distance</p>
                          <p className="font-semibold text-black">{activity.distance.toFixed(2)} km</p>
                        </div>
                      )}
                      {activity.caloriesBurned !== undefined && activity.caloriesBurned !== null && (
                        <div>
                          <p className="text-gray-600">Calories</p>
                          <p className="font-semibold text-black">{activity.caloriesBurned}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Logged</p>
                        <p className="font-semibold text-black">
                          {/* Render timestamp based on type, assuming Timestamp or Date object */}
                          {activity.timestamp 
                            ? (activity.timestamp instanceof Date 
                                ? activity.timestamp.toLocaleDateString()
                                : activity.timestamp.toDate().toLocaleDateString())
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {activity.notes && (
                      <div className="bg-gray-100 p-3 rounded border-l-4 border-black mb-3">
                        <p className="text-sm text-black italic">"{activity.notes}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditActivity(activity)}
                    >
                      Edit
                    </Button>
                    <Button
                      // Modified: Changed variant to 'default' and applied custom classes for black background and white text
                      variant="default"
                      size="sm"
                      onClick={() => activity.id && handleDeleteActivity(activity.id)}
                      className="bg-black text-white hover:bg-gray-800" 
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal App component to render the ActivityLogger
function MyActivity() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-start p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-black mt-8 text-center">
          <p className="text-lg text-black mb-2">Log your activities here!</p>
          <p className="text-sm text-gray-600 mb-6">Your data is securely stored in the cloud.</p>
        </div>
        <ActivityLogger />
      </div>
    </div>
  );
}

export default MyActivity;