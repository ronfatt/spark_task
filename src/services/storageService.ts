import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import type { ProjectAsset, FileCategory, SupportedLanguage } from '../types';

export type StorageBucketName = 'spark-previews' | 'spark-deliverables' | 'spark-references';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function detectAssetType(file: File): 'image' | 'video' | 'pdf' | 'archive' | 'figma' {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('rar') ||
    name.endsWith('.zip') ||
    name.endsWith('.rar') ||
    name.endsWith('.7z')
  ) {
    return 'archive';
  }
  if (name.endsWith('.fig') || name.endsWith('.sketch')) return 'figma';

  return 'image';
}

export interface UploadResult {
  url: string;
  fileName: string;
  sizeFormatted: string;
  fileType: 'image' | 'video' | 'pdf' | 'archive' | 'figma';
}

export async function uploadFileToSupabase(
  bucket: StorageBucketName,
  file: File,
  folderPrefix: string = ''
): Promise<UploadResult> {
  const supabase = getSupabaseClient();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, '_');
  const path = folderPrefix
    ? `${folderPrefix}/${Date.now()}_${cleanName}`
    : `${Date.now()}_${cleanName}`;

  const fileType = detectAssetType(file);
  const sizeFormatted = formatBytes(file.size);

  // If Supabase is configured, upload to storage
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn('Supabase storage upload failed, falling back to local URL:', error.message);
      return {
        url: URL.createObjectURL(file),
        fileName: file.name,
        sizeFormatted,
        fileType,
      };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return {
      url: urlData.publicUrl,
      fileName: file.name,
      sizeFormatted,
      fileType,
    };
  }

  // Graceful fallback for offline / demo mode
  return {
    url: URL.createObjectURL(file),
    fileName: file.name,
    sizeFormatted,
    fileType,
  };
}

export function createProjectAssetFromFile(
  file: File,
  url: string,
  category: FileCategory = '交付成品',
  languages?: SupportedLanguage[],
  isFinal: boolean = true
): ProjectAsset {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return {
    id: `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: file.name,
    category,
    url,
    size: formatBytes(file.size),
    type: detectAssetType(file),
    uploadedAt: `今天 ${formattedTime}`,
    languages,
    isFinal,
  };
}
