import React from 'react';
import type { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<ProjectStatus, { bg: string; text: string; dot: string; label: string }> = {
    Requested: {
      bg: 'bg-indigo-50 border-indigo-200/80',
      text: 'text-indigo-700 font-semibold',
      dot: 'bg-indigo-500',
      label: '待接单',
    },
    Working: {
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-700 font-semibold',
      dot: 'bg-amber-500 animate-pulse',
      label: '制作中',
    },
    Review: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700 font-bold',
      dot: 'bg-purple-600 ring-2 ring-purple-300 animate-ping',
      label: '待审核',
    },
    Completed: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700 font-semibold',
      dot: 'bg-emerald-500',
      label: '已完成',
    },
    'On Hold': {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600 font-medium',
      dot: 'bg-slate-400',
      label: '暂搁置',
    },
  };

  const current = styles[status] || styles.Requested;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm tracking-tight ${current.bg} ${current.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
