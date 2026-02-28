import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import ConfirmDialog from '@/src/components/ui/ConfirmDialog';
import type { Note, UpdateNotePayload } from '@/src/types/notes';

import NoteForm from './NoteForm';

interface Props {
  note: Note;
  onUpdate: (payload: UpdateNotePayload) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export default function NoteDetail({ note, onUpdate, onDelete, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleUpdate(data: { title: string; body: string }) {
    await onUpdate({ title: data.title, body: data.body || undefined });
    setIsEditing(false);
  }

  async function handleDelete() {
    setShowConfirm(false);
    await onDelete();
  }

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-4 pt-4 pb-6">
          <Pressable onPress={onClose} className="mb-4">
            <Text className="text-blue-500 text-base">← Back</Text>
          </Pressable>

          {isEditing ? (
            <NoteForm
              author={note.author}
              initialValues={{ title: note.title, body: note.body ?? '' }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="Update"
            />
          ) : (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900 mb-2">{note.title}</Text>
              <Text className="text-sm text-gray-400 mb-4">by {note.author}</Text>
              {note.body ? (
                <Text className="text-base text-gray-700 leading-relaxed">{note.body}</Text>
              ) : (
                <Text className="text-base text-gray-400 italic">No body</Text>
              )}
              <View className="flex-row gap-3 mt-6">
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowConfirm(true)}
                  className="flex-1 border border-red-300 rounded-xl py-3 items-center"
                >
                  <Text className="text-red-500 font-semibold">Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title="Delete note?"
        message={`"${note.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
