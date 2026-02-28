import { Pressable, Text, View } from 'react-native';

import type { NoteFilter } from '@/src/types/notes';

const FILTERS: { label: string; value: NoteFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Ben', value: 'Ben' },
  { label: 'Wife', value: 'Wife' },
];

interface Props {
  value: NoteFilter;
  onChange: (f: NoteFilter) => void;
}

export default function FilterBar({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-2 px-4 py-2">
      {FILTERS.map((f) => (
        <Pressable
          key={f.value}
          onPress={() => onChange(f.value)}
          className={`px-4 py-1.5 rounded-full border ${
            value === f.value
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              value === f.value ? 'text-white' : 'text-gray-600'
            }`}
          >
            {f.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
