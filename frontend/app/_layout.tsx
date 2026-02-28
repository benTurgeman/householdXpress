import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

import { AuthorProvider } from '@/src/context/AuthorContext';

export default function RootLayout() {
  return (
    <AuthorProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'HouseholdXpress', headerShown: false }} />
        <Stack.Screen name="notes/index" options={{ title: 'Notes' }} />
        <Stack.Screen name="notes/[id]" options={{ title: 'Note' }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthorProvider>
  );
}
