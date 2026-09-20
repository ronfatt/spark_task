import React, { useState } from 'react';
import { useApp } from '../../context';
import type { ProjectStatus, FileCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { MarketPill } from '../common/MarketPill';
import { ReviewModal } from './ReviewModal';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Download, 
  Send, 
  FileText, 
  ExternalLink,
  Sliders,
  Check,
  Eye,
  X,
  UploadCloud,
  Film,
  Trash2
} from 'lucide-react';

const STATUS_OPTIONS: { id: ProjectStatus; label: string }[] = [
  { id: 'Requested', label: '待接单' },
  { id: 'Working', label: '制作中' },
  { id: 'Review', label: '待审核' },
  { id: 'Completed', label: '已完成' },
  { id: 'On Hold', label: '暂搁置' },
];

const DELIVERABLE_CATEGORIES: FileCategory[] = [
  '交付成品',
  '品牌规范',
  '企业物料',
  '产品界面',
  '营销推广',
  '演示提案'
];

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
};

export const ProjectDetail: React.FC<{ projectId: string; onBack: () => void }> = ({
  projectId,
  onBack,
}) => {
  const { 
    projects, 
    currentRole, 
    updateProjectProgress, 
    updateProjectStatus, 
    uploadPreview,
    uploadPreviewFile,
    uploadAssetToProject,
    approveProject, 
    requestChanges, 
    addComment,
    deleteProject
  } = useApp();

  const project = projects.find(p => p.id === projectId);

  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'request_changes';
  }>({ isOpen: false, type: 'approve' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [customUploadModal, setCustomUploadModal] = useState(false);
  const [previewUploadTab, setPreviewUploadTab] = useState<'file' | 'url'>('file');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const [previewInputUrl, setPreviewInputUrl] = useState('');
  const [previewInputTitle, setPreviewInputTitle] = useState('');
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);

  // 交付成品物料上传状态
  const [assetUploadModal, setAssetUploadModal] = useState(false);
  const [selectedAssetFile, setSelectedAssetFile] = useState<File | null>(null);
  const [assetCategory, setAssetCategory] = useState<FileCategory>('交付成品');
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);

  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-semibold text-slate-500">未找到该项目。</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-spark-600 text-white rounded-xl text-xs font-semibold"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  // 计算交付截止日剩余天数
  const calculateDeadlineRemaining = (deadlineStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(deadlineStr);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: `已逾期 ${Math.abs(diffDays)} 天`, urgent: true };
      if (diffDays === 0) return { label: '今天截止', urgent: true };
      if (diffDays === 1) return { label: '明天截止', urgent: true };
      return { label: `剩余 ${diffDays} 天交付`, urgent: diffDays <= 2 };
    } catch {
      return { label: deadlineStr, urgent: false };
    }
  };

  const deadlineInfo = calculateDeadlineRemaining(project.deadline);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(project.id, commentInput.trim());
    setCommentInput('');
  };

  const handleDownload = (fileName: string) => {
    setDownloadToast(`正在打包下载 ${fileName}...`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 2500);
  };

  const handleSavePreviewUpload = async () => {
    setIsUploadingPreview(true);
    try {
      if (previewUploadTab === 'file' && selectedPreviewFile) {
        await uploadPreviewFile(project.id, selectedPreviewFile, previewInputTitle.trim() || selectedPreviewFile.name);
      } else {
        const url = previewInputUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
        const title = previewInputTitle.trim() || '创意初稿设计预览.png';
        uploadPreview(project.id, url, title, true);
      }
      setCustomUploadModal(false);
      setSelectedPreviewFile(null);
      setPreviewInputUrl('');
      setPreviewInputTitle('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingPreview(false);
    }
  };

  const handleSaveAssetUpload = async () => {
    if (!selectedAssetFile) return;
    setIsUploadingAsset(true);
    try {
      await uploadAssetToProject(project.id, selectedAssetFile, assetCategory, project.markets);
      setAssetUploadModal(false);
      setSelectedAssetFile(null);
      setDownloadToast(`《${selectedAssetFile.name}》已成功上传归档至云端！`);
      setTimeout(() => setDownloadToast(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingAsset(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-12">
      {/* 浮动下载提示 */}
      {downloadToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Download className="w-3.5 h-3.5 text-spark-400 animate-bounce" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* 顶部返回导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回项目</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400">
            {project.id}
          </span>
          <PriorityBadge priority={project.priority} />
          {currentRole === 'Admin' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5"
              title="删除该项目"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 项目头部卡片 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-spark-600 uppercase tracking-wider">
              {project.type}
            </span>
            <h1 className="text-lg font-extrabold text-slate-900 leading-snug mt-0.5">
              {project.title}
            </h1>
          </div>

          {/* 状态徽章与管理员状态切换菜单 */}
          <div className="relative shrink-0">
            {currentRole === 'Admin' ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="group focus:outline-none"
                  title="点击切换项目状态"
                >
                  <StatusBadge status={project.status} size="md" />
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-9 w-36 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-100 z-40 space-y-0.5 animate-in fade-in">
                    <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      修改当前状态
                    </p>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          updateProjectStatus(project.id, opt.id);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                          project.status === opt.id
                            ? 'bg-spark-50 text-spark-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {project.status === opt.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <StatusBadge status={project.status} size="md" />
            )}
          </div>
        </div>

        {/* 进度百分比与快速调节 */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>制作交付进度</span>
            </span>
            <span className={`font-mono font-bold text-sm ${project.progress === 100 ? 'text-emerald-600' : 'text-spark-600'}`}>
              {project.progress}%
            </span>
          </div>

          {/* 可视化进度条 */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.status === 'Completed'
                  ? 'bg-emerald-500'
                  : project.status === 'Review'
                  ? 'bg-purple-600'
                  : 'bg-spark-500'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>

          {/* 管理员快捷调整进度按钮 */}
          {currentRole === 'Admin' && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">管理员快捷调整:</span>
              {[25, 50, 75, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateProjectProgress(project.id, val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                    project.progress === val
                      ? 'bg-spark-600 text-white border-spark-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 需求说明卡片 */}
        {project.description && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/80 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* 关键元数据（截止日期 & 负责人） */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 截止时间 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">交付截止日</span>
          </div>
          <p className="text-xs font-bold text-slate-900">{project.deadline}</p>
          <span className={`inline-block text-[10px] font-semibold mt-0.5 ${
            deadlineInfo.urgent ? 'text-rose-600 font-bold' : 'text-slate-400'
          }`}>
            {deadlineInfo.label}
          </span>
        </div>

        {/* 负责人 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <User className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Spark 负责人</span>
          </div>
          <p className="text-xs font-bold text-slate-900 truncate">{project.owner}</p>
          <span className="inline-block text-[10px] font-medium text-slate-400 mt-0.5 truncate">
            业务方: {project.clientName}
          </span>
        </div>
      </div>

      {/* 市场多语言与本地化进度矩阵 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
            目标市场与多语言本地化矩阵 ({project.markets.length})
          </span>
          <span className="text-[10px] text-slate-400">各语种交付排期</span>
        </div>

        {/* 多语言详细进度状态列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {project.markets.map(m => {
            const isFinished = project.assets.some(a => a.isFinal && a.languages?.includes(m));
            const isInProgress = !isFinished && (
              project.assets.some(a => !a.isFinal && a.languages?.includes(m)) ||
              (m === '韩语' && (project.latestUpdate.includes('韩') || project.description.includes('韩')))
            );

            return (
              <div 
                key={m}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isFinished 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                    : isInProgress
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950 ring-1 ring-amber-100'
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MarketPill language={m} size="sm" />
                  <span className="text-xs font-bold text-slate-800">{m}</span>
                </div>

                <div>
                  {isFinished ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>已完成 v2.3</span>
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>今日进行中</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      排期待翻译
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最新动态横幅 */}
      <div className="bg-gradient-to-br from-spark-50/70 to-purple-50/40 p-4 rounded-2xl border border-spark-200/70 shadow-soft space-y-1">
        <div className="flex items-center gap-1.5 text-spark-700">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">最新动态</span>
        </div>
        <p className="text-xs font-semibold text-slate-900 leading-snug">
          {project.latestUpdate}
        </p>
      </div>

      {/* 交付预览物料与审核动作区 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              创意设计效果预览
            </h3>
            <p className="text-[11px] text-slate-500">
              {project.previewUploadedAt || '等待 SparkOne 设计师上传初稿预览'}
            </p>
          </div>

          {/* 管理员上传 / 替换预览按钮 */}
          {currentRole === 'Admin' && (
            <button
              onClick={() => setCustomUploadModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-spark-50 hover:bg-spark-100 text-spark-700 text-xs font-semibold border border-spark-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{project.previewUrl ? '替换预览稿' : '上传预览稿'}</span>
            </button>
          )}
        </div>

        {/* 预览大图/视频或占位 */}
        {project.previewUrl ? (
          <div className="space-y-2">
            {isVideoUrl(project.previewUrl) ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center shadow-inner">
                <video
                  src={project.previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div 
                onClick={() => setLightboxOpen(true)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 aspect-video cursor-pointer"
              >
                <img
                  src={project.previewUrl}
                  alt={project.previewTitle || '设计预览'}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                  <Eye className="w-4 h-4" />
                  <span>点击全屏放大查看</span>
                </div>
              </div>
            )}
            {project.previewTitle && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-mono font-medium truncate flex items-center gap-1.5">
                  {isVideoUrl(project.previewUrl) ? <Film className="w-3.5 h-3.5 text-spark-600 shrink-0" /> : null}
                  {project.previewTitle}
                </span>
                {!isVideoUrl(project.previewUrl) && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="text-spark-600 font-semibold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>全屏查看</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">暂未上传设计效果初稿</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              SparkOne 设计团队正在制作概念视觉方案。
            </p>
          </div>
        )}

        {/* 核心审核交互区（通过审核 / 提出修改） */}
        {project.status === 'Review' && (
          <div className="bg-spark-50/80 border-2 border-spark-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-spark-800">
              <Sparkles className="w-4 h-4 text-spark-600 shrink-0" />
              <p className="text-xs font-bold">
                {currentRole === 'Client'
                  ? '【待您审核验收】请检查以上视觉预览效果并给出审核结论。'
                  : '【等待客户审核】已提交预览稿，等待业务方终审反馈。'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setReviewModalState({ isOpen: true, type: 'approve' })}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>审核通过</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewModalState({ isOpen: true, type: 'request_changes' })}
                className="py-3 px-4 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>提出修改意见</span>
              </button>
            </div>
          </div>
        )}

        {/* 已完成盖章提示 */}
        {project.status === 'Completed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                设计物料已审核通过，交付完成
              </p>
              <p className="text-[11px] text-emerald-700">
                由 {project.approvedBy || '客户方'} 验收确认 ({project.approvedAt || '完成'})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 交付文件列表 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            交付文件与资产包 ({project.assets.length})
          </h3>
          {currentRole === 'Admin' ? (
            <button
              onClick={() => setAssetUploadModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-spark-50 hover:bg-spark-100 text-spark-700 text-xs font-bold border border-spark-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>上传交付资产</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase">源文件与成品</span>
          )}
        </div>

        {project.assets.length === 0 ? (
          <div className="text-center py-5 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            暂未附加可供下载的成品源文件。
          </div>
        ) : (
          <div className="space-y-2">
            {project.assets.map(asset => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-4 h-4 text-spark-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{asset.category}</span>
                      <span>•</span>
                      <span>{asset.size}</span>
                      {asset.isFinal && (
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 rounded">
                          最终交付稿
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  download={asset.name}
                  onClick={() => handleDownload(asset.name)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-spark-50 text-slate-600 hover:text-spark-700 border border-slate-200 shadow-2xs transition-colors shrink-0 text-xs font-bold"
                  title="下载物料文件"
                >
                  <Download className="w-3.5 h-3.5 text-spark-600" />
                  <span className="text-[11px]">下载</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 沟通与反馈动态流 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">
          沟通记录与状态时间线
        </h3>

        {/* 快速留言输入框 */}
        <form onSubmit={handlePostComment} className="flex gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder={`以【${currentRole === 'Admin' ? '管理员' : '客户'}】身份添加反馈或说明...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spark-500/20 focus:border-spark-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-spark-600 hover:bg-spark-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 动态列表 */}
        <div className="space-y-3 pt-1">
          {project.activity.map(act => {
            const isAdmin = act.role === 'Admin';
            return (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isAdmin
                      ? 'bg-spark-100 text-spark-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isAdmin ? '设计' : '客户'}
                </div>

                <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800">{act.author}</span>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {act.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 灯箱高清查看弹窗 */}
      {lightboxOpen && project.previewUrl && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {isVideoUrl(project.previewUrl) ? (
              <video
                src={project.previewUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={project.previewUrl}
                alt="超清效果预览"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
          <p className="text-white text-xs font-mono mt-3 opacity-75">
            {project.previewTitle || '效果预览物料'}
          </p>
        </div>
      )}

      {/* 管理员上传效果图 / 视频弹窗 */}
      {customUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  上传效果图 / 视频初稿
                </h3>
                <p className="text-[11px] text-slate-400">自动同步到 Supabase 云端存储 spark-previews</p>
              </div>
              <button
                onClick={() => {
                  setCustomUploadModal(false);
                  setSelectedPreviewFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 切换方式：本地文件 vs 网络链接 */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewUploadTab('file')}
                className={`py-1.5 rounded-lg transition-all ${
                  previewUploadTab === 'file' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                本地上传 (图片/视频)
              </button>
              <button
                type="button"
                onClick={() => setPreviewUploadTab('url')}
                className={`py-1.5 rounded-lg transition-all ${
                  previewUploadTab === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                网络链接 / 预设
              </button>
            </div>

            {previewUploadTab === 'file' ? (
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-slate-200 hover:border-spark-400 rounded-2xl p-4 bg-slate-50/50 text-center transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedPreviewFile(file);
                        if (!previewInputTitle) {
                          setPreviewInputTitle(file.name);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedPreviewFile ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-spark-200">
                      <div className="flex items-center gap-2 overflow-hidden text-left">
                        {selectedPreviewFile.type.startsWith('video/') ? (
                          <Film className="w-5 h-5 text-spark-600 shrink-0" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-spark-600 shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {selectedPreviewFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(selectedPreviewFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedPreviewFile.type.startsWith('video/') ? '高清视频' : '设计图'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedPreviewFile(null);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-spark-600 mb-1.5 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">点击选择或拖放设计稿 / 演示视频</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">支持 PNG、JPG、WEBP、MP4、MOV</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    物料展示名称
                  </label>
                  <input
                    type="text"
                    value={previewInputTitle}
                    onChange={e => setPreviewInputTitle(e.target.value)}
                    placeholder="例如：主视觉效果图_V2_终审版.png"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    物料文件名
                  </label>
                  <input
                    type="text"
                    value={previewInputTitle}
                    onChange={e => setPreviewInputTitle(e.target.value)}
                    placeholder="例如：营销大促横幅_V2_终稿.png"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    图片/视频网络链接
                  </label>
                  <input
                    type="text"
                    value={previewInputUrl}
                    onChange={e => setPreviewInputUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>

                {/* 快速预设 */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-semibold">快速选用演示初稿：</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewInputUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
                        setPreviewInputTitle('Spark_3D_全息微光卡面.png');
                      }}
                      className="p-2 border rounded-lg hover:bg-slate-50 text-left truncate font-semibold"
                    >
                      💳 3D 全息卡面
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewInputUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop');
                        setPreviewInputTitle('商户移动端开户界面.png');
                      }}
                      className="p-2 border rounded-lg hover:bg-slate-50 text-left truncate font-semibold"
                    >
                      📱 移动端开户流程
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomUploadModal(false)}
                disabled={isUploadingPreview}
                className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePreviewUpload}
                disabled={isUploadingPreview || (previewUploadTab === 'file' && !selectedPreviewFile && !previewInputUrl)}
                className="flex-1 py-2.5 bg-spark-600 hover:bg-spark-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                {isUploadingPreview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>上传中...</span>
                  </>
                ) : (
                  <span>上传并变更为待审核</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 管理员上传交付成品资产弹窗 */}
      {assetUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  归档上传最终交付资产
                </h3>
                <p className="text-[11px] text-slate-400">自动上传至 Supabase 云端存储 spark-deliverables</p>
              </div>
              <button
                onClick={() => {
                  setAssetUploadModal(false);
                  setSelectedAssetFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-200 hover:border-spark-400 rounded-2xl p-4 bg-slate-50/50 text-center transition-colors cursor-pointer group">
              <input
                type="file"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedAssetFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {selectedAssetFile ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-spark-200">
                  <div className="flex items-center gap-2 overflow-hidden text-left">
                    <FileText className="w-5 h-5 text-spark-600 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedAssetFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedAssetFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedAssetFile(null);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-spark-600 mb-1.5 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">选择交付资产文件或压缩包</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">支持 ZIP、FIG、PSD、MP4、PDF、PNG 高清源文件</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                物料分类
              </label>
              <select
                value={assetCategory}
                onChange={e => setAssetCategory(e.target.value as FileCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {DELIVERABLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssetUploadModal(false)}
                disabled={isUploadingAsset}
                className="flex-1 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveAssetUpload}
                disabled={isUploadingAsset || !selectedAssetFile}
                className="flex-1 py-2.5 bg-spark-600 hover:bg-spark-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                {isUploadingAsset ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>上传归档中...</span>
                  </>
                ) : (
                  <span>保存并归档到云端</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 审核操作弹窗 */}
      <ReviewModal
        isOpen={reviewModalState.isOpen}
        type={reviewModalState.type}
        projectTitle={project.title}
        onClose={() => setReviewModalState({ isOpen: false, type: 'approve' })}
        onConfirmApprove={note => approveProject(project.id, note)}
        onConfirmRequestChanges={feedback => requestChanges(project.id, feedback)}
      />

      {/* 删除项目确认弹窗 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                确认删除此项目？
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                即将删除《<span className="font-semibold text-slate-800">{project.title}</span>》（{project.id}）。此操作不可撤销，云端与本地记录将被清除。
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(project.id);
                  setShowDeleteModal(false);
                  onBack();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
