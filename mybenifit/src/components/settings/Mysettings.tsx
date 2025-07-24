import React, { useState } from 'react';

function SettingsPage() {
  // State for various settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(false);
  const [dataSyncEnabled, setDataSyncEnabled] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  // Helper components for consistent styling (re-used from other pages)
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

  const ToggleSwitch = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-gray-700 cursor-pointer">{label}</label>
      <div
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
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

  const Select = ({ id, label, value, onChange, options, className = '' }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const Input = ({ type = 'text', placeholder = '', value, onChange, className = '', label = '' }) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
    </div>
  );


  // Handle saving all settings
  const handleSaveSettings = () => {
    console.log('Saving settings:', {
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      privacyPublicProfile,
      dataSyncEnabled,
      theme,
    });
    // In a real application, you would send this data to a backend/database
    // You might also add a success message here
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Settings</h1>

        <div className="space-y-8">
          {/* General Settings */}
          <Card>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">General</h2>
            <div className="space-y-4">
              <Select
                id="theme-select"
                label="App Theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notifications</h2>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Privacy</h2>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account</h2>
            <div className="space-y-4">
              <Button className="w-full bg-red-600 hover:bg-red-700">Change Password</Button>
              <Button className="w-full bg-red-600 hover:bg-red-700">Delete Account</Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
