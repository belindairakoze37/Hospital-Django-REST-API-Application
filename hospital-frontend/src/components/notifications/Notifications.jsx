// src/components/notifications/Notifications.jsx
import React from 'react';
import { Bell, Calendar, Users, Stethoscope, CheckCircle, Clock } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      icon: Calendar,
      title: 'Appointment Reminder',
      description: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM',
      time: '2 hours ago',
      color: 'from-blue-500 to-blue-600',
      read: false
    },
    {
      id: 2,
      icon: Users,
      title: 'New Patient Registration',
      description: 'John Doe has been registered as a new patient',
      time: '5 hours ago',
      color: 'from-green-500 to-green-600',
      read: false
    },
    {
      id: 3,
      icon: Stethoscope,
      title: 'Doctor Availability',
      description: 'Dr. Michael Chen is now available for appointments',
      time: '1 day ago',
      color: 'from-purple-500 to-purple-600',
      read: true
    },
    {
      id: 4,
      icon: CheckCircle,
      title: 'Appointment Completed',
      description: 'Appointment with Dr. Emily Brown has been completed',
      time: '2 days ago',
      color: 'from-pink-500 to-pink-600',
      read: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with the latest activities</p>
        </div>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${
              !notification.read ? 'border-l-4 border-primary-500' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${notification.color} flex items-center justify-center flex-shrink-0`}>
                <notification.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2"></span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{notification.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;