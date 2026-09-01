// src/components/dashboard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, bg }) => {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 bg-gradient-to-r ${color} text-transparent bg-clip-text`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs text-green-500">
        <TrendingUp className="w-3 h-3" />
        <span>12% increase from last month</span>
      </div>
    </div>
  );
};

export default StatsCard;