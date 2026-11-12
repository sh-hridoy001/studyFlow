import React from 'react';
import { useStudy } from '../context/StudyContext';
import { ActiveMainTab } from '../types';
import { Clock, CheckSquare, Moon, Target, Calendar } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, todaySalahCount, setSelectedFolderId } = useStudy();

  const handleTabClick = (tab: ActiveMainTab) => {
    setSelectedFolderId(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{
    id: ActiveMainTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'routine',
      label: 'Home',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'salah',
      label: 'Salah',
      icon: <Moon className="w-5 h-5" />,
      badge: `${todaySalahCount}/5`,
    },
    {
      id: 'milestones',
      label: 'Goals',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-[#12131b]/95 backdrop-blur-md border-t border-[#222434] py-2 px-3 sm:px-6 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-[#ff4757] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Pill Glow */}
              {isActive && (
                <span className="absolute -top-2 w-6 h-1 rounded-full bg-[#ff4757] shadow-sm shadow-[#ff4757]" />
              )}

              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-black leading-none">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 font-semibold truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
