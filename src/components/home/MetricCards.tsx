import React from 'react';
import { useApp } from '../../context';
import { FilePlus2, Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ProjectStatus } from '../../types';

interface MetricCardsProps {
  onSelectStatusFilter?: (status: ProjectStatus) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onSelectStatusFilter }) => {
  const { projects, setActiveTab } = useApp();

  const isFinished = (p: { status: string; progress: number }) => p.status === 'Completed' || p.progress >= 100;

  const counts = {
    Requested: projects.filter(p => p.status === 'Requested' && !isFinished(p)).length,
    Working: projects.filter(p => p.status === 'Working' && !isFinished(p)).length,
    Review: projects.filter(p => p.status === 'Review' && !isFinished(p)).length,
    Completed: projects.filter(p => isFinished(p)).length,
  };

  const handleCardClick = (status: ProjectStatus) => {
    if (onSelectStatusFilter) {
      onSelectStatusFilter(status);
    }
    setActiveTab('Projects');
  };

  const cards = [
    {
      title: '新需求',
      count: counts.Requested,
      status: 'Requested' as ProjectStatus,
      icon: FilePlus2,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      badge: '待接单',
    },
    {
      title: '制作中',
      count: counts.Working,
      status: 'Working' as ProjectStatus,
      icon: Flame,
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      badge: '进行中',
    },
    {
      title: '待审核',
      count: counts.Review,
      status: 'Review' as ProjectStatus,
      icon: AlertCircle,
      accent: 'text-spark-600 bg-spark-50 border-spark-200 ring-1 ring-spark-200/50',
      badge: '待验收',
      highlight: true,
    },
    {
      title: '已完成',
      count: counts.Completed,
      status: 'Completed' as ProjectStatus,
      icon: CheckCircle2,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      badge: '已交付',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            onClick={() => handleCardClick(card.status)}
            className={`flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-md hover:border-slate-200 transition-all text-left group active:scale-[0.98] ${
              card.highlight ? 'relative overflow-hidden' : ''
            }`}
          >
            {card.highlight && card.count > 0 && (
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-spark-500/10 rounded-full blur-sm pointer-events-none" />
            )}

            <div className="flex items-center justify-between w-full mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                {card.badge}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {card.count}
                </span>
                <span className="text-[11px] font-medium text-slate-400">项</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{card.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
