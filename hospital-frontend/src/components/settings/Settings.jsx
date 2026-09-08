// src/components/settings/Settings.jsx - Updated with Save button for language
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Check,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Globe,
  Lock,
  Key,
  AlertCircle,
  Languages
} from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const Settings = () => {
  const { t, language, changeLanguage, saveLanguage, isLanguageChanging } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Language change state
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_staff: false,
    is_superuser: false
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    twoFactor: false,
    language: 'English',
    theme: 'Light'
  });

  useEffect(() => {
    fetchUsers();
    fetchProfile();
    loadSavedSettings();
  }, []);

  // Update selectedLanguage when language changes from context
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const loadSavedSettings = () => {
    const savedSettings = localStorage.getItem('medicare_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applyTheme(parsed.theme || 'Light');
        if (parsed.language) {
          setSelectedLanguage(parsed.language);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827';
      document.documentElement.style.color = '#f9fafb';
    } else if (theme === 'System') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#111827';
        document.documentElement.style.color = '#f9fafb';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '#ffffff';
        document.documentElement.style.color = '#000000';
      }
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
      document.documentElement.style.color = '#000000';
    }
  };

  const saveSettings = (newSettings) => {
    localStorage.setItem('medicare_settings', JSON.stringify(newSettings));
    setSettings(newSettings);
    applyTheme(newSettings.theme);
    setSuccessMessage(t('saveSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle language save
  const handleLanguageSave = () => {
    setIsSavingLanguage(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Save the selected language
      const saved = saveLanguage(selectedLanguage);
      if (saved) {
        // Update settings
        const newSettings = { ...settings, language: selectedLanguage };
        localStorage.setItem('medicare_settings', JSON.stringify(newSettings));
        setSettings(newSettings);
        
        setSuccessMessage(t('languageSaved') || 'Language settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving language:', error);
      setErrorMessage('Failed to save language settings');
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    // Clear any previous messages
    setErrorMessage('');
    setSuccessMessage('');
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('users/');
      const userData = response.data.results || response.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('users/me/');
      const userData = response.data;
      setProfileForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        username: userData.username || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      try {
        const response = await api.get('users/');
        const usersData = response.data.results || response.data || [];
        if (Array.isArray(usersData) && usersData.length > 0) {
          const currentUser = usersData[0];
          setProfileForm({
            first_name: currentUser.first_name || '',
            last_name: currentUser.last_name || '',
            email: currentUser.email || '',
            username: currentUser.username || ''
          });
        }
      } catch (e) {
        console.error('Error fetching profile fallback:', e);
      }
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleThemeChange = (theme) => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);
  };

  const handleUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const updateData = { ...profileForm };
      const response = await api.put('users/me/', updateData);
      setSuccessMessage(t('profileUpdateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      setProfileForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        username: response.data.username || ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage(t('passwordMismatch'));
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setErrorMessage(t('passwordTooShort'));
      setPasswordLoading(false);
      return;
    }

    try {
      await api.post('users/change_password/', {
        old_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setSuccessMessage(t('passwordChangeSuccess'));
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (editingUser) {
        const updateData = { ...userForm };
        if (!updateData.password) {
          delete updateData.password;
        }
        if (updateData.username === editingUser.username) {
          delete updateData.username;
        }
        await api.put(`users/${editingUser.id}/`, updateData);
        setSuccessMessage(t('userUpdateSuccess'));
      } else {
        await api.post('users/', userForm);
        setSuccessMessage(t('userCreateSuccess'));
      }
      await fetchUsers();
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMsg = error.response?.data?.username?.[0] || 
                       error.response?.data?.email?.[0] ||
                       error.response?.data?.message ||
                       'Failed to save user';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('deleteUser'))) {
      try {
        await api.delete(`users/${userId}/`);
        await fetchUsers();
        setSuccessMessage(t('userDeleteSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setErrorMessage('Failed to delete user');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      is_staff: false,
      is_superuser: false
    });
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || '',
        email: user.email || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false
      });
    } else {
      setEditingUser(null);
      resetUserForm();
    }
    setErrorMessage('');
    setSuccessMessage('');
    setShowUserModal(true);
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const tabs = [
    { id: 'profile', icon: User, labelKey: 'profile' },
    { id: 'users', icon: Users, labelKey: 'users' },
    { id: 'notifications', icon: Bell, labelKey: 'notifications' },
    { id: 'security', icon: Shield, labelKey: 'security' },
    { id: 'appearance', icon: Palette, labelKey: 'appearance' }
  ];

  const languages = [
    { code: 'English', flag: '🇬🇧' },
    { code: 'Spanish', flag: '🇪🇸' },
    { code: 'French', flag: '🇫🇷' },
    { code: 'German', flag: '🇩🇪' },
    { code: 'Portuguese', flag: '🇵🇹' },
    { code: 'Italian', flag: '🇮🇹' },
    { code: 'Kiswahili', flag: '🇹🇿' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-slide-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slide-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">{t('settingsTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('settingsSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800">{t('profileSettings')}</h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')} *</label>
                <input 
                  type="text" 
                  name="first_name"
                  value={profileForm.first_name} 
                  onChange={handleProfileChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')} *</label>
                <input 
                  type="text" 
                  name="last_name"
                  value={profileForm.last_name} 
                  onChange={handleProfileChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
                <input 
                  type="email" 
                  name="email"
                  value={profileForm.email} 
                  onChange={handleProfileChange}
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
                <input 
                  type="text" 
                  name="username"
                  value={profileForm.username} 
                  className="input-field" 
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">{t('usernameCannotChange')}</p>
              </div>
            </div>
            <button 
              type="submit"
              disabled={profileLoading}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              {profileLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('updateProfile')}
            </button>
          </form>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">{t('userManagement')}</h2>
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {Array.isArray(users) ? users.length : 0} {t('users')}
              </span>
            </div>
            <button
              onClick={() => openUserModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              {t('addUser')}
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchUsers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t('user')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t('username')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t('email')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t('role')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      {searchTerm ? t('noUsersFound') : t('noUsers')}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                            {user.first_name?.[0] || user.username?.[0] || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.username}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.is_superuser 
                            ? 'bg-purple-100 text-purple-700' 
                            : user.is_staff 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.is_superuser ? t('admin') : user.is_staff ? t('staff') : t('userRole')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserModal(user)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title={t('editUser')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title={t('deleteUser')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notification Settings Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800">{t('notificationPreferences')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{t('pushNotifications')}</p>
                <p className="text-sm text-gray-500">{t('pushNotificationsDesc')}</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{t('emailUpdates')}</p>
                <p className="text-sm text-gray-500">{t('emailUpdatesDesc')}</p>
              </div>
              <button
                onClick={() => handleToggle('emailUpdates')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailUpdates ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.emailUpdates ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">{t('changePassword')}</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('passwordMinLength')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmNewPassword')}</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                {passwordLoading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {t('changePassword')}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{t('twoFactorAuth')}</p>
                <p className="text-sm text-gray-500">{t('twoFactorDesc')}</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactor')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.twoFactor ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.twoFactor ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">{t('themeSettings')}</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t('chooseTheme')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Light', icon: Sun, color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-white', textColor: 'text-gray-800' },
                  { id: 'Dark', icon: Moon, color: 'from-gray-700 to-gray-900', bgColor: 'bg-gray-900', textColor: 'text-white' },
                  { id: 'System', icon: Monitor, color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50', textColor: 'text-gray-800' }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 relative ${
                      settings.theme === theme.id
                        ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${theme.color} flex items-center justify-center`}>
                      <theme.icon className={`w-8 h-8 text-white ${theme.id === 'Dark' ? 'text-gray-200' : ''}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${settings.theme === theme.id ? 'text-primary-600' : 'text-gray-700'}`}>
                        {t(theme.id.toLowerCase())}
                      </p>
                      <div className={`mt-2 w-full h-8 rounded-md ${theme.bgColor} border border-gray-200 flex items-center justify-center ${theme.textColor} text-xs`}>
                        {t('preview')}
                      </div>
                    </div>
                    {settings.theme === theme.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-primary-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t('currentTheme')}: <span className="font-semibold text-primary-600">{settings.theme}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Language Settings - With Save Button */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">{t('languageSettings')}</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectLanguage')}</label>
              <p className="text-sm text-gray-500 mb-4">{t('selectLanguageHint') || 'Choose your preferred language for the entire system'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedLanguage === lang.code
                        ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.code}</span>
                    {selectedLanguage === lang.code && (
                      <Check className="w-4 h-4 text-primary-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Current Language Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t('currentLanguage')}: <span className="font-semibold text-primary-600">{selectedLanguage}</span>
                </p>
              </div>

              {/* Save Button for Language */}
              <div className="mt-4">
                <button
                  onClick={handleLanguageSave}
                  disabled={isSavingLanguage || selectedLanguage === language}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedLanguage === language
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isSavingLanguage ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      {t('saving') || 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('saveChanges') || 'Save Changes'}
                    </>
                  )}
                </button>
                {selectedLanguage === language && (
                  <p className="text-xs text-gray-500 mt-2">
                    {language === settings.language ? 'Current language is already set' : 'Select a different language to save'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                {editingUser ? t('editUserTitle') : t('addNewUser')}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  resetUserForm();
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')} *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={userForm.first_name}
                    onChange={handleUserFormChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')} *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={userForm.last_name}
                    onChange={handleUserFormChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')} *</label>
                <input
                  type="text"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? t('newPasswordLeaveBlank') : t('password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="input-field"
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={userForm.is_staff}
                    onChange={handleUserFormChange}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('staffAccess')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_superuser"
                    checked={userForm.is_superuser}
                    onChange={handleUserFormChange}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{t('administratorAccess')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingUser ? t('updateUser') : t('createUser')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;