import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom'; // Corrected import for Link
import { auth } from '../../firebase'; // Assuming this path is correct for your Firebase setup
import { signOut } from 'firebase/auth';



// Dummy data for the dashboard
const initialMetrics = {
  steps: 8500,
  caloriesBurned: 520,
  activeMinutes: 60,
  distance: 6.5, // km
  dailyStepsTarget: 10000, // New daily steps target
};

const initialActivities = [
  { id: 1, name: 'Running', duration: '30 min', distance: '5 km', calories: 350, date: '2025-07-20' },
  { id: 2, name: 'Weightlifting', duration: '45 min', calories: 200, date: '2025-07-19' },
  { id: 3, name: 'Cycling', duration: '60 min', distance: '15 km', calories: 450, date: '2025-07-18' },
  { id: 4, name: 'Yoga', duration: '40 min', calories: 150, date: '2025-07-15' },
  { id: 5, name: 'Swimming', duration: '45 min', distance: '1 km', calories: 300, date: '2025-07-12' },
  { id: 6, name: 'Hiking', duration: '90 min', distance: '8 km', calories: 600, date: '2025-07-08' },
];

const initialGoals = [
  { id: 1, name: 'Run 10K', currentValue: 7, target: 10, unit: 'km' }, // Added currentValue and unit
  { id: 2, name: 'Drink 8 glasses of water daily', currentValue: 6, target: 8, unit: 'glasses' },
  { id: 3, name: 'Workout 5 times a week', currentValue: 3, target: 5, unit: 'times' },
];

const stepsData = [
  { name: 'Mon', steps: 4000 },
  { name: 'Tue', steps: 6000 },
  { name: 'Wed', steps: 7500 },
  { name: 'Thu', steps: 8500 },
  { name: 'Fri', steps: 7000 },
  { name: 'Sat', steps: 9000 },
  { name: 'Sun', steps: 10000 },
];

// Helper components for Shadcn-like styling
const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ type = 'text', placeholder = '', value, onChange, className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
    {children}
  </label>
);

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

