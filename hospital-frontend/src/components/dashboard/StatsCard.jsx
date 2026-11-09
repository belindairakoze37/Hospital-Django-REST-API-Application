// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const StatsCard = ({ title, value, icon: Icon, color, bg }) => {
  const { t } = useLanguage();
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
        {/* TODO(native review): the 12% figure is static demo copy, not real data. */}
        <span>{t('statIncreaseFromLastMonth', { percent: 12 })}</span>
      </div>
    </div>
  );
};

export default StatsCard;