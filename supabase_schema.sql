-- ==============================================================================
-- SparkOne 创意协作中心 (SparkOne Creative Hub) - Supabase 数据库结构与存储配置
-- 在 Supabase 控制台的 SQL Editor 中直接粘贴并运行此脚本即可完成一键初始化
-- ==============================================================================

-- 1. 创建项目主表 (projects)
create table if not exists public.projects (
  id text primary key,
  title text not null,
  type text not null,
  markets text[] not null default '{}',
  description text default '',
  reference_url text,
  reference_file_name text,
  deadline text not null,
  priority text not null default 'Medium',
  status text not null default 'Requested',
  progress integer not null default 0,
  owner text not null default '待分配',
  client_name text not null default '创意需求方',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  latest_update text default '',
  preview_url text,
  preview_title text,
  preview_uploaded_at text,
  approved_at text,
  approved_by text,
  assets jsonb not null default '[]'::jsonb,
  activity jsonb not null default '[]'::jsonb
);

-- 2. 启用行级安全策略 (RLS)
alter table public.projects enable row level security;

-- 允许公开读取项目（团队与客户协作）
create policy "Allow public read on projects"
  on public.projects
  for select
  using (true);

-- 允许公开插入新项目（提交需求）
create policy "Allow public insert on projects"
  on public.projects
  for insert
  with check (true);

-- 允许公开更新项目（审核、接单、上传物料、修改进度）
create policy "Allow public update on projects"
  on public.projects
  for update
  using (true);

-- 允许公开删除项目（仅限管理清理）
create policy "Allow public delete on projects"
  on public.projects
  for delete
  using (true);

-- 3. 启用实时广播功能 (Realtime)
-- 使得客户和管理员在不同设备上无需刷新即可实时看到状态流转、审批通过和设计稿上传
alter publication supabase_realtime add table public.projects;

-- 4. 初始化云存储桶 (Storage Buckets)
-- spark-previews: 设计效果图、3D全息图、视频演示物料
-- spark-deliverables: 交付终稿成品包、分层源文件、高分辨率切图、视频导出文件
-- spark-references: 客户提交需求时上传的参考图、需求简报、规格说明

insert into storage.buckets (id, name, public)
values 
  ('spark-previews', 'spark-previews', true),
  ('spark-deliverables', 'spark-deliverables', true),
  ('spark-references', 'spark-references', true)
on conflict (id) do update set public = true;

-- 5. 配置存储桶的公开访问与上传策略
-- spark-previews
create policy "Public preview read access"
  on storage.objects for select
  using (bucket_id = 'spark-previews');

create policy "Public preview upload access"
  on storage.objects for insert
  with check (bucket_id = 'spark-previews');

create policy "Public preview update access"
  on storage.objects for update
  using (bucket_id = 'spark-previews');

-- spark-deliverables
create policy "Public deliverables read access"
  on storage.objects for select
  using (bucket_id = 'spark-deliverables');

create policy "Public deliverables upload access"
  on storage.objects for insert
  with check (bucket_id = 'spark-deliverables');

-- spark-deliverables
create policy "Public deliverables update access"
  on storage.objects for update
  using (bucket_id = 'spark-deliverables');

-- spark-references
create policy "Public references read access"
  on storage.objects for select
  using (bucket_id = 'spark-references');

create policy "Public references upload access"
  on storage.objects for insert
  with check (bucket_id = 'spark-references');

create policy "Public references update access"
  on storage.objects for update
  using (bucket_id = 'spark-references');
