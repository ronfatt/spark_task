import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { 
  UserRole, 
  NavTab, 
  CreativeProject, 
  CreativeRequestFormData, 
  ProjectStatus, 
  ActivityComment,
  FileCategory,
  SupportedLanguage
} from '../types';
import { INITIAL_PROJECTS } from '../data/initialData';
import { AppContext } from './context';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  fetchProjectsFromSupabase, 
  saveProjectToSupabase, 
  subscribeToSupabaseProjects 
} from '../services/projectService';
import { 
  uploadFileToSupabase, 
  createProjectAssetFromFile 
} from '../services/storageService';

const STORAGE_KEY = 'sparkone_creative_hub_projects_v3_zh';
const ADMIN_STORAGE_KEY = 'sparkone_admin_unlocked_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if URL has ?admin=true or if previously unlocked
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true' || params.get('role') === 'admin') {
          return true;
        }
        return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Default role is Client unless Admin is unlocked
  const [currentRole, setRole] = useState<UserRole>(() => {
    return isAdminUnlocked ? 'Admin' : 'Client';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('Home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(true);

  // Cloud status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isInitialLoadDone = useRef(false);

  // Initialize projects from localStorage or default seed data
  const [projects, setProjects] = useState<CreativeProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load projects from storage', e);
    }
    return INITIAL_PROJECTS;
  });

  // Sync state to local storage cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  }, [projects]);

  // Helper to persist single project to Supabase in background
  const syncProjectToCloud = useCallback((project: CreativeProject) => {
    if (isSupabaseConfigured()) {
      setIsSyncing(true);
      saveProjectToSupabase(project)
        .catch(err => console.error('Cloud sync error:', err))
        .finally(() => setIsSyncing(false));
    }
  }, []);

  // Fetch from Supabase on start or refresh
  const refreshProjects = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setIsSyncing(true);
    try {
      const cloudData = await fetchProjectsFromSupabase();
      if (cloudData && cloudData.length > 0) {
        setProjects(cloudData);
      } else if (cloudData && cloudData.length === 0 && !isInitialLoadDone.current) {
        // If Supabase table is completely empty on first launch, upload initial demo projects
        for (const p of INITIAL_PROJECTS) {
          await saveProjectToSupabase(p);
        }
      }
      setIsCloudConnected(true);
    } catch (err) {
      console.error('Failed to refresh from Supabase', err);
    } finally {
      setIsSyncing(false);
      isInitialLoadDone.current = true;
    }
  }, []);

  // Re-check config and reconnect
  const reconnectCloud = useCallback(async () => {
    const configured = isSupabaseConfigured();
    setIsCloudConnected(configured);
    if (configured) {
      await refreshProjects();
    }
  }, [refreshProjects]);

  // Initial load and Realtime listener setup
  useEffect(() => {
    if (isSupabaseConfigured()) {
      let isMounted = true;
      const initCloud = async () => {
        if (isMounted) {
          await refreshProjects();
        }
      };
      void initCloud();

      const unsubscribe = subscribeToSupabaseProjects(() => {
        if (isMounted) {
          void refreshProjects();
        }
      });

      return () => {
        isMounted = false;
        if (unsubscribe) unsubscribe();
      };
    }
  }, [refreshProjects]);

  const unlockAdmin = (pin?: string): boolean => {
    // Correct PIN is 8888, or empty allows entry if confirmed
    if (!pin || pin === '8888') {
      setIsAdminUnlocked(true);
      setRole('Admin');
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    setRole('Client');
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#A78BFA', '#10B981', '#F59E0B'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  // Submit request (synchronous for immediate UI response)
  const submitRequest = (formData: CreativeRequestFormData): string => {
    const newId = `项目-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const newProject: CreativeProject = {
      id: newId,
      title: formData.title,
      type: formData.type,
      markets: formData.markets,
      description: formData.description,
      referenceFileName: formData.referenceFileName || (formData.referenceFile ? formData.referenceFile.name : undefined),
      deadline: formData.deadline,
      priority: formData.priority,
      status: 'Requested',
      progress: 0,
      owner: '待分配',
      clientName: currentRole === 'Client' ? '营销业务方' : '创意需求方',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      latestUpdate: '已提交创意需求，等待设计团队接单排期。',
      assets: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          author: currentRole === 'Client' ? '客户业务方' : 'Spark 管理员',
          role: currentRole,
          content: `提交了新需求《${formData.title}》，目标市场包含：${formData.markets.join('、')}。`,
          timestamp: `今天 ${formattedTime}`,
          type: 'comment',
        },
      ],
    };

    setProjects(prev => [newProject, ...prev]);
    syncProjectToCloud(newProject);
    return newId;
  };

  // Submit request with real file upload support
  const submitRequestAsync = async (formData: CreativeRequestFormData): Promise<string> => {
    const newId = `项目-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    let referenceUrl: string | undefined = undefined;
    let referenceFileName = formData.referenceFileName;

    if (formData.referenceFile) {
      referenceFileName = formData.referenceFile.name;
      try {
        const uploadRes = await uploadFileToSupabase('spark-references', formData.referenceFile, newId);
        referenceUrl = uploadRes.url;
      } catch (e) {
        console.warn('Reference upload error', e);
      }
    }

    const newProject: CreativeProject = {
      id: newId,
      title: formData.title,
      type: formData.type,
      markets: formData.markets,
      description: formData.description,
      referenceUrl,
      referenceFileName,
      deadline: formData.deadline,
      priority: formData.priority,
      status: 'Requested',
      progress: 0,
      owner: '待分配',
      clientName: currentRole === 'Client' ? '营销业务方' : '创意需求方',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      latestUpdate: '已提交创意需求，等待设计团队接单排期。',
      assets: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          author: currentRole === 'Client' ? '客户业务方' : 'Spark 管理员',
          role: currentRole,
          content: `提交了新需求《${formData.title}》，目标市场包含：${formData.markets.join('、')}。`,
          timestamp: `今天 ${formattedTime}`,
          type: 'comment',
        },
      ],
    };

    setProjects(prev => [newProject, ...prev]);
    syncProjectToCloud(newProject);
    return newId;
  };

  const acceptProject = (id: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '黄伟 (创意总监)',
          role: 'Admin',
          content: '设计团队已接单排期，项目状态变更为【制作中】。',
          timestamp: `今天 ${formattedTime}`,
          type: 'status_change',
        };
        const updated: CreativeProject = {
          ...p,
          status: 'Working',
          owner: p.owner === '待分配' ? '黄伟 (创意总监)' : p.owner,
          progress: p.progress === 0 ? 15 : p.progress,
          updatedAt: now.toISOString(),
          latestUpdate: '设计团队已接单，创意制作中。',
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const updateProjectProgress = (id: string, progress: number, note?: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updateText = note || `制作进度已更新至 ${progress}%。`;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '黄伟 (设计团队)',
          role: 'Admin',
          content: updateText,
          timestamp: `今天 ${formattedTime}`,
          type: 'status_change',
        };
        const updated: CreativeProject = {
          ...p,
          progress,
          updatedAt: now.toISOString(),
          latestUpdate: updateText,
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, note?: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const statusMap: Record<ProjectStatus, string> = {
      Requested: '待接单',
      Working: '制作中',
      Review: '待审核',
      Completed: '已完成',
      'On Hold': '暂搁置',
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const statusText = note || `项目状态更新为【${statusMap[status]}】。`;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: currentRole === 'Admin' ? '设计团队' : '客户方',
          role: currentRole,
          content: statusText,
          timestamp: `今天 ${formattedTime}`,
          type: 'status_change',
        };
        const updated: CreativeProject = {
          ...p,
          status,
          updatedAt: now.toISOString(),
          latestUpdate: statusText,
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const uploadPreview = (id: string, previewUrl: string, previewTitle: string, setInReview: boolean = true) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '黄伟 (设计团队)',
          role: 'Admin',
          content: `上传了新设计稿《${previewTitle}》，请客户方验收审核。`,
          timestamp: `今天 ${formattedTime}`,
          type: 'asset_uploaded',
        };
        const updated: CreativeProject = {
          ...p,
          previewUrl,
          previewTitle,
          previewUploadedAt: `今天 ${formattedTime}`,
          status: setInReview ? 'Review' : p.status,
          progress: Math.max(p.progress, 85),
          updatedAt: now.toISOString(),
          latestUpdate: `已上传设计效果图《${previewTitle}》，等待客户验收。`,
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const uploadPreviewFile = async (projectId: string, file: File, title?: string) => {
    const uploadRes = await uploadFileToSupabase('spark-previews', file, projectId);
    const displayTitle = title || uploadRes.fileName;
    uploadPreview(projectId, uploadRes.url, displayTitle, true);
  };

  const uploadAssetToProject = async (
    projectId: string, 
    file: File, 
    category: FileCategory = '交付成品', 
    languages?: SupportedLanguage[]
  ) => {
    const uploadRes = await uploadFileToSupabase('spark-deliverables', file, projectId);
    const asset = createProjectAssetFromFile(file, uploadRes.url, category, languages, true);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '黄伟 (设计团队)',
          role: 'Admin',
          content: `归档交付了新素材《${file.name}》（${asset.size}，分类：${category}）。`,
          timestamp: `今天 ${formattedTime}`,
          type: 'asset_uploaded',
        };
        const updated: CreativeProject = {
          ...p,
          assets: [asset, ...p.assets],
          updatedAt: now.toISOString(),
          latestUpdate: `交付了新资产物料《${file.name}》。`,
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const approveProject = (id: string, note?: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const approvalText = note || '设计物料审核通过，符合全渠道交付标准！';
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '客户主审人',
          role: 'Client',
          content: `【验收通过】${approvalText}`,
          timestamp: `今天 ${formattedTime}`,
          type: 'approved',
        };
        const updated: CreativeProject = {
          ...p,
          status: 'Completed',
          progress: 100,
          approvedAt: `今天 ${formattedTime}`,
          approvedBy: '客户主审人',
          updatedAt: now.toISOString(),
          latestUpdate: '项目已审核通过，交付完成。成品已归档。',
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
    triggerConfetti();
  };

  const requestChanges = (id: string, feedback: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: '客户主审人',
          role: 'Client',
          content: `【修改意见】${feedback}`,
          timestamp: `今天 ${formattedTime}`,
          type: 'revision_requested',
        };
        const updated: CreativeProject = {
          ...p,
          status: 'Working',
          progress: Math.min(p.progress, 70),
          updatedAt: now.toISOString(),
          latestUpdate: `客户提出修改：“${feedback.slice(0, 40)}...”`,
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const addComment = (id: string, content: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newComment: ActivityComment = {
          id: `act-${Date.now()}`,
          author: currentRole === 'Admin' ? '设计团队' : '客户方',
          role: currentRole,
          content,
          timestamp: `今天 ${formattedTime}`,
          type: 'comment',
        };
        const updated: CreativeProject = {
          ...p,
          updatedAt: now.toISOString(),
          activity: [newComment, ...p.activity],
        };
        syncProjectToCloud(updated);
        return updated;
      })
    );
  };

  const resetToDemoData = () => {
    setProjects(INITIAL_PROJECTS);
    localStorage.removeItem(STORAGE_KEY);
    if (isSupabaseConfigured()) {
      INITIAL_PROJECTS.forEach(p => syncProjectToCloud(p));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        phoneFrameEnabled,
        setPhoneFrameEnabled,
        projects,
        isCloudConnected,
        isSyncing,
        refreshProjects,
        submitRequest,
        submitRequestAsync,
        acceptProject,
        updateProjectProgress,
        updateProjectStatus,
        uploadPreview,
        uploadPreviewFile,
        uploadAssetToProject,
        approveProject,
        requestChanges,
        addComment,
        resetToDemoData,
        reconnectCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
