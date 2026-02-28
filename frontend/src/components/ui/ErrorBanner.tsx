import { Pressable, Text, View } from 'react-native';

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <View className="bg-red-50 border border-red-200 rounded-lg mx-4 my-2 p-3 flex-row items-center justify-between">
      <Text className="text-red-700 flex-1 text-sm">{message}</Text>
      <Pressable onPress={onDismiss} className="ml-2 p-1">
        <Text className="text-red-500 font-bold">✕</Text>
      </Pressable>
    </View>
  );
}
