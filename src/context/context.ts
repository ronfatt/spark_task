import { createContext } from 'react';
import type { 
  UserRole, 
  NavTab, 
  CreativeProject, 
  CreativeRequestFormData, 
  ProjectStatus,
  FileCategory,
  SupportedLanguage
} from '../types';

export interface AppContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isAdminUnlocked: boolean;
  unlockAdmin: (pin?: string) => boolean;
  lockAdmin: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  phoneFrameEnabled: boolean;
  setPhoneFrameEnabled: (enabled: boolean) => void;
  projects: CreativeProject[];
  isCloudConnected: boolean;
  isSyncing: boolean;
  refreshProjects: () => Promise<void>;
  submitRequest: (formData: CreativeRequestFormData) => string;
  submitRequestAsync: (formData: CreativeRequestFormData) => Promise<string>;
  acceptProject: (id: string) => void;
  updateProjectProgress: (id: string, progress: number, note?: string) => void;
  updateProjectStatus: (id: string, status: ProjectStatus, note?: string) => void;
  uploadPreview: (id: string, previewUrl: string, previewTitle: string, setInReview?: boolean) => void;
  uploadPreviewFile: (projectId: string, file: File, title?: string) => Promise<void>;
  uploadAssetToProject: (projectId: string, file: File, category?: FileCategory, languages?: SupportedLanguage[]) => Promise<void>;
  approveProject: (id: string, note?: string) => void;
  requestChanges: (id: string, feedback: string) => void;
  addComment: (id: string, content: string) => void;
  resetToDemoData: () => void;
  reconnectCloud: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
