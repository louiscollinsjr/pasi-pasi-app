import { supabase } from '$lib/supabaseClient';
import type {
  Collection,
  Document,
  CreateCollectionData,
  UpdateCollectionData,
  CreateDocumentData,
  UpdateDocumentData,
  CollectionWithDocuments,
  DocumentWithCollection
} from '$lib/types/database';

// Collections CRUD operations
export const collectionsService = {
  // Get all collections for the current user
  async getUserCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get public collections (for browsing)
  async getPublicCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a specific collection with its documents
  async getCollectionWithDocuments(id: string): Promise<CollectionWithDocuments | null> {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new collection
  async createCollection(collectionData: CreateCollectionData): Promise<Collection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...collectionData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a collection
  async updateCollection(id: string, updates: UpdateCollectionData): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Documents CRUD operations
export const documentsService = {
  // Get all documents for a specific collection
  async getCollectionDocuments(collectionId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('collection_id', collectionId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all documents for the current user
  async getUserDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get public documents (for browsing)
  async getPublicDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a specific document with its collection
  async getDocumentWithCollection(id: string): Promise<DocumentWithCollection | null> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        collection:collections (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new document
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a document
  async updateDocument(id: string, updates: UpdateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Search functionality
export const searchService = {
  // Search collections by title or description
  async searchCollections(query: string, includePublic = false): Promise<Collection[]> {
    let queryBuilder = supabase
      .from('collections')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (includePublic) {
      queryBuilder = queryBuilder.or('is_public.eq.true');
    }

    const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Search documents by title or content
  async searchDocuments(query: string, includePublic = false): Promise<Document[]> {
    let queryBuilder = supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    if (includePublic) {
      queryBuilder = queryBuilder.or('is_public.eq.true');
    }

    const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
