import React, { useState } from 'react';
import { useApp } from '../../context';
import type { 
  ProjectType, 
  SupportedLanguage, 
  ProjectPriority, 
  CreativeRequestFormData 
} from '../../types';
import { LANGUAGE_CONFIG } from '../../data/initialData';
import { 
  UploadCloud, 
  Check, 
  FileText, 
  Sparkles, 
  X,
  AlertCircle
} from 'lucide-react';

const PROJECT_TYPES: ProjectType[] = [
  '营销广告横幅',
  '社媒创意配图',
  '产品界面 / App',
  '品牌资产 / 规范',
  '视频 / 动态特效',
  '落地页设计',
  '演示提案 / 商业计划书',
  '线下物料 / 周边',
];

const PRIORITIES: { label: ProjectPriority; desc: string; text: string }[] = [
  { label: 'Low', desc: '常规排期', text: '普通' },
  { label: 'Medium', desc: '标准交付', text: '一般' },
  { label: 'High', desc: '优先制作', text: '加急' },
  { label: 'Urgent', desc: '立刻响应', text: '特急' },
];

const ALL_LANGUAGES: SupportedLanguage[] = [
  '英语',
  '中文',
  '越南语',
  '印尼语',
  '韩语',
  '日语',
  '泰语',
];

export const RequestForm: React.FC<{ onSuccess?: (newProjectId: string) => void }> = ({ onSuccess }) => {
  const { submitRequest, setSelectedProjectId, setActiveTab } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ProjectType>('营销广告横幅');
  const [selectedMarkets, setSelectedMarkets] = useState<SupportedLanguage[]>(['中文']);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [referenceFileName, setReferenceFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleMarket = (lang: SupportedLanguage) => {
    if (selectedMarkets.includes(lang)) {
      if (selectedMarkets.length === 1) {
        // 至少保留一个市场
        return;
      }
      setSelectedMarkets(selectedMarkets.filter(m => m !== lang));
    } else {
      setSelectedMarkets([...selectedMarkets, lang]);
    }
  };

  const handleQuickDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().split('T')[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('请输入创意项目标题');
      return;
    }
    if (selectedMarkets.length === 0) {
      setErrorMessage('请至少选择一个目标市场语言');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const formData: CreativeRequestFormData = {
      title: title.trim(),
      type,
      markets: selectedMarkets,
      description: description.trim() || '未附带额外制作补充说明。',
      referenceFileName: referenceFileName || undefined,
      deadline,
      priority,
    };

    const newId = submitRequest(formData);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(newId);
      } else {
        setSelectedProjectId(newId);
        setActiveTab('Projects');
      }
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 需求标题 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          需求标题 <span className="text-spark-600">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="例如：Q4 全球品牌落地大促主视觉 KV 套图"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 transition-all shadow-2xs"
          required
        />
      </div>

      {/* 创意类型 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          创意物料类型
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROJECT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                type === t
                  ? 'bg-spark-50 border-spark-500 text-spark-800 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 目标市场 / 多语言支持 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            目标市场与多语言 <span className="text-spark-600">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            已选择 {selectedMarkets.length} 个语言
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          SparkOne 设计团队支持针对所选各市场进行专属排版与本地化交付。
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ALL_LANGUAGES.map(lang => {
            const isSelected = selectedMarkets.includes(lang);
            const conf = LANGUAGE_CONFIG[lang];
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleMarket(lang)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-spark-600 text-white border-spark-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{conf.flag}</span>
                <span>{conf.label}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 创意描述与制作要求 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          需求描述与创作说明
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="请说明物料尺寸、核心视觉元素、使用场景、品牌偏好或各市场投放规范..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 transition-all shadow-2xs resize-none"
        />
      </div>

      {/* 参考附件上传 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          参考附件 / 视觉物料
        </label>
        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white hover:border-spark-400 transition-colors text-center cursor-pointer group">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {referenceFileName ? (
            <div className="flex items-center justify-between bg-spark-50 px-3 py-2 rounded-xl border border-spark-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-spark-600 shrink-0" />
                <span className="text-xs font-semibold text-spark-900 truncate">
                  {referenceFileName}
                </span>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setReferenceFileName('');
                }}
                className="text-slate-400 hover:text-rose-500 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-spark-100 group-hover:text-spark-600 transition-colors mb-1.5">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                点击上传需求简报、Figma 原型或参考资料
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                支持各类设计稿、文档、图片或压缩包，单文件最大 50MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 交付截止时间 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            交付截止日期
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleQuickDeadline(3)}
              className="text-[11px] font-semibold text-spark-700 bg-spark-50 hover:bg-spark-100 px-2 py-0.5 rounded-md"
            >
              +3天
            </button>
            <button
              type="button"
              onClick={() => handleQuickDeadline(7)}
              className="text-[11px] font-semibold text-spark-700 bg-spark-50 hover:bg-spark-100 px-2 py-0.5 rounded-md"
            >
              +1周
            </button>
            <button
              type="button"
              onClick={() => handleQuickDeadline(14)}
              className="text-[11px] font-semibold text-spark-700 bg-spark-50 hover:bg-spark-100 px-2 py-0.5 rounded-md"
            >
              +2周
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 shadow-2xs"
            required
          />
        </div>
      </div>

      {/* 优先级 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          紧急程度 / 优先级
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPriority(p.label)}
              className={`py-2 px-1 text-center rounded-xl border text-xs transition-all ${
                priority === p.label
                  ? 'bg-spark-600 text-white font-bold border-spark-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.text}
            </button>
          ))}
        </div>
      </div>

      {/* 提交大按钮 */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-spark-600 to-purple-600 hover:from-spark-700 hover:to-purple-700 text-white font-bold text-sm shadow-spark hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-spark-200" />
          <span>{isSubmitting ? '正在提报需求...' : '提交创意设计需求'}</span>
        </button>
      </div>
    </form>
  );
};
