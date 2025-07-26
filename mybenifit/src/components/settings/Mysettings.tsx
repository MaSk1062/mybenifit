import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { dashboardService } from '../../services/firestore';
import type { UserSettings } from '../../types/firestore';
import NavBar from '../nav/nav';

function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for various settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(false);
  const [dataSyncEnabled, setDataSyncEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [dailyStepsTarget, setDailyStepsTarget] = useState(10000);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        loadUserSettings(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user settings from Firestore
  const loadUserSettings = async (userId: string) => {
    try {
      const userSettings = await dashboardService.getUserSettings(userId);
      if (userSettings) {
        setSettings(userSettings);
        setNotificationsEnabled(userSettings.notifications.enabled);
        setEmailNotifications(userSettings.notifications.email);
        setPushNotifications(userSettings.notifications.push);
        setPrivacyPublicProfile(userSettings.privacy.publicProfile);
        setDataSyncEnabled(userSettings.dataSync.enabled);
        setTheme(userSettings.theme);
        setDailyStepsTarget(userSettings.dailyStepsTarget);
      } else {
        // Create default settings if none exist
        const defaultSettings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'> = {
          userId,
          theme: 'light',
          notifications: {
            enabled: true,
            email: true,
            push: false
          },
          privacy: {
            publicProfile: false
          },
          dataSync: {
            enabled: true
          },
          dailyStepsTarget: 10000
        };
        await dashboardService.createUserSettings(defaultSettings);
        // We don't need to set the full settings object here since we'll reload it
        await loadUserSettings(userId);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Handle saving all settings
  const handleSaveSettings = async () => {
    if (!currentUser || !settings) return;
    
    try {
      setIsSaving(true);
      
      const updatedSettings: Partial<UserSettings> = {
        theme,
        notifications: {
          enabled: notificationsEnabled,
          email: emailNotifications,
          push: pushNotifications
        },
        privacy: {
          publicProfile: privacyPublicProfile
        },
        dataSync: {
          enabled: dataSyncEnabled
        },
        dailyStepsTarget
      };

      await dashboardService.updateUserSettings(settings.id!, updatedSettings);
      
      // Reload settings to get updated data
      await loadUserSettings(currentUser.uid);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading settings...</p>
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
          <p className="text-black mb-6">Please sign in to access your settings.</p>
          <a href="/signin" className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Helper components for consistent styling (re-used from other pages)
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

  const ToggleSwitch = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-black cursor-pointer">{label}</label>
      <div
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out
          ${checked ? 'bg-black' : 'bg-gray-200'}
        `}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </div>
    </div>
  );

  const Select = ({ id, label, value, onChange, options, className = '' }: { id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; className?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-black mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const Input = ({ type = 'text', placeholder = '', value, onChange, className = '', label = '' }: { type?: string; placeholder?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string; label?: string }) => (
    <div>
      {label && <label className="block text-sm font-medium text-black mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
      />
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-black mb-8 text-center">Settings</h1>

        <div className="space-y-8">
          {/* General Settings */}
          <Card>
            <h2 className="text-2xl font-semibold text-black mb-6">General</h2>
            <div className="space-y-4">
              <Select
                id="theme-select"
                label="App Theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
              <Input
                type="number"
                label="Daily Steps Target"
                value={dailyStepsTarget}
                onChange={(e) => setDailyStepsTarget(parseInt(e.target.value) || 10000)}
                placeholder="e.g., 10000"
              />
              <ToggleSwitch
                id="data-sync-toggle"
                label="Enable Data Synchronization"
                checked={dataSyncEnabled}
                onChange={setDataSyncEnabled}
              />
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <h2 className="text-2xl font-semibold text-black mb-6">Notifications</h2>
            <div className="space-y-4">
              <ToggleSwitch
                id="notifications-toggle"
                label="Enable All Notifications"
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
              <ToggleSwitch
                id="email-notifications-toggle"
                label="Email Notifications"
                checked={emailNotifications && notificationsEnabled} // Only enabled if main notifications are on
                onChange={setEmailNotifications}
              />
              <ToggleSwitch
                id="push-notifications-toggle"
                label="Push Notifications"
                checked={pushNotifications && notificationsEnabled} // Only enabled if main notifications are on
                onChange={setPushNotifications}
              />
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <h2 className="text-2xl font-semibold text-black mb-6">Privacy</h2>
            <div className="space-y-4">
              <ToggleSwitch
                id="public-profile-toggle"
                label="Make Profile Public"
                checked={privacyPublicProfile}
                onChange={setPrivacyPublicProfile}
              />
              {/* Add more privacy settings here as needed */}
            </div>
          </Card>

          {/* Account Settings */}
          <Card>
            <h2 className="text-2xl font-semibold text-black mb-6">Account</h2>
            <div className="space-y-4">
              <Button className="w-full bg-black hover:bg-gray-800">Change Password</Button>
              <Button className="w-full bg-black hover:bg-gray-800">Delete Account</Button>
            </div>
          </Card>

          {/* Legal & Privacy */}
          <Card>
            <h2 className="text-2xl font-semibold text-black mb-6">Legal & Privacy</h2>
            <div className="space-y-4">
              <Link 
                to="/privacy" 
                className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SettingsPage;
