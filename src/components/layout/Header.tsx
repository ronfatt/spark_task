import React, { useState } from 'react';
import { useApp } from '../../context';
import { 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  X, 
  LogOut,
  Eye,
  Cloud
} from 'lucide-react';
import { CloudSyncModal } from '../common/CloudSyncModal';

export const Header: React.FC = () => {
  const { 
    currentRole, 
    setRole, 
    isAdminUnlocked, 
    unlockAdmin, 
    lockAdmin, 
    phoneFrameEnabled, 
    setPhoneFrameEnabled, 
    resetToDemoData,
    setSelectedProjectId,
    setActiveTab,
    isCloudConnected
  } = useApp();

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = unlockAdmin(pinInput.trim() || '8888');
    if (success) {
      setShowAdminLoginModal(false);
      setPinInput('');
      setLoginError('');
    } else {
      setLoginError('管理密码不正确，默认密码为 8888');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* 品牌名称与标志 (点击可返回首页，若为客户点击长按/提示可验证管理员) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setSelectedProjectId(null);
                setActiveTab('Home');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform shrink-0 border border-slate-100 bg-indigo-600 flex items-center justify-center">
                <img src="/logo.png" alt="SparkOne Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight">SparkOne</span>
                  <span className="text-[10px] font-extrabold tracking-wider bg-spark-100 text-spark-700 px-1.5 py-0.5 rounded">
                    {isAdminUnlocked && currentRole === 'Admin' ? '管理后台' : '设计协作'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                  {isAdminUnlocked && currentRole === 'Admin' ? '设计排期与接单系统' : '客户专属交付中心'}
                </p>
              </div>
            </button>
          </div>

          {/* 右侧功能控制区 */}
          <div className="flex items-center gap-1.5">
            {/* 电脑外框/全屏切换 */}
            <button
              onClick={() => setPhoneFrameEnabled(!phoneFrameEnabled)}
              title={phoneFrameEnabled ? "切换至宽屏展示" : "切换至手机真机外框"}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {phoneFrameEnabled ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* 重置演示数据 */}
            <button
              onClick={() => {
                if (window.confirm('确定将所有项目恢复为初始演示数据吗？')) {
                  resetToDemoData();
                }
              }}
              title="恢复初始演示数据"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Supabase 云端状态与连接入口 */}
            <button
              onClick={() => setShowCloudModal(true)}
              title={isCloudConnected ? "Supabase 云端：已连接 (点击管理)" : "配置 Supabase 云端数据库与存储"}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition-colors ${
                isCloudConnected 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-600' : ''}`} />
              {isCloudConnected && <span className="hidden sm:inline text-[10px] font-bold">云端</span>}
            </button>

            {/* 管理员专属控制区（仅当我解锁后可见，普通顾客绝对看不到管理员选项） */}
            {isAdminUnlocked ? (
              <div className="flex items-center gap-1 bg-purple-50 border border-purple-200/80 p-1 rounded-2xl shadow-2xs">
                {currentRole === 'Admin' ? (
                  <>
                    <span className="hidden md:inline text-[10px] font-bold text-spark-700 px-1.5">
                      管理端
                    </span>
                    <button
                      onClick={() => setRole('Client')}
                      title="切换为客户视角体验"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs border border-slate-200/60 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-spark-600" />
                      <span>客户视角</span>
                    </button>
                    <button
                      onClick={lockAdmin}
                      title="退出管理模式并完全隐藏"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setRole('Admin')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-spark-600 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>返回管理端</span>
                    </button>
                    <button
                      onClick={lockAdmin}
                      title="退出管理后台"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* 顾客视角：没有任何管理员角色切换器，仅保留一个隐蔽的管理认证锁图标 */
              <button
                onClick={() => setShowAdminLoginModal(true)}
                title="内部管理入口"
                className="opacity-20 hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-spark-600 hover:bg-spark-50 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 管理员验证弹窗（仅通过点击隐蔽入口触发） */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => {
                setShowAdminLoginModal(false);
                setLoginError('');
                setPinInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-spark-100 text-spark-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                管理人员身份验证
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                此入口仅供 SparkOne 创意管理团队接单排期使用，普通顾客无须访问。
              </p>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-semibold text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                {loginError}
              </p>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  管理访问密码
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="默认密码：8888"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 text-center"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-spark-600 hover:bg-spark-700 text-white font-bold text-xs shadow-md shadow-spark-600/20 transition-all"
                >
                  验证进入管理端
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminLogin()}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
                >
                  一键快速进入（演示测试）
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase 云端配置弹窗 */}
      <CloudSyncModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
      />
    </>
  );
};
