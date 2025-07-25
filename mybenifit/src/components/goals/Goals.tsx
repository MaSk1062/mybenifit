import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { goalService, firestoreUtils } from '../../services/firestore';
import type { Goal } from '../../types/firestore';

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

// --- End shadcn/ui Component Definitions ---

function Goals() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [goalType, setGoalType] = useState<'steps' | 'calories' | 'weight' | 'distance'>('steps');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterAchieved, setFilterAchieved] = useState<boolean | undefined>(undefined);

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

  // Load user goals on component mount and set up real-time listener
  useEffect(() => {
    if (currentUser) {
      loadUserGoals();
      
      // Set up real-time listener for goal updates
      const unsubscribe = goalService.subscribeToUserGoals(currentUser.uid, (updatedGoals) => {
        setGoals(updatedGoals);
      });

      return () => unsubscribe();
    } else {
      // Clear goals when user is not authenticated
      setGoals([]);
    }
  }, [currentUser, filterAchieved]);

  const loadUserGoals = async () => {
    if (!currentUser) {
      setError('User not authenticated. Please sign in to view your goals.');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      setMessage(''); // Clear any previous messages
      
      console.log('Loading goals for user:', currentUser.uid);
      const userGoals = await goalService.getGoalsByUser(currentUser.uid, filterAchieved);
      
      console.log('Loaded goals:', userGoals);
      setGoals(userGoals);
      
      if (userGoals.length === 0) {
        setMessage('No goals found. Create your first goal to get started!');
      } else {
        setMessage(`Successfully loaded ${userGoals.length} goal${userGoals.length === 1 ? '' : 's'}`);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          setError('Permission denied. Please check your authentication status.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Failed to load goals: ${error.message}`);
        }
      } else {
        setError('Failed to load goals. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentUser) {
      setError('Please sign in to create goals');
      return;
    }

    if (!target || !current || !targetDate) {
      setError('Please fill in all required fields');
      return;
    }

    const targetValue = parseFloat(target);
    const currentValue = parseFloat(current);

    if (isNaN(targetValue) || isNaN(currentValue) || targetValue <= 0) {
      setError('Please provide valid numbers');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const goalData: Omit<Goal, 'id'> = {
        userId: currentUser.uid,
        type: goalType,
        target: targetValue,
        current: currentValue,
        startDate: firestoreUtils.now(),
        targetDate: firestoreUtils.toTimestamp(new Date(targetDate)),
        achieved: currentValue >= targetValue
      };

      await goalService.createGoal(goalData);
      setMessage('Goal created successfully!');

      // Reset form
      setGoalType('steps');
      setTarget('');
      setCurrent('');
      setTargetDate('');

    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalType(goal.type);
    setTarget(goal.target.toString());
    setCurrent(goal.current.toString());
    setTargetDate(new Date(goal.targetDate.toDate()).toISOString().split('T')[0]);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentUser || !editingGoal) {
      setError('Please sign in to update goals');
      return;
    }

    if (!target || !current || !targetDate) {
      setError('Please fill in all required fields');
      return;
    }

    const targetValue = parseFloat(target);
    const currentValue = parseFloat(current);

    if (isNaN(targetValue) || isNaN(currentValue) || targetValue <= 0) {
      setError('Please provide valid numbers');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedGoal: Partial<Goal> = {
        type: goalType,
        target: targetValue,
        current: currentValue,
        targetDate: firestoreUtils.toTimestamp(new Date(targetDate)),
        achieved: currentValue >= targetValue
      };

      await goalService.updateGoal(editingGoal.id!, updatedGoal);
      setMessage('Goal updated successfully!');

      // Reset form
      setGoalType('steps');
      setTarget('');
      setCurrent('');
      setTargetDate('');
      setEditingGoal(null);

    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setGoalType('steps');
    setTarget('');
    setCurrent('');
    setTargetDate('');
    setError('');
    setMessage('');
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    
    try {
      await goalService.deleteGoal(goalId);
      setMessage('Goal deleted successfully!');
      // If the deleted goal was being edited, clear the edit state
      if (editingGoal && editingGoal.id === goalId) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleExportGoals = () => {
    if (goals.length === 0) {
      setError('No goals to export');
      return;
    }

    try {
      const exportData = {
        userId: currentUser?.uid,
        exportDate: new Date().toISOString(),
        totalGoals: goals.length,
        goals: goals.map(goal => ({
          ...goal,
          startDate: goal.startDate.toDate().toISOString(),
          targetDate: goal.targetDate.toDate().toISOString()
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goals-${currentUser?.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('Goal data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting goals:', error);
      setError('Failed to export goal data');
    }
  };

  // Calculate goal progress percentage
  const calculateProgress = (goal: Goal) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  // Get goal status
  const getGoalStatus = (goal: Goal) => {
    if (goal.achieved) return 'achieved';
    const targetDate = goal.targetDate.toDate();
    const today = new Date();
    if (targetDate < today) return 'overdue';
    return 'in-progress';
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
              <p className="text-black">Please sign in to view and manage your goals.</p>
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-black mt-8 text-center">
        <h1 className="text-3xl font-extrabold text-black mb-4">MyBenYfit</h1>
        <p className="text-lg text-black mb-2">Set Your Fitness Goals</p>
        <p className="text-sm text-gray-600 mb-6">Track your progress and achieve your targets!</p>
      </div>
      
      {/* User Information */}
      <div className="w-full max-w-2xl mx-auto mb-6 p-4 bg-gray-100 rounded-lg">
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

      <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-black">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadUserGoals}
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

            <form onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal} className="space-y-4">
              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  id="goalType"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  required
                >
                  <option value="steps">Daily Steps</option>
                  <option value="calories">Calories Burned</option>
                  <option value="weight">Weight Loss</option>
                  <option value="distance">Distance</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="target">Target Value</Label>
                <Input
                  type="number"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Enter your target value"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="current">Current Value</Label>
                <Input
                  type="number"
                  id="current"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter your current value"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  type="date"
                  id="targetDate"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-black hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (editingGoal ? 'Updating...' : 'Creating...') : (editingGoal ? 'Update Goal' : 'Create Goal')}
                </Button>
                
                {editingGoal && (
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
      </div>

      {/* Goals Display Section */}
      <div className="w-full max-w-2xl mx-auto mt-8">
        {/* Goal Statistics */}
        {goals.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-black">Goal Summary</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportGoals}
                className="text-black border-black hover:bg-gray-200"
              >
                Export Data
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{goals.length}</div>
                <div className="text-black">Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {goals.filter(g => g.achieved).length}
                </div>
                <div className="text-black">Achieved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {goals.filter(g => !g.achieved && g.targetDate.toDate() > new Date()).length}
                </div>
                <div className="text-black">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {goals.filter(g => !g.achieved && g.targetDate.toDate() < new Date()).length}
                </div>
                <div className="text-black">Overdue</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={filterAchieved === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAchieved(undefined)}
          >
            All Goals
          </Button>
          <Button
            type="button"
            variant={filterAchieved === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAchieved(false)}
          >
            Active Goals
          </Button>
          <Button
            type="button"
            variant={filterAchieved === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAchieved(true)}
          >
            Achieved Goals
          </Button>
        </div>

        <h3 className="text-xl font-bold text-black mb-4 text-center">Your Goals</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-black" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="text-black">Loading your goals...</span>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start your fitness journey by setting your first goal!</p>
            <Button 
              onClick={() => document.getElementById('goalType')?.focus()}
              className="bg-black hover:bg-gray-800"
            >
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);
              const status = getGoalStatus(goal);
              
              return (
                <Card key={goal.id} className="bg-white p-4 shadow-sm border border-black">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-semibold text-black capitalize">
                          {goal.type} Goal
                        </CardTitle>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status === 'achieved' ? 'bg-gray-200 text-black' :
                          status === 'overdue' ? 'bg-gray-300 text-black' :
                          'bg-gray-100 text-black'
                        }`}>
                          {status === 'achieved' ? 'Achieved' :
                           status === 'overdue' ? 'Overdue' : 'In Progress'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Target</p>
                          <p className="font-semibold text-black">{goal.target}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current</p>
                          <p className="font-semibold text-black">{goal.current}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Progress</p>
                          <p className="font-semibold text-black">{progress.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target Date</p>
                          <p className="font-semibold text-black">
                            {goal.targetDate.toDate().toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-black' :
                            progress >= 75 ? 'bg-gray-600' :
                            progress >= 50 ? 'bg-gray-400' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>

                      <div className="text-xs text-gray-600">
                        Started: {goal.startDate.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => goal.id && handleDeleteGoal(goal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals; 