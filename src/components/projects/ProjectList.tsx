import React, { useState } from 'react';
import { useApp } from '../../context';
import type { ProjectStatus, SupportedLanguage } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MarketPill } from '../common/MarketPill';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProjectDetail } from './ProjectDetail';
import { Search, Calendar, ChevronRight } from 'lucide-react';

const ALL_LANGUAGES: (SupportedLanguage | 'All')[] = [
  'All',
  '中文',
  '英语',
  '越南语',
  '印尼语',
  '韩语',
  '日语',
  '泰语',
];

export const ProjectList: React.FC<{ initialStatusFilter?: ProjectStatus | 'All' }> = ({
  initialStatusFilter = 'All',
}) => {
  const { projects, selectedProjectId, setSelectedProjectId } = useApp();

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<SupportedLanguage | 'All'>('All');

  // 若已选中项目，则渲染详情页
  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  const statuses: { id: ProjectStatus | 'All'; label: string }[] = [
    { id: 'All', label: '全部' },
    { id: 'Working', label: '制作中' },
    { id: 'Review', label: '待审核' },
    { id: 'Requested', label: '待接单' },
    { id: 'Completed', label: '已完成' },
    { id: 'On Hold', label: '暂搁置' },
  ];

  const filteredProjects = projects.filter(project => {
    // 状态筛选
    if (statusFilter !== 'All' && project.status !== statusFilter) {
      return false;
    }
    // 市场语言筛选
    if (selectedMarketFilter !== 'All' && !project.markets.includes(selectedMarketFilter)) {
      return false;
    }
    // 搜索查询
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchId = project.id.toLowerCase().includes(q);
      const matchType = project.type.toLowerCase().includes(q);
      const matchMarket = project.markets.some(m => m.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchType && !matchMarket) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    // 满足 status === 'Completed' 或 progress >= 100 均视作已完成，自动沉底，未完成的始终排在前面
    const aDone = a.status === 'Completed' || a.progress >= 100;
    const bDone = b.status === 'Completed' || b.progress >= 100;
    if (aDone !== bDone) {
      return aDone ? 1 : -1;
    }
    // 相同状态按最新更新/创建时间倒序排
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="p-4 space-y-4">
      {/* 标题栏 */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          创意项目看板
        </h2>
        <p className="text-xs text-slate-500">
          跟踪创意制作进度，查阅交付初稿，完成审核与物料归档
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索项目名称、编号（如 SPK-1092）或创意类型..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 shadow-2xs"
        />
      </div>

      {/* 状态分类药丸滚动条 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {statuses.map(status => {
          const count = status.id === 'All'
            ? projects.length
            : projects.filter(p => p.status === status.id).length;

          const isActive = statusFilter === status.id;

          return (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isActive
                  ? 'bg-spark-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{status.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 语言过滤栏 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          市场语言:
        </span>
        {ALL_LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedMarketFilter(lang)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              selectedMarketFilter === lang
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {lang === 'All' ? '全部市场' : lang}
          </button>
        ))}
      </div>

      {/* 项目卡片列表 */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-soft">
            <p className="text-sm font-bold text-slate-800">未找到符合条件的项目</p>
            <p className="text-xs text-slate-400 mt-1">
              请尝试修改搜索词或重置状态筛选。
            </p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const isProjectDone = project.status === 'Completed' || project.progress >= 100;
            const effectiveStatus = isProjectDone ? 'Completed' : project.status;
            const isNeedsReview = project.status === 'Review';

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer group shadow-soft hover:shadow-md ${
                  isNeedsReview
                    ? 'border-purple-200 ring-1 ring-purple-100/80'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* 顶部行 */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {project.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {project.type}
                    </span>
                    <PriorityBadge priority={project.priority} />
                  </div>
                  <StatusBadge status={effectiveStatus} size="sm" />
                </div>

                {/* 标题 */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-spark-700 transition-colors line-clamp-1 mb-1.5">
                  {project.title}
                </h3>

                {/* 最新动态摘要 */}
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  {project.latestUpdate}
                </p>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className="text-slate-400">制作进度</span>
                    <span className={isProjectDone ? 'text-emerald-600 font-bold' : 'text-slate-700 font-bold'}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isProjectDone
                          ? 'bg-emerald-500'
                          : project.status === 'Review'
                          ? 'bg-purple-600'
                          : 'bg-spark-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* 底部信息：市场语言与截止时间 */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {project.markets.slice(0, 3).map(m => (
                      <MarketPill key={m} language={m} size="sm" />
                    ))}
                    {project.markets.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        +{project.markets.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>截止 {project.deadline}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-spark-600 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
