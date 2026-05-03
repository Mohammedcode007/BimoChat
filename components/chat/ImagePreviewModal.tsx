import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Modal, Pressable, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";

type ImagePreviewModalProps = {
  imagePreview: string | null;
  onClose: () => void;
};

export default function ImagePreviewModal({
  imagePreview,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <Modal
      visible={!!imagePreview}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.previewOverlay}>
        <Pressable style={styles.previewCloseArea} onPress={onClose} />

        <View style={styles.previewHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.previewCloseBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.previewBody}>
          {!!imagePreview && (
            <Image
              source={{ uri: imagePreview }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}