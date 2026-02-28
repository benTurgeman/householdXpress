import type {
  CreateNotePayload,
  Note,
  NoteFilter,
  NoteListResponse,
  UpdateNotePayload,
} from '@/src/types/notes';

const BASE = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, (err as { detail?: string }).detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getNotes(filter?: NoteFilter): Promise<Note[]> {
  const params = filter && filter !== 'all' ? `?author=${filter}` : '';
  const data = await request<NoteListResponse>(`/notes/${params}`);
  return data.items;
}

export async function getNote(id: number): Promise<Note> {
  return request<Note>(`/notes/${id}`);
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  return request<Note>('/notes/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateNote(id: number, payload: UpdateNotePayload): Promise<Note> {
  return request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteNote(id: number): Promise<void> {
  return request<void>(`/notes/${id}`, { method: 'DELETE' });
}
