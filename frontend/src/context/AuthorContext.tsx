import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { Author } from '@/src/types/notes';

const STORAGE_KEY = 'hx_author';

interface AuthorContextValue {
  author: Author | null;
  setAuthor: (a: Author) => void;
}

const AuthorContext = createContext<AuthorContextValue | null>(null);

export function AuthorProvider({ children }: { children: React.ReactNode }) {
  const [author, setAuthorState] = useState<Author | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'Ben' || stored === 'Wife') {
        setAuthorState(stored);
      }
    });
  }, []);

  const setAuthor = useCallback((a: Author) => {
    setAuthorState(a);
    AsyncStorage.setItem(STORAGE_KEY, a);
  }, []);

  return <AuthorContext.Provider value={{ author, setAuthor }}>{children}</AuthorContext.Provider>;
}

export function useAuthor(): AuthorContextValue {
  const ctx = useContext(AuthorContext);
  if (!ctx) throw new Error('useAuthor must be used inside AuthorProvider');
  return ctx;
}
