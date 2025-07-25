import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const [collectionsResult, documentsResult] = await Promise.all([
    supabase.from('collections').select('*'),
    supabase.from('documents').select('*').is('collection_id', null)
  ]);

  if (collectionsResult.error || documentsResult.error) {
    return {
      collections: [],
      standaloneDocuments: [],
      error: collectionsResult.error?.message || documentsResult.error?.message
    };
  }

  return {
    collections: collectionsResult.data ?? [],
    standaloneDocuments: documentsResult.data ?? [],
    error: null
  };
};
