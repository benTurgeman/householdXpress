import { Pressable, Text, View } from 'react-native';

import type { Note } from '@/src/types/notes';

const AUTHOR_COLORS: Record<string, string> = {
  Ben: 'bg-blue-100 text-blue-700',
  Wife: 'bg-pink-100 text-pink-700',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  note: Note;
  onSelect: () => void;
}

export default function NoteCard({ note, onSelect }: Props) {
  const authorColor = AUTHOR_COLORS[note.author] ?? 'bg-gray-100 text-gray-700';

  return (
    <Pressable
      onPress={onSelect}
      className="bg-white rounded-2xl mx-4 mb-3 p-4 shadow-sm border border-gray-100 active:opacity-75"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className={`px-2.5 py-0.5 rounded-full ${authorColor.split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${authorColor.split(' ')[1]}`}>
            {note.author}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">{relativeTime(note.updated_at)}</Text>
      </View>
      <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
        {note.title}
      </Text>
      {note.body ? (
        <Text className="text-sm text-gray-500" numberOfLines={2}>
          {note.body}
        </Text>
      ) : null}
    </Pressable>
  );
}
