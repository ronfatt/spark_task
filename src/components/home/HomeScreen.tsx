import React from 'react';
import { useApp } from '../../context';
import { MetricCards } from './MetricCards';
import { AttentionList } from './AttentionList';
import { RecentProjects } from './RecentProjects';
import { Plus, ArrowRight, Sparkles, Shield, User } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { currentRole, setActiveTab, setSelectedProjectId } = useApp();

  return (
    <div className="p-4 space-y-5">
      {/* 欢迎引导卡片 */}
      <div className="bg-gradient-to-br from-spark-900 via-purple-900 to-slate-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-card">
        {/* 微光特效 */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-spark-500/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-spark-200 border border-white/10">
              {currentRole === 'Admin' ? (
                <>
                  <Shield className="w-3 h-3 text-spark-300" />
                  <span>设计团队管理端</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-purple-300" />
                  <span>客户专属工作台</span>
                </>
              )}
            </span>
            <span className="text-[11px] text-slate-300 font-medium">创意协作中心</span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight leading-tight">
              {currentRole === 'Admin'
                ? '创意设计接单与交付管理'
                : '创意需求提报与物料验收'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentRole === 'Admin'
                ? '受理客户创意需求，同步制作进度，上传高保真预览稿并完成最终交付。'
                : '提交多语种设计需求，实时掌握制作进展，高清预览并验收交付成品。'}
            </p>
          </div>

          <div className="pt-1">
            {currentRole === 'Client' ? (
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('Requests');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 text-spark-600" />
                <span>提报新创意需求</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('Requests');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-spark-600 hover:bg-spark-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-spark-200" />
                <span>查阅待接单需求队列</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 流程看板指标 */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            项目流程指标
          </h3>
        </div>
        <MetricCards />
      </section>

      {/* 待你处理 */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              待办提醒 / 待你处理
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-spark-600">
            {currentRole === 'Client' ? '待我验收' : '团队待办'}
          </span>
        </div>
        <AttentionList />
      </section>

      {/* 最近项目 */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            最近项目
          </h3>
          <button
            onClick={() => {
              setSelectedProjectId(null);
              setActiveTab('Projects');
            }}
            className="text-xs font-semibold text-spark-600 hover:text-spark-700 flex items-center gap-0.5 transition-colors"
          >
            <span>查看全部</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <RecentProjects />
      </section>
    </div>
  );
};
