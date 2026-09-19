import React from 'react';
import type { ProjectPriority } from '../../types';

interface PriorityBadgeProps {
  priority: ProjectPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const styles: Record<ProjectPriority, { bg: string; text: string; label: string }> = {
    Urgent: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700 font-bold', label: '特急' },
    High: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700 font-semibold', label: '加急' },
    Medium: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: '普通' },
    Low: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: '较低' },
  };

  const style = styles[priority] || styles.Medium;

  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};