function Dashboard() {
  // Initialize currentUser as null initially, and let useEffect update it
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activities, setActivities] = useState(initialActivities);
  const [goals, setGoals] = useState(initialGoals);

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

  // Handle adding a new activity
  const handleAddActivity = (e) => {
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
    
    const newActivity = {
      id: activities.length + 1,
      name: newActivityName,
      duration: `${durationValue} min`, // Keep unit for display consistency
      distance: newActivityDistance ? `${distanceValue} km` : '-', // Add unit if present
      calories: caloriesValue,
      date: newActivityDate,
    };
    setActivities([...activities, newActivity]);
    // Clear form fields
    setNewActivityName('');
    setNewActivityDuration('');
    setNewActivityDistance('');
    setNewActivityCalories('');
    setNewActivityDate('');
  };

  // Handle adding a new goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    const targetValue = parseFloat(newGoalTarget);
    const currentValue = parseFloat(newGoalCurrentValue);

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
    
    const newGoal = {
      id: goals.length + 1,
      name: newGoalName,
      currentValue: currentValue,
      target: targetValue,
      unit: newGoalUnit,
    };
    setGoals([...goals, newGoal]);
    // Clear form fields
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalUnit('');
    setNewGoalCurrentValue(0);
  };

  // Handle updating goal progress
  const handleUpdateGoalProgress = (id, newCurrentValue) => {
    const currentValue = parseFloat(newCurrentValue);
    if (isNaN(currentValue) || currentValue < 0) {
      alert('Current value must be a non-negative number.');
      return;
    }

    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, currentValue: currentValue } : goal
    ));
  };

  // Handle setting daily steps target
  const handleSetDailyStepsTarget = () => {
    const stepsTarget = parseInt(newDailyStepsTarget);
    if (isNaN(stepsTarget) || stepsTarget < 0) {
      alert('Daily steps target must be a non-negative number.');
      return;
    }
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      dailyStepsTarget: stepsTarget
    }));
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
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
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
          <p className="text-gray-800 mb-6">Please sign in to access your dashboard.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const renderCalendarDays = () => {
    const totalDays = getDaysInMonth(currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentMonth); // 0 for Sunday
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
      const hasActivity = activities.some(activity =>
        new Date(activity.date).toDateString() === date.toDateString()
      );

      days.push(
        <div
          key={day}
          className={`p-2 text-center rounded-full cursor-pointer transition-colors duration-200
            ${isToday ? 'bg-blue-200 text-blue-800 font-semibold' : ''}
            ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            ${hasActivity ? 'border-2 border-green-500' : ''}
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

  const activitiesForSelectedDate = activities.filter(activity =>
    new Date(activity.date).toDateString() === selectedDate.toDateString()
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        const stepsProgress = (metrics.steps / metrics.dailyStepsTarget) * 100;
        return (
          <div className="space-y-6">
            {/* User Welcome Section */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {currentUser.displayName || currentUser.email || 'User'}!
                  </h2>
                  <p className="text-blue-100">
                    {currentUser.email} • Member since {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full border-4 border-white"
                    />
                  )}
                  <Button onClick={handleSignOut} className="bg-white text-blue-600 hover:bg-gray-100">
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
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 text-xl">🏃</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Track Activity</h3>
                    <p className="text-sm text-gray-700">Log your fitness activities</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/goals" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl">🎯</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Set Goals</h3>
                    <p className="text-sm text-gray-700">Create and track fitness goals</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/workouts" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 text-xl">💪</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Workouts</h3>
                    <p className="text-sm text-gray-700">Plan and log workout sessions</p>
                  </div>
                </Card>
              </Link>
              
              <Link to="/user-profile" className="block">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 text-xl">👤</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Profile</h3>
                    <p className="text-sm text-gray-700">Manage your profile</p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Steps</h3>
                <p className="text-4xl font-bold text-blue-600">{metrics.steps}</p>
                <p className="text-sm text-gray-700">steps today</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calories Burned</h3>
                <p className="text-4xl font-bold text-red-600">{metrics.caloriesBurned}</p>
                <p className="text-sm text-gray-700">kcal today</p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Minutes</h3>
                <p className="text-4xl font-bold text-green-600">{metrics.activeMinutes}</p>
                <p className="text-sm text-gray-500">minutes today</p>
              </Card>
              <Card className="md:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Steps Goal</h3>
                <p className="text-2xl font-bold text-purple-600 mb-2">{metrics.steps} / {metrics.dailyStepsTarget} steps</p>
                <Progress value={stepsProgress > 100 ? 100 : stepsProgress} />
                {stepsProgress >= 100 && <p className="text-sm text-green-600 mt-2">Goal achieved!</p>}
              </Card>
              <Card className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Steps Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stepsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" className="text-sm text-gray-600" />
                    <YAxis className="text-sm text-gray-600" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#333', fontWeight: 'bold' }}
                      itemStyle={{ color: '#666' }}
                    />
                    <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
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
              <h2 className="text-2xl font-bold text-gray-800">Activities</h2>
              {/* You might want to remove this link if the current tab is already 'activities' or link to a dedicated activities page if it exists */}
              <Link to="/activities">
                <Button>Go to Activities</Button>
              </Link>
            </div>
            
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Log New Activity</h3>
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
                    type="number" // Changed to number type
                    value={newActivityDuration}
                    onChange={(e) => setNewActivityDuration(e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="activityDistance">Distance (km, optional)</Label>
                  <Input
                    id="activityDistance"
                    type="number" // Changed to number type
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
                  <Button type="submit">Add Activity</Button>
                </div>
              </form>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-md">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-md">Calories</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.distance || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.calories} kcal</td>
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
              <h2 className="text-2xl font-bold text-gray-800">Goals</h2>
              {/* You might want to remove this link if the current tab is already 'goals' or link to a dedicated goals page if it exists */}
              <Link to="/goals">
                <Button>Go to Goals</Button>
              </Link>
            </div>
            
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Set Daily Steps Target</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <Label htmlFor="dailyStepsTarget">Target Steps</Label>
                  <Input
                    id="dailyStepsTarget"
                    type="number"
                    value={newDailyStepsTarget}
                    onChange={(e) => setNewDailyStepsTarget(e.target.value)}
                    placeholder="e.g., 10000"
                  />
                </div>
                <Button onClick={handleSetDailyStepsTarget} className="w-full sm:w-auto">Set Target</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Set New Goal</h3>
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
                    onChange={(e) => setNewGoalCurrentValue(e.target.value)}
                    placeholder="e.g., 0"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit">Add Goal</Button>
                </div>
              </form>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Goals</h3>
              <div className="space-y-6">
                {goals.map((goal) => {
                  const progressPercentage = (goal.currentValue / goal.target) * 100;
                  return (
                    <div key={goal.id} className="border border-gray-200 p-4 rounded-md shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 text-lg">{goal.name}</span>
                        <span className="text-sm text-gray-600">
                          {goal.currentValue} {goal.unit} / {goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progressPercentage > 100 ? 100 : progressPercentage} className="mb-3" />
                      {progressPercentage >= 100 && <p className="text-sm text-green-600 mt-2 font-semibold">Goal achieved!</p>}
                      <div className="flex items-center space-x-2 mt-3">
                        <Label htmlFor={`updateGoal-${goal.id}`} className="sr-only">Update Progress for {goal.name}</Label>
                        <Input
                          id={`updateGoal-${goal.id}`}
                          type="number"
                          value={goal.currentValue}
                          onChange={(e) => handleUpdateGoalProgress(goal.id, e.target.value)}
                          placeholder="Update value"
                          className="w-32"
                        />
                        <span className="text-sm text-gray-600">{goal.unit}</span>
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
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Activity History</h3>
              <div className="flex justify-between items-center mb-4">
                <Button onClick={goToPreviousMonth}>{'<'}</Button>
                <h4 className="text-lg font-semibold">
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
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Activities on {selectedDate.toDateString()}</h3>
              {activitiesForSelectedDate.length > 0 ? (
                <ul className="space-y-2">
                  {activitiesForSelectedDate.map(activity => (
                    <li key={activity.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-600">
                        Duration: {activity.duration} {activity.distance && `| Distance: ${activity.distance}`} {activity.calories && `| Calories: ${activity.calories} kcal`}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No activities logged for this date.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-800">Welcome, {currentUser.displayName || currentUser.email || 'User'}!</span>
            <Button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">
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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;