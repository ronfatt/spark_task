import React from 'react';
import { useApp } from '../../context';
import type { NavTab } from '../../types';
import { Home, PlusCircle, FolderKanban, FolderArchive } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedProjectId, projects, currentRole } = useApp();

  // Badges
  const requestedCount = projects.filter(p => p.status === 'Requested').length;
  const reviewCount = projects.filter(p => p.status === 'Review').length;

  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'Home', label: '首页', icon: Home },
    { 
      id: 'Requests', 
      label: '需求', 
      icon: PlusCircle, 
      badge: currentRole === 'Admin' && requestedCount > 0 ? requestedCount : undefined 
    },
    { 
      id: 'Projects', 
      label: '项目', 
      icon: FolderKanban, 
      badge: reviewCount > 0 ? reviewCount : undefined 
    },
    { id: 'Files', label: '文件', icon: FolderArchive },
  ];

  const handleTabClick = (tabId: NavTab) => {
    setSelectedProjectId(null);
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 max-w-md mx-auto shadow-lg pb-safe">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full py-1 text-center transition-all ${
                isActive ? 'text-spark-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight font-medium ${isActive ? 'text-spark-700 font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-spark-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
