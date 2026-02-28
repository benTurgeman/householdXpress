import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NoteCard from '@/src/components/notes/NoteCard';
import NoteForm from '@/src/components/notes/NoteForm';
import ErrorBanner from '@/src/components/ui/ErrorBanner';
import FilterBar from '@/src/components/ui/FilterBar';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';
import { useAuthor } from '@/src/context/AuthorContext';
import { useNotes } from '@/src/hooks/useNotes';
import type { NoteFilter } from '@/src/types/notes';

export default function NotesScreen() {
  const router = useRouter();
  const { author, setAuthor } = useAuthor();
  const [filter, setFilter] = useState<NoteFilter>('all');
  const [isCreating, setIsCreating] = useState(false);

  const { notes, loading, error, createNote, refresh } = useNotes(filter);

  if (!author) {
    router.replace('/');
    return null;
  }

  async function handleCreate(data: { title: string; body: string }) {
    if (!author) return;
    await createNote({ author, title: data.title, body: data.body || undefined });
    setIsCreating(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Notes</Text>
        <View className="flex-row gap-3 items-center">
          <Pressable
            onPress={() => setAuthor('Ben' === author ? 'Wife' : 'Ben')}
            className="bg-white border border-gray-200 rounded-full px-3 py-1"
          >
            <Text className="text-xs text-gray-500">{author} ↕</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsCreating(true)}
            className="bg-blue-500 rounded-full w-9 h-9 items-center justify-center shadow-sm"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </Pressable>
        </View>
      </View>

      <FilterBar value={filter} onChange={setFilter} />

      {error ? (
        <ErrorBanner message={error} onDismiss={() => refresh(filter)} />
      ) : null}

      {isCreating ? (
        <View className="mt-2">
          <NoteForm
            author={author}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
            submitLabel="Create"
          />
        </View>
      ) : null}

      {loading && notes.length === 0 ? (
        <LoadingSpinner label="Loading notes…" />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onSelect={() => router.push(`/notes/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-gray-400 text-base">No notes yet. Tap + to create one.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
