import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { 
  dashboardService, 
  goalService, 
  extendedActivityService,
  firestoreUtils 
} from '../../services/firestore';
import type { Goal, ExtendedActivity } from '../../types/firestore';

// Helper components for Shadcn-like styling
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border border-black ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', type = 'button' }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ type = 'text', placeholder = '', value, onChange, className = '', id }: { type?: string; placeholder?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string; id?: string }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
  />
);

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-black mb-1 ${className}`}>
    {children}
  </label>
);

const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-black h-2.5 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

function Dashboard() {
  // Initialize currentUser as null initially, and let useEffect update it
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Real data from Firebase
  const [metrics, setMetrics] = useState({
    steps: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    distance: 0,
    dailyStepsTarget: 10000,
  });
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);

  // State for new activity form
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState('');
  const [newActivityDistance, setNewActivityDistance] = useState('');
  const [newActivityCalories, setNewActivityCalories] = useState('');
  const [newActivityDate, setNewActivityDate] = useState('');

  // State for new goal form
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('');
  const [newGoalCurrentValue, setNewGoalCurrentValue] = useState(0);

  // State for daily steps target input
  const [newDailyStepsTarget, setNewDailyStepsTarget] = useState(metrics.dailyStepsTarget);

  // State for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user data when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const loadUserData = async () => {
      try {
        setDataLoading(true);
        const userId = currentUser.uid;
        
        // Load dashboard data
        const dashboardData = await dashboardService.getDashboardData(userId);
        
        // Set today's metrics
        if (dashboardData.todayMetrics) {
          setMetrics({
            steps: dashboardData.todayMetrics.steps || 0,
            caloriesBurned: dashboardData.todayMetrics.caloriesBurned || 0,
            activeMinutes: dashboardData.todayMetrics.activeMinutes || 0,
            distance: dashboardData.todayMetrics.distance || 0,
            dailyStepsTarget: dashboardData.userSettings?.dailyStepsTarget || 10000,
          });
        } else {
          // Create default metrics for today if none exist
          const today = new Date().toISOString().split('T')[0];
          await dashboardService.createDailyMetrics({
            userId,
            date: today,
            steps: 0,
            caloriesBurned: 0,
            activeMinutes: 0,
            distance: 0,
          });
        }

        // Set user settings
        if (dashboardData.userSettings) {
          setUserSettings(dashboardData.userSettings);
          setNewDailyStepsTarget(dashboardData.userSettings.dailyStepsTarget || 10000);
        } else {
          // Create default settings if none exist
          await dashboardService.createUserSettings({
            userId,
            dailyStepsTarget: 10000,
            theme: 'dark',
            notifications: true,
          });
        }

        // Set activities and goals
        setActivities(dashboardData.recentActivities);
        setGoals(dashboardData.userGoals);
        setWeeklyData(dashboardData.weeklyData);
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Set up real-time listeners
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.uid;
    const today = new Date().toISOString().split('T')[0];

    // Listen to daily metrics changes
    const unsubscribeMetrics = dashboardService.subscribeToDailyMetrics(userId, today, (metrics) => {
      if (metrics) {
        setMetrics(prev => ({
          ...prev,
          steps: metrics.steps || 0,
          caloriesBurned: metrics.caloriesBurned || 0,
          activeMinutes: metrics.activeMinutes || 0,
          distance: metrics.distance || 0,
        }));
      }
    });

    // Listen to user settings changes
    const unsubscribeSettings = dashboardService.subscribeToUserSettings(userId, (settings) => {
      if (settings) {
        setUserSettings(settings);
        setMetrics(prev => ({
          ...prev,
          dailyStepsTarget: settings.dailyStepsTarget || 10000,
        }));
        setNewDailyStepsTarget(settings.dailyStepsTarget || 10000);
      }
    });

    // Listen to activities changes
    const unsubscribeActivities = extendedActivityService.subscribeToUserExtendedActivities(userId, (activities) => {
      setActivities(activities);
    });

    // Listen to goals changes
    const unsubscribeGoals = goalService.subscribeToUserGoals(userId, (goals) => {
      setGoals(goals);
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeSettings();
      unsubscribeActivities();
      unsubscribeGoals();
    };
  }, [currentUser]);

  // Handle adding a new activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationValue = parseFloat(newActivityDuration);
    const distanceValue = parseFloat(newActivityDistance);
    const caloriesValue = parseInt(newActivityCalories);

    if (!newActivityName || !newActivityDuration || !newActivityDate) {
      alert('Please fill in all required activity fields: Name, Duration, and Date.');
      return;
    }

    if (isNaN(durationValue) || durationValue <= 0) {
      alert('Duration must be a positive number.');
      return;
    }

    if (newActivityDistance && (isNaN(distanceValue) || distanceValue < 0)) {
      alert('Distance must be a non-negative number.');
      return;
    }

    if (newActivityCalories && (isNaN(caloriesValue) || caloriesValue < 0)) {
      alert('Calories must be a non-negative number.');
      return;
    }
    
    try {
      const userId = currentUser.uid;
      const activityDate = new Date(newActivityDate);
      
      // Create the activity
      await extendedActivityService.createExtendedActivity({
        userId,
        activityType: newActivityName,
        duration: durationValue,
        distance: newActivityDistance ? distanceValue : undefined,
        caloriesBurned: newActivityCalories ? caloriesValue : undefined,
        notes: '',
        date: firestoreUtils.toTimestamp(activityDate),
      });

      // Update today's metrics if the activity is for today
      const today = new Date().toISOString().split('T')[0];
      const activityDateStr = newActivityDate;
      
      if (activityDateStr === today) {
        const currentMetrics = await dashboardService.getDailyMetrics(userId, today);
        if (currentMetrics) {
          await dashboardService.updateDailyMetrics(currentMetrics.id, {
            steps: (currentMetrics.steps || 0) + Math.floor(distanceValue * 1000), // Rough estimate
            caloriesBurned: (currentMetrics.caloriesBurned || 0) + (caloriesValue || 0),
            activeMinutes: (currentMetrics.activeMinutes || 0) + durationValue,
            distance: (currentMetrics.distance || 0) + (distanceValue || 0),
          });
        }
      }

      // Clear form fields
      setNewActivityName('');
      setNewActivityDuration('');
      setNewActivityDistance('');
      setNewActivityCalories('');
      setNewActivityDate('');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again.');
    }
  };

  // Handle adding a new goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetValue = parseFloat(newGoalTarget);
    const currentValue = parseFloat(newGoalCurrentValue.toString());

    if (!newGoalName || !newGoalTarget || !newGoalUnit) {
      alert('Please fill in all required goal fields: Name, Target Value, and Unit.');
      return;
    }

    if (isNaN(targetValue) || targetValue <= 0) {
      alert('Target value must be a positive number.');
      return;
    }

    if (isNaN(currentValue) || currentValue < 0) {
      alert('Current value must be a non-negative number.');
      return;
    }
    
    try {
      const userId = currentUser.uid;
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30); // 30 days from now

      await goalService.createGoal({
        userId,
        type: 'steps', // Default type, you might want to make this configurable
        target: targetValue,
        current: currentValue,
        startDate: firestoreUtils.toTimestamp(now),
        targetDate: firestoreUtils.toTimestamp(targetDate),
        achieved: currentValue >= targetValue,
      });

      // Clear form fields
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalUnit('');
      setNewGoalCurrentValue(0);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  // Handle updating goal progress
  const handleUpdateGoalProgress = async (id: string, newCurrentValue: string) => {
    const currentValue = parseFloat(newCurrentValue);
    if (isNaN(currentValue) || currentValue < 0) {
      alert('Current value must be a non-negative number.');
      return;
    }

    try {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        await goalService.updateGoal(id, {
          current: currentValue,
          achieved: currentValue >= goal.target,
        });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  // Handle setting daily steps target
  const handleSetDailyStepsTarget = async () => {
    const stepsTarget = parseInt(newDailyStepsTarget.toString());
    if (isNaN(stepsTarget) || stepsTarget < 0) {
      alert('Daily steps target must be a non-negative number.');
      return;
    }

    try {
      if (userSettings) {
        await dashboardService.updateUserSettings(userSettings.id, {
          dailyStepsTarget: stepsTarget,
        });
      } else {
        const userId = currentUser.uid;
        await dashboardService.createUserSettings({
          userId,
          dailyStepsTarget: stepsTarget,
          theme: 'dark',
          notifications: true,
        });
      }
    } catch (error) {
      console.error('Error updating steps target:', error);
      alert('Failed to update steps target. Please try again.');
    }
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Show loading state
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
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
          <p className="text-black mb-6">Please sign in to access your dashboard.</p>
          <Link to="/signin">
            <Button onClick={() => {}}>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const renderCalendarDays = () => {
    const totalDays = getDaysInMonth(currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Fill leading empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center text-gray-400"></div>);
    }

    // Fill days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasActivity = activities.some(activity => {
        const activityDate = firestoreUtils.toDate(activity.date);
        return activityDate.toDateString() === date.toDateString();
      });

      days.push(
        <div
          key={day}
          className={`p-2 text-center rounded-full cursor-pointer transition-colors duration-200
            ${isToday ? 'bg-black text-white font-semibold' : ''}
            ${isSelected ? 'bg-gray-600 text-white' : 'hover:bg-gray-200 text-black'}
            ${hasActivity ? 'border-2 border-black' : ''}
          `}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  const activitiesForSelectedDate = activities.filter(activity => {
    const activityDate = firestoreUtils.toDate(activity.date);
    return activityDate.toDateString() === selectedDate.toDateString();
  });

  // Prepare weekly data for chart
  const stepsData = weeklyData.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: day.steps || 0,
  }));

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        const stepsProgress = (metrics.steps / metrics.dailyStepsTarget) * 100;
        return (
          <div className="space-y-6">
            {/* User Welcome Section */}
            <Card className="bg-gradient-to-r from-white to-gray-100 text-black border-2 border-black">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {currentUser.displayName || currentUser.email || 'User'}!
                  </h2>
                  <p className="text-black">
                    {currentUser.email} • Member since {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full border-4 border-black"
                    />
                  )}
                  <Button onClick={handleSignOut} className="bg-black text-white hover:bg-gray-800">
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/activities" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">🏃</span>
                    </div>
                    <h3 className="font-semibold text-black">Track Activity</h3>
                    <p className="text-sm text-gray-600">Log your fitness activities</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/goals" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <h3 className="font-semibold text-black">Set Goals</h3>
                    <p className="text-sm text-gray-600">Create and track fitness goals</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/workouts" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">💪</span>
                    </div>
                    <h3 className="font-semibold text-black">Workouts</h3>
                    <p className="text-sm text-gray-600">Plan and log workout sessions</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/user-profile" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">👤</span>
                    </div>
                    <h3 className="font-semibold text-black">Profile</h3>
                    <p className="text-sm text-gray-600">Manage your profile</p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-black mb-2">Daily Steps</h3>
                <p className="text-4xl font-bold text-black">{metrics.steps.toLocaleString()}</p>
                <p className="text-sm text-gray-600">steps today</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-black mb-2">Calories Burned</h3>
                <p className="text-4xl font-bold text-black">{metrics.caloriesBurned.toLocaleString()}</p>
                <p className="text-sm text-gray-600">kcal today</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-black mb-2">Active Minutes</h3>
                <p className="text-4xl font-bold text-black">{metrics.activeMinutes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">minutes today</p>
              </Card>
              <Card className="md:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-semibold text-black mb-2">Daily Steps Goal</h3>
                <p className="text-2xl font-bold text-black mb-2">{metrics.steps.toLocaleString()} / {metrics.dailyStepsTarget.toLocaleString()} steps</p>
                <Progress value={stepsProgress > 100 ? 100 : stepsProgress} />
                {stepsProgress >= 100 && <p className="text-sm text-gray-600 mt-2">Goal achieved!</p>}
              </Card>
              <Card className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-black mb-4">Weekly Steps Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stepsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis dataKey="name" className="text-sm text-black" />
                    <YAxis className="text-sm text-black" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #000000',
                        borderRadius: '8px',
                        padding: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        color: '#000000'
                      }}
                      labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                      itemStyle={{ color: '#000000' }}
                    />
                    <Line type="monotone" dataKey="steps" stroke="#000000" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        );
      case 'activities':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Activities</h2>
              <Link to="/activities">
                <Button onClick={() => {}}>Go to Activities</Button>
              </Link>
            </div>
            
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Log New Activity</h3>
              <form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityName">Activity Name</Label>
                  <Input
                    id="activityName"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="e.g., Running"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDuration">Duration (minutes)</Label>
                  <Input
                    id="activityDuration"
                    type="number"
                    value={newActivityDuration}
                    onChange={(e) => setNewActivityDuration(e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDistance">Distance (km, optional)</Label>
                  <Input
                    id="activityDistance"
                    type="number"
                    value={newActivityDistance}
                    onChange={(e) => setNewActivityDistance(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <Label htmlFor="activityCalories">Calories (kcal, optional)</Label>
                  <Input
                    id="activityCalories"
                    type="number"
                    value={newActivityCalories}
                    onChange={(e) => setNewActivityCalories(e.target.value)}
                    placeholder="e.g., 300"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDate">Date</Label>
                  <Input
                    id="activityDate"
                    type="date"
                    value={newActivityDate}
                    onChange={(e) => setNewActivityDate(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" onClick={() => {}}>Add Activity</Button>
                </div>
              </form>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Recent Activities</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-md">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-md">Calories</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {firestoreUtils.toDate(activity.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{activity.activityType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{activity.duration} min</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{activity.distance || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{activity.caloriesBurned || '-'} kcal</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Goals</h2>
              <Link to="/goals">
                <Button onClick={() => {}}>Go to Goals</Button>
              </Link>
            </div>
            
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Set Daily Steps Target</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <Label htmlFor="dailyStepsTarget">Target Steps</Label>
                  <Input
                    id="dailyStepsTarget"
                    type="number"
                    value={newDailyStepsTarget}
                    onChange={(e) => setNewDailyStepsTarget(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 10000"
                  />
                </div>
                <Button onClick={handleSetDailyStepsTarget} className="w-full sm:w-auto">Set Target</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Set New Goal</h3>
              <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newGoalName">Goal Name</Label>
                  <Input
                    id="newGoalName"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    placeholder="e.g., Run 5K"
                  />
                </div>
                <div>
                  <Label htmlFor="newGoalTarget">Target Value</Label>
                  <Input
                    id="newGoalTarget"
                    type="number"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <Label htmlFor="newGoalUnit">Unit</Label>
                  <Input
                    id="newGoalUnit"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="e.g., km, lbs, glasses"
                  />
                </div>
                <div>
                  <Label htmlFor="newGoalCurrentValue">Current Value (optional)</Label>
                  <Input
                    id="newGoalCurrentValue"
                    type="number"
                    value={newGoalCurrentValue}
                    onChange={(e) => setNewGoalCurrentValue(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 0"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" onClick={() => {}}>Add Goal</Button>
                </div>
              </form>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">My Goals</h3>
              <div className="space-y-6">
                {goals.map((goal) => {
                  const progressPercentage = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id} className="border border-black p-4 rounded-md shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-black text-lg">{goal.type}</span>
                        <span className="text-sm text-gray-600">
                          {goal.current} / {goal.target}
                        </span>
                      </div>
                      <Progress value={progressPercentage > 100 ? 100 : progressPercentage} className="mb-3" />
                      {goal.achieved && <p className="text-sm text-gray-600 mt-2 font-semibold">Goal achieved!</p>}
                      <div className="flex items-center space-x-2 mt-3">
                        <Label htmlFor={`updateGoal-${goal.id}`} className="sr-only">Update Progress for {goal.type}</Label>
                        <Input
                          id={`updateGoal-${goal.id}`}
                          type="number"
                          value={goal.current}
                          onChange={(e) => handleUpdateGoalProgress(goal.id!, e.target.value)}
                          placeholder="Update value"
                          className="w-32"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4 text-center">Activity History</h3>
              <div className="flex justify-between items-center mb-4">
                <Button onClick={goToPreviousMonth}>{'<'}</Button>
                <h4 className="text-lg font-semibold text-black">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <Button onClick={goToNextMonth}>{'>'}</Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm font-medium text-gray-600 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Activities on {selectedDate.toDateString()}</h3>
              {activitiesForSelectedDate.length > 0 ? (
                <ul className="space-y-2">
                  {activitiesForSelectedDate.map(activity => (
                    <li key={activity.id} className="bg-gray-100 p-3 rounded-md border border-black">
                      <p className="font-medium text-black">{activity.activityType}</p>
                      <p className="text-sm text-gray-600">
                        Duration: {activity.duration} min {activity.distance && `| Distance: ${activity.distance} km`} {activity.caloriesBurned && `| Calories: ${activity.caloriesBurned} kcal`}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No activities logged for this date.</p>
              )}
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-black">Welcome, {currentUser.displayName || currentUser.email || 'User'}!</span>
            <Button onClick={handleSignOut} className="bg-black hover:bg-gray-800">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {['overview', 'activities', 'goals', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-black p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;