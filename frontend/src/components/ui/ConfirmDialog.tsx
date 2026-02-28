import { Modal, Pressable, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ visible, title, message, onConfirm, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          <Text className="text-lg font-semibold text-gray-900 mb-2">{title}</Text>
          <Text className="text-gray-600 mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 border border-gray-300 rounded-xl py-3 items-center"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 bg-red-500 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-medium">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
