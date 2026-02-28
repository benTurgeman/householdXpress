import { ActivityIndicator, Text, View } from 'react-native';

interface Props {
  label?: string;
}

export default function LoadingSpinner({ label }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="large" color="#3b82f6" />
      {label ? <Text className="text-gray-500 text-sm">{label}</Text> : null}
    </View>
  );
}
