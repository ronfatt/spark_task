import React from 'react';
import { useApp } from '../../context';
import { Sparkles, ArrowRight, CheckCircle, Clock, FileQuestion } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { MarketPill } from '../common/MarketPill';

export const AttentionList: React.FC = () => {
  const { projects, currentRole, setSelectedProjectId, setActiveTab, acceptProject } = useApp();

  // 根据当前角色判定待办提醒项
  const attentionItems = projects.filter(project => {
    if (currentRole === 'Client') {
      // 客户需处理处于【待审核】状态的项目，以及刚提交待接单的【新需求】
      return project.status === 'Review' || project.status === 'Requested';
    } else {
      // 管理员需接单【待接单】项目或处理【制作中且特急】项目
      return project.status === 'Requested' || (project.status === 'Working' && project.priority === 'Urgent');
    }
  }).slice(0, 3);

  if (attentionItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft text-center py-6">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-800">全部处理完毕！</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentRole === 'Client'
            ? '当前暂无需要您验收审核的物料。'
            : '当前暂无待接单的新创意需求或需紧急响应的项目。'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {attentionItems.map(project => {
        const isClientReview = currentRole === 'Client' && project.status === 'Review';
        const isClientRequested = currentRole === 'Client' && project.status === 'Requested';
        const isAdminRequested = currentRole === 'Admin' && project.status === 'Requested';

        return (
          <div
            key={project.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              isClientReview
                ? 'bg-gradient-to-br from-purple-50/70 via-white to-purple-50/40 border-purple-200/90 shadow-soft ring-1 ring-purple-100'
                : isClientRequested || isAdminRequested
                ? 'bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 border-indigo-100 shadow-soft'
                : 'bg-white border-slate-100 shadow-soft hover:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 font-mono">{project.id}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-700">{project.type}</span>
              </div>
              <StatusBadge status={project.status} size="sm" />
            </div>

            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
              {project.title}
            </h4>

            {/* 提示文案 */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
              {isClientReview ? (
                <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-spark-600 shrink-0" />
                  预览稿已就绪，请验收审核并确认！
                </span>
              ) : isClientRequested ? (
                <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                  <FileQuestion className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  新需求已提报，设计团队正在接单排期中
                </span>
              ) : isAdminRequested ? (
                <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                  <FileQuestion className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  客户新提交需求，等待设计团队接单排期。
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  特急需求，目标交付时间：{project.deadline}
                </span>
              )}
            </div>

            {/* 市场语言与操作按钮 */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
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

              {/* 动作按钮 */}
              <div className="flex items-center gap-1.5">
                {isAdminRequested ? (
                  <button
                    onClick={() => {
                      acceptProject(project.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-spark-600 hover:bg-spark-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>接单并开始</span>
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setActiveTab('Projects');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                    isClientReview
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{isClientReview ? '立即审核' : '查看详情'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
