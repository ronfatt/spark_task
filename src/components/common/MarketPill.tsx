import React from 'react';
import type { SupportedLanguage } from '../../types';
import { LANGUAGE_CONFIG } from '../../data/initialData';

interface MarketPillProps {
  language: SupportedLanguage;
  size?: 'sm' | 'md';
}

export const MarketPill: React.FC<MarketPillProps> = ({ language, size = 'md' }) => {
  const config = LANGUAGE_CONFIG[language] || { code: '🌐', label: language, flag: '🌐' };

  if (size === 'sm') {
    return (
      <span 
        title={config.label}
        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200/60 transition-colors"
      >
        <span>{config.flag}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span 
      className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs"
    >
      <span className="text-sm leading-none">{config.flag}</span>
      <span>{config.label}</span>
    </span>
  );
};
