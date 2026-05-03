import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Modal, Pressable, TouchableOpacity, View } from "react-native";

export function ImagePreviewModal({
  visible,
  imageUrl,
  onClose,
  s,
}: {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
  s: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.imageModalOverlay}>
        <Pressable style={s.imageModalBackdrop} onPress={onClose} />

        <View style={s.imageModalHeader}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={s.imageModalCloseBtn}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={s.imageModalContent}>
          {!!imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={s.imageModalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}