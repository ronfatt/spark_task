import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  X, 
  RefreshCw, 
  Key, 
  Link as LinkIcon, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Code
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig 
} from '../../lib/supabase';
import { useApp } from '../../context';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { isCloudConnected, isSyncing, refreshProjects, reconnectCloud } = useApp();

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setMessage({ text: '请填写完整的 Supabase Project URL 和 anon key', type: 'error' });
      return;
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      setMessage({ text: 'URL 格式不正确，应以 https:// 开头', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      await reconnectCloud();
      setMessage({ text: '配置已保存，已成功连接到 Supabase 云端！', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMessage({ text: `连接失败: ${err.message || '请检查配置'}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('确定清除云端配置并切回本地离线模式吗？')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      await reconnectCloud();
      setMessage({ text: '已切换为本地离线模式', type: 'success' });
    }
  };

  const handleManualSync = async () => {
    setIsSaving(true);
    try {
      await refreshProjects();
      setMessage({ text: '已从 Supabase 成功同步最新数据！', type: 'success' });
    } catch {
      setMessage({ text: '同步失败，请检查网络或密钥', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 头部状态 */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            isCloudConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {isCloudConnected ? <CloudCheck className="w-6 h-6" /> : <Cloud className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Supabase 云端数据库</span>
              {isCloudConnected ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  已连接
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  本地演示
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              存储所有项目资料、设计效果图、高清视频与交付资产
            </p>
          </div>
        </div>

        {/* 提示消息 */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
            message.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSaveAndConnect} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-spark-600" />
              <span>Project URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xxxxxxxx.supabase.co"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-spark-600" />
              <span>Anon Public Key</span>
            </label>
            <textarea
              rows={2}
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 resize-none"
            />
          </div>

          {/* 快速提示与SQL说明 */}
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-spark-800">
              <Code className="w-3.5 h-3.5" />
              <span>数据库与存储桶初始化说明</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-slate-500">
              已为您生成了 <span className="font-mono font-bold text-spark-700">supabase_schema.sql</span> 脚本，在 Supabase 控制台的 SQL Editor 中粘贴运行即可自动创建项目表、实时广播以及 <span className="font-mono text-spark-700">spark-previews / spark-deliverables / spark-references</span> 存储桶。
            </p>
          </div>

          {/* 按钮群 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-spark-600 hover:bg-spark-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-spark-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>保存并连接</span>
            </button>

            {isCloudConnected && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                title="立即从 Supabase 拉取最新数据"
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-spark-600' : ''}`} />
                <span>刷新</span>
              </button>
            )}

            {isCloudConnected && (
              <button
                type="button"
                onClick={handleClear}
                title="清除配置切回本地"
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <CloudOff className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
