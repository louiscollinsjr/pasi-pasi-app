export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  collection_id: string;
  user_id: string;
  title: string;
  content: any;
  original_text: string;
  word_count: number;
  paragraph_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionData {
  title: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateCollectionData {
  title?: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateDocumentData {
  collection_id: string;
  title: string;
  content: any;
  original_text: string;
  word_count: number;
  paragraph_count: number;
  is_public?: boolean;
}

export interface UpdateDocumentData {
  title?: string;
  content?: any;
  original_text?: string;
  is_public?: boolean;
}

export interface CollectionWithDocuments extends Collection {
  documents: Document[];
}

export interface DocumentWithCollection extends Document {
  collection: Collection;
}
