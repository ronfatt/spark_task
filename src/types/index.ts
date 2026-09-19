export type UserRole = 'Admin' | 'Client';

export type NavTab = 'Home' | 'Requests' | 'Projects' | 'Files';

export type ProjectStatus = 'Requested' | 'Working' | 'Review' | 'Completed' | 'On Hold';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProjectType = 
  | '营销广告横幅'
  | '社媒创意配图'
  | '产品界面 / App'
  | '品牌资产 / 规范'
  | '视频 / 动态特效'
  | '落地页设计'
  | '演示提案 / 商业计划书'
  | '线下物料 / 周边';

export type SupportedLanguage = 
  | '英语'
  | '中文'
  | '越南语'
  | '印尼语'
  | '韩语'
  | '日语'
  | '泰语';

export type FileCategory = 
  | '品牌规范'
  | '企业物料'
  | '产品界面'
  | '营销推广'
  | '演示提案'
  | '交付成品';

export interface ProjectAsset {
  id: string;
  name: string;
  category: FileCategory;
  url: string;
  size: string;
  type: 'image' | 'video' | 'pdf' | 'archive' | 'figma';
  uploadedAt: string;
  languages?: SupportedLanguage[];
  isFinal?: boolean;
}

export interface ActivityComment {
  id: string;
  author: string;
  role: UserRole;
  avatar?: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'status_change' | 'revision_requested' | 'approved' | 'asset_uploaded';
}

export interface CreativeProject {
  id: string;
  title: string;
  type: ProjectType;
  markets: SupportedLanguage[];
  description: string;
  referenceUrl?: string;
  referenceFileName?: string;
  deadline: string; // ISO date string e.g. "2026-09-25"
  priority: ProjectPriority;
  status: ProjectStatus;
  progress: number; // 0 to 100
  owner: string; // SparkOne 负责人
  clientName: string; // 客户名称
  createdAt: string;
  updatedAt: string;
  latestUpdate: string;
  previewUrl?: string; // 高清预览物料
  previewTitle?: string;
  previewUploadedAt?: string;
  assets: ProjectAsset[];
  activity: ActivityComment[];
  approvedAt?: string;
  approvedBy?: string;
}

export interface CreativeRequestFormData {
  title: string;
  type: ProjectType;
  markets: SupportedLanguage[];
  description: string;
  referenceFile?: File | null;
  referenceFileName?: string;
  deadline: string;
  priority: ProjectPriority;
}
