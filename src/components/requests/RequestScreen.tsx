import React, { useState } from 'react';
import { useApp } from '../../context';
import { RequestForm } from './RequestForm';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { MarketPill } from '../common/MarketPill';
import { Plus, ListFilter, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

export const RequestScreen: React.FC = () => {
  const { projects, currentRole, acceptProject, setSelectedProjectId, setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'queue'>('create');

  const requestedProjects = projects.filter(p => p.status === 'Requested');

  return (
    <div className="p-4 space-y-4">
      {/* 标题栏与子标签切换 */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            创意需求提报
          </h2>
          <p className="text-xs text-slate-500">
            {currentRole === 'Client'
              ? '提交新创意设计简报或跟进已提报需求'
              : '查阅客户提报的创意需求并接单排期'}
          </p>
        </div>

        {/* 切换药丸 */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'create'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建</span>
          </button>
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'queue'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>队列 ({requestedProjects.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
          <RequestForm
            onSuccess={newId => {
              setSelectedProjectId(newId);
              setActiveTab('Projects');
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {requestedProjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">当前没有等待接单的需求</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                所有创意需求均已被设计团队接单并进入制作排期。
              </p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-4 px-4 py-2 rounded-xl bg-spark-600 text-white text-xs font-semibold hover:bg-spark-700 transition-colors"
              >
                提报新需求
              </button>
            </div>
          ) : (
            requestedProjects.map(project => (
              <div
                key={project.id}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft space-y-3 hover:border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {project.id}
                      </span>
                      <PriorityBadge priority={project.priority} />
                      <span className="text-[11px] font-medium text-slate-500">
                        {project.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {project.title}
                    </h4>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {project.description}
                </p>

                {/* 市场与截止时间 */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 flex-wrap">
                    {project.markets.map(m => (
                      <MarketPill key={m} language={m} size="sm" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>截止 {project.deadline}</span>
                  </div>
                </div>

                {/* 角色专属操作 */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {currentRole === 'Admin' ? (
                    <button
                      onClick={() => acceptProject(project.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-spark-600 hover:bg-spark-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
                    >
                      接单并开展工作
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setActiveTab('Projects');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span>查看需求详情</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
