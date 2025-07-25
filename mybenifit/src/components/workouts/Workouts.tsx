import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { workoutService, firestoreUtils } from '../../services/firestore';
import type { Workout, Exercise } from '../../types/firestore';

// Reuse the UI components from MyActivity
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

// Exercise categories and templates
const EXERCISE_CATEGORIES = {
  'Strength Training': [
    'Bench Press', 'Squats', 'Deadlifts', 'Overhead Press', 'Barbell Rows',
    'Pull-ups', 'Push-ups', 'Dumbbell Curls', 'Tricep Dips', 'Lunges'
  ],
  'Cardio': [
    'Running', 'Cycling', 'Swimming', 'Rowing', 'Elliptical',
    'Jump Rope', 'Stair Climbing', 'Walking', 'HIIT', 'Circuit Training'
  ],
  'Flexibility': [
    'Yoga', 'Stretching', 'Pilates', 'Tai Chi', 'Mobility Work'
  ],
  'Sports': [
    'Basketball', 'Soccer', 'Tennis', 'Volleyball', 'Badminton'
  ]
};

const WORKOUT_TEMPLATES: Record<string, Partial<Exercise>[]> = {
  'Upper Body Strength': [
    { name: 'Bench Press', sets: 3, reps: 8, weight: 0 },
    { name: 'Pull-ups', sets: 3, reps: 10, weight: 0 },
    { name: 'Overhead Press', sets: 3, reps: 8, weight: 0 },
    { name: 'Barbell Rows', sets: 3, reps: 10, weight: 0 }
  ],
  'Lower Body Strength': [
    { name: 'Squats', sets: 4, reps: 8, weight: 0 },
    { name: 'Deadlifts', sets: 3, reps: 6, weight: 0 },
    { name: 'Lunges', sets: 3, reps: 12, weight: 0 },
    { name: 'Calf Raises', sets: 3, reps: 15, weight: 0 }
  ],
  'Cardio Session': [
    { name: 'Running', duration: 1800, distance: 5 }, // 30 minutes, 5km
    { name: 'Cycling', duration: 1200, distance: 10 } // 20 minutes, 10km
  ],
  'Full Body': [
    { name: 'Squats', sets: 3, reps: 10, weight: 0 },
    { name: 'Push-ups', sets: 3, reps: 15, weight: 0 },
    { name: 'Planks', duration: 300 }, // 5 minutes
    { name: 'Burpees', sets: 3, reps: 10, weight: 0 }
  ]
};

// Helper function to determine if an exercise is distance-based
const isExerciseDistanceBased = (name: string) => {
  const lowerCaseName = name.toLowerCase();
  // Check if it's explicitly in the 'Cardio' category list
  return EXERCISE_CATEGORIES['Cardio'].some(ex => ex.toLowerCase() === lowerCaseName);
};

