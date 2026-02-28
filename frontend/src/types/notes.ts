// Matches backend Author enum exactly
export type Author = 'Ben' | 'Wife';

export interface Note {
  id: number; // integer PK from backend (NOT a UUID string)
  author: Author;
  title: string;
  body: string | null;
  created_at: string; // ISO 8601 UTC string from backend
  updated_at: string;
}

// Matches backend NoteListResponse envelope
export interface NoteListResponse {
  items: Note[];
  total: number;
}

export interface CreateNotePayload {
  author: Author;
  title: string;
  body?: string;
}

export interface UpdateNotePayload {
  title?: string;
  body?: string;
}

export type NoteFilter = Author | 'all';
