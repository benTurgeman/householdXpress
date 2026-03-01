import React from 'react';

interface Props {
  mode?: 'light' | 'dark';
  children: React.ReactNode;
}

export function GluestackUIProvider({ children }: Props) {
  return <>{children}</>;
}
