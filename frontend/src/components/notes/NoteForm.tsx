import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import type { Author } from '@/src/types/notes';

interface FormData {
  title: string;
  body: string;
}

interface Props {
  author: Author;
  initialValues?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function NoteForm({
  author,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm border border-gray-100">
      <View className="bg-gray-50 rounded-lg px-3 py-2 mb-3 flex-row items-center">
        <Text className="text-xs text-gray-400 mr-2">Author</Text>
        <Text className="text-sm font-medium text-gray-700">{author}</Text>
      </View>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-900 mb-3"
        placeholder="Title *"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={setTitle}
        autoFocus
        returnKeyType="next"
      />
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-900 mb-3 min-h-[100px]"
        placeholder="Body (optional)"
        placeholderTextColor="#9ca3af"
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
      />
      {error ? <Text className="text-red-500 text-sm mb-3">{error}</Text> : null}
      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          className="flex-1 border border-gray-300 rounded-xl py-3 items-center"
        >
          <Text className="text-gray-700 font-medium">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`flex-1 rounded-xl py-3 items-center ${submitting ? 'bg-blue-300' : 'bg-blue-500'}`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">{submitLabel}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
