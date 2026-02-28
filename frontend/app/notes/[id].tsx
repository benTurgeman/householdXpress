import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NoteDetail from '@/src/components/notes/NoteDetail';
import LoadingSpinner from '@/src/components/ui/LoadingSpinner';
import { deleteNote, getNote, updateNote } from '@/src/api/client';
import type { Note, UpdateNotePayload } from '@/src/types/notes';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNote(Number(id))
      .then(setNote)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(payload: UpdateNotePayload) {
    const updated = await updateNote(Number(id), payload);
    setNote(updated);
  }

  async function handleDelete() {
    await deleteNote(Number(id));
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {loading || !note ? (
        <View className="flex-1">
          <LoadingSpinner label="Loading note…" />
        </View>
      ) : (
        <NoteDetail
          note={note}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => router.back()}
        />
      )}
    </SafeAreaView>
  );
}