function Workouts() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Exercise form state
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [durationSec, setDurationSec] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // This state is currently unused, can be removed if not needed

  // Template and UI state
  const [showTemplates, setShowTemplates] = useState(false); // This state is currently unused for toggling templates, but the templates are rendered directly. Can be removed if not used for explicit toggle button.
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // New state for conditional distance field visibility
  const [showDistanceInput, setShowDistanceInput] = useState(false);

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

  // Close exercise suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Only close if the click is outside the input and the suggestions container
      if (!target.closest('.exercise-suggestions-container')) {
        setShowExerciseSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load user workouts on component mount and set up real-time listener
  useEffect(() => {
    if (currentUser) {
      loadUserWorkouts();
      
      // Set up real-time listener for workout updates
      const unsubscribe = workoutService.subscribeToUserWorkouts(currentUser.uid, (updatedWorkouts) => {
        setWorkouts(updatedWorkouts);
      });

      return () => unsubscribe();
    } else {
      // Clear workouts when user is not authenticated
      setWorkouts([]);
    }
  }, [currentUser]);

  const loadUserWorkouts = async () => {
    if (!currentUser) {
      setError('User not authenticated. Please sign in to view your workouts.');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      setMessage(''); // Clear any previous messages
      
      console.log('Loading workouts for user:', currentUser.uid);
      const userWorkouts = await workoutService.getWorkoutsByUser(currentUser.uid);
      
      console.log('Loaded workouts:', userWorkouts);
      setWorkouts(userWorkouts);
      
      if (userWorkouts.length === 0) {
        setMessage('No workouts found. Create your first workout to get started!');
      } else {
        setMessage(`Successfully loaded ${userWorkouts.length} workout${userWorkouts.length === 1 ? '' : 's'}`);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          setError('Permission denied. Please check your authentication status.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Failed to load workouts: ${error.message}`);
        }
      } else {
        setError('Failed to load workouts. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setExerciseName(name);
    setShowDistanceInput(isExerciseDistanceBased(name)); // Update visibility based on typed name
    setShowExerciseSuggestions(true); // Always show suggestions when typing
  };

  const handleAddExercise = () => {
    setError(''); // Clear previous errors

    if (!exerciseName.trim()) {
      setError('Please enter an exercise name');
      return;
    }

    // Parse values, default to null or omit if not valid/provided
    const parsedSets = sets ? parseInt(sets) : null;
    const parsedReps = reps ? parseInt(reps) : null;
    const parsedWeight = weight ? parseFloat(weight) : null;
    const parsedDurationSec = durationSec ? parseInt(durationSec) : null;
    const parsedDistance = distance ? parseFloat(distance) : null;

    // Validate that at least one metric is provided and valid
    const hasValidSets = parsedSets !== null && parsedSets > 0;
    const hasValidReps = parsedReps !== null && parsedReps > 0;
    const hasValidWeight = parsedWeight !== null && parsedWeight > 0;
    const hasValidDuration = parsedDurationSec !== null && parsedDurationSec > 0;
    const hasValidDistance = parsedDistance !== null && parsedDistance > 0;

    if (showDistanceInput) { // If it's a distance-based exercise
        if (!hasValidDistance && !hasValidDuration) {
            setError('For this exercise type, please provide duration or distance.');
            return;
        }
    } else { // If it's not a distance-based exercise
        if (!hasValidSets && !hasValidReps && !hasValidWeight && !hasValidDuration) {
            setError('Please provide at least one metric (sets/reps, weight, or duration) for this exercise.');
            return;
        }
    }
    
    // Fallback for any unhandled case or general validation
    if (!hasValidSets && !hasValidReps && !hasValidWeight && !hasValidDuration && !hasValidDistance) {
      setError('Please provide at least one metric (sets/reps, weight, duration, or distance)');
      return;
    }

    // --- SOLUTION START: Construct the Exercise object without 'undefined' values ---
    const newExercise: Exercise = {
      name: exerciseName.trim(),
    };

    if (hasValidSets) {
        newExercise.sets = parsedSets;
    }
    if (hasValidReps) {
        newExercise.reps = parsedReps;
    }
    if (hasValidWeight) {
        newExercise.weight = parsedWeight;
    }
    if (hasValidDuration) {
        newExercise.duration = parsedDurationSec;
    }
    if (hasValidDistance) {
        newExercise.distance = parsedDistance;
    }
    // --- SOLUTION END ---

    setExercises([...exercises, newExercise]);

    // Reset exercise form and hide distance input
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
    setDurationSec('');
    setDistance('');
    setSelectedCategory('');
    setError(''); // Clear error after successful add
    setShowDistanceInput(false); // Reset visibility after adding
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleLoadTemplate = (templateName: string) => {
    const template = WORKOUT_TEMPLATES[templateName];
    if (template) {
      setWorkoutName(templateName);
      setExercises(template.map(ex => {
        const tempExercise: Exercise = { name: ex.name! };
        if (ex.sets !== undefined && ex.sets !== null && ex.sets > 0) tempExercise.sets = ex.sets;
        if (ex.reps !== undefined && ex.reps !== null && ex.reps > 0) tempExercise.reps = ex.reps;
        if (ex.weight !== undefined && ex.weight !== null && ex.weight > 0) tempExercise.weight = ex.weight;
        if (ex.duration !== undefined && ex.duration !== null && ex.duration > 0) tempExercise.duration = ex.duration;
        if (ex.distance !== undefined && ex.distance !== null && ex.distance > 0) tempExercise.distance = ex.distance;
        return tempExercise;
      }));
      setShowTemplates(false); // This state still unused for toggle, but setting it here.
      setMessage(`Loaded ${templateName} template!`);
      
      // Reset exercise input form and hide distance input when loading template
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      setDurationSec('');
      setDistance('');
      setShowDistanceInput(false);
    }
  };

  const handleExerciseSuggestion = (suggestedExerciseName: string) => {
    setExerciseName(suggestedExerciseName);
    setShowExerciseSuggestions(false); // Hide suggestions after selection

    // Set distance input visibility based on the selected suggestion
    const isDistanceBased = isExerciseDistanceBased(suggestedExerciseName);
    setShowDistanceInput(isDistanceBased);

    // Clear other fields that might not be relevant for this exercise type
    if (isDistanceBased) {
      setSets('');
      setReps('');
      setWeight('');
      // Keep durationSec as cardio can have duration too
    } else {
      setDistance(''); // Clear distance if not relevant
      // Do not clear sets/reps/weight/durationSec here, as they might be relevant for strength/flexibility
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutName(workout.name);
    setDuration(workout.duration.toString());
    setWorkoutDate(new Date(workout.date.toDate()).toISOString().split('T')[0]);
    // Ensure exercises loaded for editing also don't have explicit undefined, though Firebase usually handles this on read
    setExercises(workout.exercises.map(ex => {
        const editedEx: Exercise = { name: ex.name };
        if (ex.sets !== undefined && ex.sets !== null) editedEx.sets = ex.sets;
        if (ex.reps !== undefined && ex.reps !== null) editedEx.reps = ex.reps;
        if (ex.weight !== undefined && ex.weight !== null) editedEx.weight = ex.weight;
        if (ex.duration !== undefined && ex.duration !== null) editedEx.duration = ex.duration;
        if (ex.distance !== undefined && ex.distance !== null) editedEx.distance = ex.distance;
        return editedEx;
    }));
    
    // When editing, clear the individual exercise input form
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
    setDurationSec('');
    setDistance('');
    setShowDistanceInput(false); // Hide distance input for new exercise entry until typed/selected
  };

  const handleUpdateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentUser || !editingWorkout) {
      setError('Please sign in to update workouts');
      return;
    }

    if (!workoutName.trim() || !duration || exercises.length === 0) {
      setError('Please provide a workout name, duration, and at least one exercise');
      return;
    }

    const durationValue = parseFloat(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      setError('Please provide a valid duration');
      return;
    }

    try {
      setLoading(true);

      // The exercises array already contains properly formatted Exercise objects
      // because handleAddExercise ensures no 'undefined' values are stored there.
      const updatedWorkout: Partial<Workout> = {
        name: workoutName.trim(),
        date: firestoreUtils.toTimestamp(new Date(workoutDate)),
        duration: durationValue,
        exercises: exercises // This array should now be safe
      };

      await workoutService.updateWorkout(editingWorkout.id!, updatedWorkout);
      setMessage('Workout updated successfully!');

      // Reset form
      setWorkoutName('');
      setDuration('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setEditingWorkout(null);
      setShowDistanceInput(false); // Reset visibility

      // Reload workouts
      await loadUserWorkouts();
    } catch (error) {
      console.error('Error updating workout:', error);
      setError('Failed to update workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setWorkoutName('');
    setDuration('');
    setWorkoutDate(new Date().toISOString().split('T')[0]);
    setExercises([]);
    setError('');
    setMessage('');
    setShowDistanceInput(false); // Reset visibility
  };

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentUser) {
      setError('Please sign in to create workouts');
      return;
    }

    if (!workoutName.trim() || !duration || exercises.length === 0) {
      setError('Please provide a workout name, duration, and at least one exercise');
      return;
    }

    const durationValue = parseFloat(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      setError('Please provide a valid duration');
      return;
    }

    try {
      setLoading(true);

      // The exercises array already contains properly formatted Exercise objects
      // because handleAddExercise ensures no 'undefined' values are stored there.
      const newWorkout: Omit<Workout, 'id'> = {
        userId: currentUser.uid,
        name: workoutName.trim(),
        date: firestoreUtils.toTimestamp(new Date(workoutDate)),
        duration: durationValue,
        exercises: exercises // This array should now be safe
      };

      await workoutService.createWorkout(newWorkout);
      setMessage('Workout created successfully!');

      // Reset form
      setWorkoutName('');
      setDuration('');
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      setShowDistanceInput(false); // Reset visibility

      // Reload workouts
      await loadUserWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
      setError('Failed to create workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!currentUser) return;

    try {
      await workoutService.deleteWorkout(workoutId);
      setMessage('Workout deleted successfully!');
      await loadUserWorkouts();
      // If the deleted workout was being edited, clear the edit state
      if (editingWorkout && editingWorkout.id === workoutId) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError('Failed to delete workout');
    }
  };

  // Filtered exercise suggestions based on current input
  const filteredExerciseSuggestions = Object.entries(EXERCISE_CATEGORIES)
    .map(([category, exercises]) => {
      const filtered = exercises.filter(ex =>
        ex.toLowerCase().includes(exerciseName.toLowerCase())
      );
      return { category, exercises: filtered };
    })
    .filter(cat => cat.exercises.length > 0);

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  // Export workout data as JSON
  const handleExportWorkouts = () => {
    if (workouts.length === 0) {
      setError('No workouts to export.');
      return;
    }

    try {
      const exportData = {
        userId: currentUser?.uid,
        exportDate: new Date().toISOString(),
        totalWorkouts: workouts.length,
        workouts: workouts.map(workout => ({
          ...workout,
          date: workout.date.toDate().toISOString() // Convert Timestamp to ISO string
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workouts-${currentUser?.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('Workout data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting workouts:', error);
      setError('Failed to export workout data');
    }
  };


  if (!currentUser) {
    return (
              <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-black">Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-black">Please sign in to view and manage your workouts.</p>
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
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto mt-8">
      {/* User Information */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black">
              Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}!
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-black border-black hover:bg-gray-200"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-black">Your Workouts</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadUserWorkouts}
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
          {error && <p className="text-black text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-black text-sm mb-4 text-center">{message}</p>}

          <form onSubmit={editingWorkout ? handleUpdateWorkout : handleCreateWorkout} className="space-y-4">
            {/* Template Selection */}
            {!editingWorkout && (
              <div className="mb-4">
                <Label className="block mb-2">Quick Start Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(WORKOUT_TEMPLATES).map((templateName) => (
                    <Button
                      key={templateName}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(templateName)}
                      className="text-xs"
                    >
                      {templateName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="workoutName">Workout Name</Label>
              <Input
                type="text"
                id="workoutName"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Upper Body Strength"
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45"
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="workoutDate">Date</Label>
              <Input
                type="date"
                id="workoutDate"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Exercise Management */}
            <div className="border border-black rounded-lg p-4">
              <h4 className="text-lg font-semibold text-black mb-4">Exercises</h4>

              {/* Add Exercise Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative exercise-suggestions-container"> {/* Add a container for click outside logic */}
                  <Label htmlFor="exerciseName">Exercise Name</Label>
                  <Input
                    type="text"
                    id="exerciseName"
                    value={exerciseName}
                    onChange={handleExerciseNameChange} // Use the new handler
                    onFocus={() => setShowExerciseSuggestions(true)}
                    placeholder="e.g., Bench Press"
                  />

                  {/* Exercise Suggestions */}
                  {showExerciseSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-black rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredExerciseSuggestions.length > 0 ? (
                        filteredExerciseSuggestions.map(({ category, exercises }) => (
                          <div key={category}>
                            <div className="px-3 py-1 bg-gray-100 text-xs font-medium text-black">
                              {category}
                            </div>
                            {exercises.map((exercise) => (
                              <button
                                key={exercise}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-black"
                                onClick={() => handleExerciseSuggestion(exercise)}
                              >
                                {exercise}
                              </button>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-600">No suggestions found.</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    type="number"
                    id="sets"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder="e.g., 3"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    type="number"
                    id="reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="durationSec">Duration (seconds)</Label>
                  <Input
                    type="number"
                    id="durationSec"
                    value={durationSec}
                    onChange={(e) => setDurationSec(e.target.value)}
                    placeholder="e.g., 60"
                    min="1"
                  />
                </div>
                {/* Conditionally rendered Distance Input */}
                {showDistanceInput && (
                  <div>
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      type="number"
                      id="distance"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                      step="0.1"
                    />
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleAddExercise}
                className="bg-black hover:bg-gray-800"
              >
                Add Exercise
              </Button>

              {/* Exercise List */}
              {exercises.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-black mb-2">Added Exercises:</h5>
                  <div className="space-y-2">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded border border-black">
                        <div>
                          <p className="font-medium text-black">{exercise.name}</p>
                          <p className="text-sm text-gray-600">
                            {exercise.sets && `Sets: ${exercise.sets}`}
                            {exercise.reps && ` Reps: ${exercise.reps}`}
                            {exercise.weight && ` Weight: ${exercise.weight}kg`}
                            {exercise.duration && ` Duration: ${exercise.duration}s`}
                            {exercise.distance && ` Distance: ${exercise.distance}km`}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveExercise(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-black hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? (editingWorkout ? 'Updating...' : 'Creating...') : (editingWorkout ? 'Update Workout' : 'Create Workout')}
              </Button>

              {editingWorkout && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        {/* Workout Statistics */}
        {workouts.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-black">Workout Summary</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportWorkouts}
                className="text-black border-black hover:bg-gray-200"
              >
                Export Data
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{workouts.length}</div>
                <div className="text-black">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {workouts.reduce((total, workout) => total + workout.duration, 0)}
                </div>
                <div className="text-black">Total Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {workouts.reduce((total, workout) => total + workout.exercises.length, 0)}
                </div>
                <div className="text-black">Total Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {new Date(Math.max(...workouts.map(w => w.date.toDate().getTime()))).toLocaleDateString()}
                </div>
                <div className="text-black">Last Workout</div>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-black mb-4 text-center">Your Workouts</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="text-black">Loading your workouts...</span>
            </div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No workouts yet</h3>
            <p className="text-gray-600 mb-4">Start your fitness journey by creating your first workout!</p>
            <Button 
              onClick={() => document.getElementById('workoutName')?.focus()}
              className="bg-black hover:bg-gray-800"
            >
              Create Your First Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <Card key={workout.id} className="bg-white p-4 shadow-sm border border-black">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-black">
                      {workout.name} - {new Date(workout.date.toDate()).toLocaleDateString()}
                    </CardTitle>
                    <CardContent className="p-0 pt-2">
                      <p className="text-black">Duration: {workout.duration} minutes</p>
                      <p className="text-black">Exercises: {workout.exercises.length}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-black">Exercise Details:</p>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {workout.exercises.map((exercise, index) => (
                            <li key={index} className="ml-4">
                              • {exercise.name}
                              {exercise.sets && ` - ${exercise.sets} sets`}
                              {exercise.reps && ` x ${exercise.reps} reps`}
                              {exercise.weight && ` @ ${exercise.weight}kg`}
                              {exercise.duration && ` (${exercise.duration}s)`}
                              {exercise.distance && ` (${exercise.distance}km)`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkout(workout)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => workout.id && handleDeleteWorkout(workout.id)}
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

export default Workouts;