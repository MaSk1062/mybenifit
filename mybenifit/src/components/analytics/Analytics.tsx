import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { Link } from 'react-router-dom';
import NavBar from '../nav/nav';
import { 
  goalService, 
  extendedActivityService,
  firestoreUtils 
} from '../../services/firestore';
import type { Goal, ExtendedActivity } from '../../types/firestore';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';

// Helper components for consistent styling
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border border-black ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', type = 'button', disabled = false }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-black h-2.5 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

function Analytics() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [activities, setActivities] = useState<ExtendedActivity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  
  // Time range states
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load analytics data when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const userId = currentUser.uid;
        
        // Load all data
        const [activitiesData, goalsData] = await Promise.all([
          extendedActivityService.getExtendedActivitiesByUser(userId),
          goalService.getGoalsByUser(userId)
        ]);

        setActivities(activitiesData);
        setGoals(goalsData);

        // Generate weekly and monthly data
        await generateTimeSeriesData();
        
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [currentUser, timeRange]);

  // Generate time series data for charts
  const generateTimeSeriesData = async () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // Generate daily data points
    const dataPoints = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayActivities = activities.filter(activity => {
        const activityDate = firestoreUtils.toDate(activity.date);
        return activityDate.toDateString() === currentDate.toDateString();
      });

      const totalSteps = dayActivities.reduce((sum, activity) => sum + (activity.distance ? activity.distance * 1000 : 0), 0);
      const totalCalories = dayActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
      const totalDuration = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);

      dataPoints.push({
        date: dateStr,
        steps: totalSteps,
        calories: totalCalories,
        duration: totalDuration,
        activities: dayActivities.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (timeRange === 'week') {
      setWeeklyData(dataPoints);
    } else if (timeRange === 'month') {
      setMonthlyData(dataPoints);
    }
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (activities.length === 0) return null;

    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCalories = activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
    const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);

    const avgDuration = totalDuration / totalActivities;
    const avgCalories = totalCalories / totalActivities;
    const avgDistance = totalDistance / totalActivities;

    // Calculate trend (comparing last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeek = activities.filter(activity => {
      const activityDate = firestoreUtils.toDate(activity.date);
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const previousWeek = activities.filter(activity => {
      const activityDate = firestoreUtils.toDate(activity.date);
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7 && daysDiff <= 14;
    });

    const lastWeekTotal = lastWeek.reduce((sum, activity) => sum + activity.duration, 0);
    const previousWeekTotal = previousWeek.reduce((sum, activity) => sum + activity.duration, 0);
    
    const trend = previousWeekTotal > 0 ? ((lastWeekTotal - previousWeekTotal) / previousWeekTotal) * 100 : 0;

    return {
      totalActivities,
      totalDuration,
      totalCalories,
      totalDistance,
      avgDuration,
      avgCalories,
      avgDistance,
      trend
    };
  };

  // Calculate goal achievement predictions
  const calculateGoalPredictions = () => {
    if (goals.length === 0) return [];

    return goals.map(goal => {
      const progress = (goal.current / goal.target) * 100;
      const daysRemaining = Math.ceil((firestoreUtils.toDate(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate prediction based on current progress and time remaining
      const dailyProgressNeeded = (goal.target - goal.current) / Math.max(daysRemaining, 1);
      const isOnTrack = dailyProgressNeeded <= (goal.current / Math.max(daysRemaining, 1));
      
      return {
        ...goal,
        progress,
        daysRemaining,
        dailyProgressNeeded,
        isOnTrack,
        predictedCompletion: isOnTrack ? 'On Track' : 'Needs Improvement'
      };
    });
  };

  // Generate activity type distribution
  const getActivityTypeDistribution = () => {
    const distribution = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  // Generate performance trends
  const getPerformanceTrends = () => {
    const data = timeRange === 'week' ? weeklyData : monthlyData;
    return data.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      steps: day.steps,
      calories: day.calories,
      duration: day.duration
    }));
  };

  const performanceMetrics = calculatePerformanceMetrics();
  const goalPredictions = calculateGoalPredictions();
  const activityDistribution = getActivityTypeDistribution();
  const performanceTrends = getPerformanceTrends();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading analytics...</p>
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
          <p className="text-black mb-6">Please sign in to view your analytics.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">Time Range</h3>
                <div className="flex space-x-2">
                  {(['week', 'month', 'year'] as const).map((range) => (
                    <Button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={timeRange === range ? 'bg-black' : 'bg-gray-300 text-black'}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            {performanceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <h4 className="text-lg font-semibold text-black mb-2">Total Activities</h4>
                  <p className="text-3xl font-bold text-black">{performanceMetrics.totalActivities}</p>
                  <p className="text-sm text-gray-600">activities logged</p>
                </Card>
                <Card>
                  <h4 className="text-lg font-semibold text-black mb-2">Total Duration</h4>
                  <p className="text-3xl font-bold text-black">{Math.round(performanceMetrics.totalDuration)}</p>
                  <p className="text-sm text-gray-600">minutes</p>
                </Card>
                <Card>
                  <h4 className="text-lg font-semibold text-black mb-2">Total Calories</h4>
                  <p className="text-3xl font-bold text-black">{performanceMetrics.totalCalories}</p>
                  <p className="text-sm text-gray-600">kcal burned</p>
                </Card>
                <Card>
                  <h4 className="text-lg font-semibold text-black mb-2">Weekly Trend</h4>
                  <p className={`text-3xl font-bold ${performanceMetrics.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMetrics.trend >= 0 ? '+' : ''}{performanceMetrics.trend.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">vs previous week</p>
                </Card>
              </div>
            )}

            {/* Performance Trends Chart */}
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                  <XAxis dataKey="date" className="text-sm text-black" />
                  <YAxis className="text-sm text-black" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #000000',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Area type="monotone" dataKey="steps" stackId="1" stroke="#000000" fill="#000000" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="calories" stackId="2" stroke="#666666" fill="#666666" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Activity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-xl font-semibold text-black mb-4">Activity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#000000"
                      dataKey="value"
                    >
                      {activityDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000000' : '#666666'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold text-black mb-4">Goal Predictions</h3>
                <div className="space-y-4">
                  {goalPredictions.map((goal) => (
                    <div key={goal.id} className="border border-black p-3 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-black">{goal.type}</span>
                        <span className={`text-sm font-semibold ${goal.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                          {goal.predictedCompletion}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="mb-2" />
                      <div className="text-sm text-gray-600">
                        <p>{goal.current} / {goal.target} ({goal.progress.toFixed(1)}%)</p>
                        <p>{goal.daysRemaining} days remaining</p>
                        {!goal.isOnTrack && (
                          <p className="text-red-600">Need {goal.dailyProgressNeeded.toFixed(1)} per day to reach goal</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Detailed Trend Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                  <XAxis dataKey="date" className="text-sm text-black" />
                  <YAxis className="text-sm text-black" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #000000',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Line type="monotone" dataKey="steps" stroke="#000000" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="calories" stroke="#666666" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="duration" stroke="#999999" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-black mb-4">Performance Radar Chart</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  {
                    metric: 'Steps',
                    value: performanceMetrics?.totalDistance || 0,
                    fullMark: 10000
                  },
                  {
                    metric: 'Calories',
                    value: performanceMetrics?.totalCalories || 0,
                    fullMark: 500
                  },
                  {
                    metric: 'Duration',
                    value: performanceMetrics?.totalDuration || 0,
                    fullMark: 300
                  },
                  {
                    metric: 'Activities',
                    value: performanceMetrics?.totalActivities || 0,
                    fullMark: 10
                  }
                ]}>
                  <PolarGrid stroke="#000000" />
                  <PolarAngleAxis dataKey="metric" className="text-sm text-black" />
                  <PolarRadiusAxis className="text-sm text-black" />
                  <Radar name="Performance" dataKey="value" stroke="#000000" fill="#000000" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Advanced Analytics</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {['overview', 'trends', 'performance'].map((tab) => (
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

export default Analytics; 