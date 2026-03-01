import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthorProvider } from '@/src/context/AuthorContext';

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthorProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'HouseholdXpress', headerShown: false }} />
          <Stack.Screen name="notes/index" options={{ title: 'Notes' }} />
          <Stack.Screen name="notes/[id]" options={{ title: 'Note' }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthorProvider>
    </GluestackUIProvider>
  );
}
