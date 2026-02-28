import { useCallback, useEffect, useState } from 'react';

import {
  createNote as apiCreate,
  deleteNote as apiDelete,
  getNotes,
  updateNote as apiUpdate,
} from '@/src/api/client';
import type { CreateNotePayload, Note, NoteFilter, UpdateNotePayload } from '@/src/types/notes';

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refresh: (filter?: NoteFilter) => Promise<void>;
  createNote: (payload: CreateNotePayload) => Promise<void>;
  updateNote: (id: number, payload: UpdateNotePayload) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export function useNotes(filter: NoteFilter = 'all'): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (f?: NoteFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotes(f ?? filter);
      setNotes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh(filter);
  }, [filter, refresh]);

  const createNote = useCallback(async (payload: CreateNotePayload) => {
    await apiCreate(payload);
    await refresh(filter);
  }, [filter, refresh]);

  const updateNote = useCallback(async (id: number, payload: UpdateNotePayload) => {
    await apiUpdate(id, payload);
    await refresh(filter);
  }, [filter, refresh]);

  const deleteNote = useCallback(async (id: number) => {
    await apiDelete(id);
    await refresh(filter);
  }, [filter, refresh]);

  return { notes, loading, error, refresh, createNote, updateNote, deleteNote };
}
