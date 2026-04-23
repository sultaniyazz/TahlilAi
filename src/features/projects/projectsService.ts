import { supabase } from '@/integrations/supabase/client';
import type { Project, Page, CanvasSettings } from '@/types';

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  pages: Page[];
  canvas_settings: CanvasSettings;
  theme: Record<string, unknown> | null;
  thumbnail_url: string | null;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_CANVAS: CanvasSettings = {
  width: 1920,
  height: 1080,
  backgroundColor: '#0F0F11',
  aspectRatio: '16:9',
};

function dbToProject(row: DbProject): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    pages: row.pages ?? [],
    canvasSettings: row.canvas_settings ?? DEFAULT_CANVAS,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    thumbnail: row.thumbnail_url ?? undefined,
    isPublic: row.is_public,
    publicSlug: row.public_slug ?? undefined,
    history: [],
  };
}

function generateSlug() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
}

export const projectService = {
  async list(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as DbProject[]).map(dbToProject);
  },

  async get(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('get project error', error);
      return null;
    }
    return data ? dbToProject(data as unknown as DbProject) : null;
  },

  async getBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('public_slug', slug)
      .eq('is_public', true)
      .maybeSingle();
    if (error) {
      console.error('getBySlug error', error);
      return null;
    }
    return data ? dbToProject(data as unknown as DbProject) : null;
  },

  async create(userId: string, init?: Partial<Project>): Promise<Project | null> {
    const initialPage: Page = {
      id: crypto.randomUUID(),
      heading: 'New Slide',
      content: '',
      elements: [],
    };

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: init?.title ?? 'Untitled presentation',
        subtitle: init?.subtitle ?? null,
        pages: (init?.pages ?? [initialPage]) as unknown as never,
        canvas_settings: (init?.canvasSettings ?? DEFAULT_CANVAS) as unknown as never,
      })
      .select()
      .single();

    if (error) {
      console.error('create project error', error);
      return null;
    }
    return dbToProject(data as unknown as DbProject);
  },

  async save(id: string, updates: Partial<Project>): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
    if (updates.pages !== undefined) payload.pages = updates.pages;
    if (updates.canvasSettings !== undefined) payload.canvas_settings = updates.canvasSettings;
    if (updates.thumbnail !== undefined) payload.thumbnail_url = updates.thumbnail;

    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) {
      console.error('save project error', error);
      return false;
    }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('delete project error', error);
      return false;
    }
    return true;
  },

  async duplicate(id: string, userId: string): Promise<Project | null> {
    const original = await this.get(id);
    if (!original) return null;
    return this.create(userId, {
      title: `${original.title} (Copy)`,
      subtitle: original.subtitle,
      pages: original.pages,
      canvasSettings: original.canvasSettings,
    });
  },

  async setPublic(id: string, isPublic: boolean): Promise<string | null> {
    const slug = isPublic ? generateSlug() : null;
    const { error } = await supabase
      .from('projects')
      .update({ is_public: isPublic, public_slug: slug })
      .eq('id', id);
    if (error) {
      console.error('setPublic error', error);
      return null;
    }
    return slug;
  },
};
