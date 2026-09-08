// src/components/notifications/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, Stethoscope, CheckCircle, Clock, UserPlus, FileText, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios';

const Notifications = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      const data = response.data.results || response.data || [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty array
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`notifications/${id}/mark_read/`);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`notifications/${id}/`);
      // Update local state
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== id)
      );
      if (removed && !removed.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIconForType = (type) => {
    const icons = {
      'appointment_created': Calendar,
      'appointment_updated': Calendar,
      'appointment_cancelled': X,
      'appointment_reminder': Clock,
      'patient_registered': UserPlus,
      'doctor_assigned': Stethoscope,
    };
    return icons[type] || Bell;
  };

  const getColorForType = (type) => {
    const colors = {
      'appointment_created': 'from-blue-500 to-blue-600',
      'appointment_updated': 'from-purple-500 to-purple-600',
      'appointment_cancelled': 'from-red-500 to-red-600',
      'appointment_reminder': 'from-yellow-500 to-yellow-600',
      'patient_registered': 'from-green-500 to-green-600',
      'doctor_assigned': 'from-pink-500 to-pink-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return t('justNow') || 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${t('minutesAgo') || 'minutes ago'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${t('hoursAgo') || 'hours ago'}`;
    } else if (diffInSeconds < 172800) {
      return t('yesterday') || 'Yesterday';
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${t('daysAgo') || 'days ago'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('notifications')}</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 
              ? t('unreadNotifications', { count: unreadCount })
              : t('noUnreadNotifications')}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchNotifications}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              {t('markAllAsRead')}
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('noNotifications')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getIconForType(notification.notification_type);
            const color = getColorForType(notification.notification_type);
            
            return (
              <div 
                key={notification.id} 
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.link && (
                          <a 
                            href={notification.link} 
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium mt-2 inline-block"
                          >
                            {t('viewDetails')}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                          >
                            {t('markAsRead')}
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(notification.created_at)}</span>
                      {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;