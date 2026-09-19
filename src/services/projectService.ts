import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import type { CreativeProject } from '../types';

export interface DbProjectRecord {
  id: string;
  title: string;
  type: string;
  markets: string[];
  description?: string;
  reference_url?: string;
  reference_file_name?: string;
  deadline: string;
  priority: string;
  status: string;
  progress: number;
  owner: string;
  client_name: string;
  created_at: string;
  updated_at: string;
  latest_update: string;
  preview_url?: string;
  preview_title?: string;
  preview_uploaded_at?: string;
  approved_at?: string;
  approved_by?: string;
  assets: any;
  activity: any;
}

export function mapDbRecordToProject(record: DbProjectRecord): CreativeProject {
  return {
    id: record.id,
    title: record.title,
    type: record.type as any,
    markets: (record.markets || []) as any,
    description: record.description || '',
    referenceUrl: record.reference_url || undefined,
    referenceFileName: record.reference_file_name || undefined,
    deadline: record.deadline,
    priority: record.priority as any,
    status: record.status as any,
    progress: record.progress ?? 0,
    owner: record.owner || '待分配',
    clientName: record.client_name || '创意需求方',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    latestUpdate: record.latest_update || '',
    previewUrl: record.preview_url || undefined,
    previewTitle: record.preview_title || undefined,
    previewUploadedAt: record.preview_uploaded_at || undefined,
    approvedAt: record.approved_at || undefined,
    approvedBy: record.approved_by || undefined,
    assets: Array.isArray(record.assets) ? record.assets : [],
    activity: Array.isArray(record.activity) ? record.activity : [],
  };
}

export function mapProjectToDbRecord(project: CreativeProject): DbProjectRecord {
  return {
    id: project.id,
    title: project.title,
    type: project.type,
    markets: project.markets,
    description: project.description,
    reference_url: project.referenceUrl || undefined,
    reference_file_name: project.referenceFileName || undefined,
    deadline: project.deadline,
    priority: project.priority,
    status: project.status,
    progress: project.progress,
    owner: project.owner,
    client_name: project.clientName,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    latest_update: project.latestUpdate,
    preview_url: project.previewUrl || undefined,
    preview_title: project.previewTitle || undefined,
    preview_uploaded_at: project.previewUploadedAt || undefined,
    approved_at: project.approvedAt || undefined,
    approved_by: project.approvedBy || undefined,
    assets: project.assets || [],
    activity: project.activity || [],
  };
}

export async function fetchProjectsFromSupabase(): Promise<CreativeProject[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects from Supabase:', error.message);
    return null;
  }

  return (data as DbProjectRecord[]).map(mapDbRecordToProject);
}

export async function saveProjectToSupabase(project: CreativeProject): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return false;

  const dbRecord = mapProjectToDbRecord(project);

  const { error } = await supabase
    .from('projects')
    .upsert(dbRecord, { onConflict: 'id' });

  if (error) {
    console.error('Error saving project to Supabase:', error.message);
    return false;
  }

  return true;
}

export async function deleteProjectFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project from Supabase:', error.message);
    return false;
  }

  return true;
}

export function subscribeToSupabaseProjects(
  onProjectsChange: () => void
): (() => void) | null {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  const channel = supabase
    .channel('projects-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects' },
      () => {
        onProjectsChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
