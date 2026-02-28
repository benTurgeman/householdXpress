import { Redirect } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthor } from '@/src/context/AuthorContext';
import type { Author } from '@/src/types/notes';

export default function IndexScreen() {
  const { author, setAuthor } = useAuthor();

  // Once author is selected, go straight to notes
  if (author) {
    return <Redirect href="/notes" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-gray-900 mb-2">HouseholdXpress</Text>
        <Text className="text-gray-500 text-base mb-12 text-center">
          Shared notes for the household
        </Text>
        <Text className="text-lg font-semibold text-gray-700 mb-6">Who are you?</Text>
        <View className="w-full gap-4">
          {(['Ben', 'Wife'] as Author[]).map((name) => (
            <Pressable
              key={name}
              onPress={() => setAuthor(name)}
              className="bg-white border-2 border-blue-200 rounded-2xl py-5 items-center shadow-sm active:bg-blue-50"
            >
              <Text className="text-xl font-semibold text-blue-700">
                {name === 'Ben' ? "I'm Ben" : "I'm Wife"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
