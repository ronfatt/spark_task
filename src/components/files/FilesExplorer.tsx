import React, { useState } from 'react';
import { useApp } from '../../context';
import type { FileCategory, SupportedLanguage, ProjectAsset } from '../../types';
import { MarketPill } from '../common/MarketPill';
import { 
  Folder, 
  Search, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  Sparkles,
  Shield,
  Briefcase,
  Layers,
  Megaphone,
  Presentation,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES: { id: FileCategory | 'All'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'All', label: '全部文件', icon: Layers },
  { id: '品牌规范', label: '品牌规范', icon: Shield },
  { id: '企业物料', label: '企业物料', icon: Briefcase },
  { id: '产品界面', label: '产品界面', icon: Layers },
  { id: '营销推广', label: '营销推广', icon: Megaphone },
  { id: '演示提案', label: '演示提案', icon: Presentation },
  { id: '交付成品', label: '交付成品', icon: CheckCircle2 },
];

const LANGUAGES: (SupportedLanguage | 'All')[] = [
  'All',
  '中文',
  '英语',
  '越南语',
  '印尼语',
  '韩语',
  '日语',
  '泰语',
];

export const FilesExplorer: React.FC = () => {
  const { projects } = useApp();

  const [activeCategory, setActiveCategory] = useState<FileCategory | 'All'>('All');
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // 聚合所有项目中的物料资产
  const allAssets: (ProjectAsset & { projectTitle: string; projectId: string })[] = [];
  projects.forEach(p => {
    p.assets.forEach(a => {
      allAssets.push({
        ...a,
        projectTitle: p.title,
        projectId: p.id,
      });
    });
  });

  const filteredAssets = allAssets.filter(asset => {
    if (activeCategory !== 'All' && asset.category !== activeCategory) {
      return false;
    }
    if (activeLanguage !== 'All') {
      if (!asset.languages || !asset.languages.includes(activeLanguage)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchProject = asset.projectTitle.toLowerCase().includes(q);
      if (!matchName && !matchProject) return false;
    }
    return true;
  });

  const handleDownload = (name: string) => {
    setDownloadToast(`正在打包下载《${name}》...`);
    setTimeout(() => {
      setDownloadToast(`已成功下载：${name}`);
      setTimeout(() => setDownloadToast(null), 2000);
    }, 800);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'figma':
        return <Sparkles className="w-4 h-4 text-spark-600" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 浮动下载提示 */}
      {downloadToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Download className="w-3.5 h-3.5 text-spark-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* 标题栏 */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          创意资产中心
        </h2>
        <p className="text-xs text-slate-500">
          查阅品牌规范、产品界面组件、营销广告包以及已交付成品
        </p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="按物料文件名或所属项目搜索..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 shadow-2xs"
        />
      </div>

      {/* 6 大核心分类滚动条 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'All'
            ? allAssets.length
            : allAssets.filter(a => a.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isActive
                  ? 'bg-spark-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
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

      {/* 市场语言筛选 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          所属市场:
        </span>
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLanguage(lang)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shrink-0 ${
              activeLanguage === lang
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'All' ? '全部市场' : lang}
          </button>
        ))}
      </div>

      {/* 文件列表 */}
      <div className="space-y-2.5">
        {filteredAssets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-soft">
            <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">未找到相关物料文件</p>
            <p className="text-xs text-slate-400 mt-1">
              请尝试切换上方分类或清除语言筛选。
            </p>
          </div>
        ) : (
          filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-md hover:border-slate-200 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getFileIcon(asset.type)}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {asset.category}
                    </span>
                    {asset.isFinal && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                        最终交付稿
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {asset.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{asset.size}</span>
                    <span>•</span>
                    <span className="truncate">{asset.projectTitle}</span>
                  </div>
                </div>
              </div>

              {/* 下载动作与语言标签 */}
              <div className="flex items-center gap-2 shrink-0">
                {asset.languages && asset.languages.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {asset.languages.slice(0, 2).map(l => (
                      <MarketPill key={l} language={l} size="sm" />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleDownload(asset.name)}
                  className="p-2.5 rounded-xl bg-spark-50 hover:bg-spark-600 text-spark-700 hover:text-white transition-all shadow-2xs group-hover:shadow-xs"
                  title="下载物料源文件"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
