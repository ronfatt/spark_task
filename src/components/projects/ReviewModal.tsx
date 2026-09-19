import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, X, AlertTriangle, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approve' | 'request_changes';
  projectTitle: string;
  onConfirmApprove: (note?: string) => void;
  onConfirmRequestChanges: (feedback: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  type,
  projectTitle,
  onConfirmApprove,
  onConfirmRequestChanges,
}) => {
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApprove = () => {
    onConfirmApprove(note.trim() || undefined);
    onClose();
  };

  const handleRequestChanges = () => {
    if (!feedback.trim()) {
      setError('请填写需要调整或修改的具体要求。');
      return;
    }
    onConfirmRequestChanges(feedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {type === 'approve' ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                确认通过设计交付验收
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                确认验收并结项 <strong className="text-slate-800 font-semibold">《{projectTitle}》</strong>。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                验收附言（可选）
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例如：设计质量很高，已符合全渠道上线标准！"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>确认审核通过</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                提出修改意见
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                项目状态将返回至 <span className="font-semibold text-amber-700">制作中</span>，由 SparkOne 设计师针对性迭代。
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                具体修改要求与反馈 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => {
                  setFeedback(e.target.value);
                  if (error) setError('');
                }}
                placeholder="请详细列出调整点（例如：优化日文版文案间距、微调卡面光泽度、更新品牌联名排版）..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleRequestChanges}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
              >
                提交修改意见
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
