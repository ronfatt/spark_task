import React from 'react';
import { useApp } from '../../context';
import { StatusBadge } from '../common/StatusBadge';
import { MarketPill } from '../common/MarketPill';
import { Calendar, ChevronRight } from 'lucide-react';

export const RecentProjects: React.FC = () => {
  const { projects, setSelectedProjectId, setActiveTab } = useApp();

  const recent = projects.slice(0, 5);

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveTab('Projects');
  };

  return (
    <div className="space-y-3">
      {recent.map(project => {
        return (
          <div
            key={project.id}
            onClick={() => handleOpenProject(project.id)}
            className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group active:scale-[0.99]"
          >
            {/* Top row: ID, Type, Status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {project.id}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {project.type}
                </span>
              </div>
              <StatusBadge status={project.status} size="sm" />
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-spark-700 transition-colors line-clamp-1 mb-2">
              {project.title}
            </h4>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className="text-slate-400">制作进度</span>
                <span className={project.progress === 100 ? 'text-emerald-600 font-bold' : 'text-slate-700'}>
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    project.status === 'Completed'
                      ? 'bg-emerald-500'
                      : project.status === 'Review'
                      ? 'bg-purple-600'
                      : 'bg-spark-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Meta row: Markets, Deadline */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              {/* Markets */}
              <div className="flex items-center gap-1 flex-wrap">
                {project.markets.slice(0, 3).map(m => (
                  <MarketPill key={m} language={m} size="sm" />
                ))}
                {project.markets.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    +{project.markets.length - 3}
                  </span>
                )}
              </div>

              {/* Deadline & Chevron */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>截止 {project.deadline}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-spark-600 transition-all" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
