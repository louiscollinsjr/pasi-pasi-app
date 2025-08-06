import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  native_language: string; // ISO 639-1 (e.g., 'en', 'fr')
  updated_at?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
};

type StoreState = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
};

function createUserProfileStore() {
  const { subscribe, set, update } = writable<StoreState>({
    profile: null,
    loading: false,
    error: null
  });

  async function fetchProfile(user?: User | null) {
    try {
      update((s) => ({ ...s, loading: true, error: null }));

      let userId: string | null = null;
      if (user) {
        userId = user.id;
      } else {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
      }

      if (!userId) {
        set({ profile: null, loading: false, error: 'Not authenticated' });
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist yet, try to create it with defaults
        const shouldCreate = error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows');
        if (shouldCreate) {
          const { data: created, error: insertErr } = await supabase
            .from('profiles')
            .insert({ id: userId, native_language: 'en' })
            .select()
            .single();
          if (insertErr) throw insertErr;
          set({ profile: created as UserProfile, loading: false, error: null });
          return created as UserProfile;
        }
        throw error;
      }

      set({ profile: data as UserProfile, loading: false, error: null });
      return data as UserProfile;
    } catch (err: any) {
      set({ profile: null, loading: false, error: err?.message ?? 'Failed to load profile' });
      return null;
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    try {
      update((s) => ({ ...s, loading: true, error: null }));
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const payload = { id: userId, ...updates } as Partial<UserProfile> & { id: string };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      update((s) => ({ ...s, profile: data as UserProfile, loading: false }));
      return data as UserProfile;
    } catch (err: any) {
      update((s) => ({ ...s, loading: false, error: err?.message ?? 'Failed to update profile' }));
      return null;
    }
  }

  return { subscribe, fetchProfile, updateProfile };
}

export const userProfile = createUserProfileStore();
