// components/roomScreen/MediaPickerModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
    Modal,
    Pressable,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";

export default function MediaPickerModal({
  visible,
  onClose,
  onPickImage,
  onPickGif,
  onPickSticker,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onPickGif: () => void;
  onPickSticker: () => void;
  theme: typeof Colors.light;
}) {
  const Option = ({
    icon,
    color,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        onClose();
        requestAnimationFrame(onPress);
      }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },
        elevation: 5,
      }}
    >
      <Ionicons name={icon} size={23} color={color} />
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "transparent",
          justifyContent: "flex-end",
        }}
      >
        <View
          pointerEvents="box-none"
          style={{
            paddingHorizontal: 14,
            paddingBottom: 72,
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.08)",
            }}
          >
            <Option
              icon="image-outline"
              color="#2563EB"
              onPress={onPickImage}
            />

            <Option
              icon="film-outline"
              color="#A855F7"
              onPress={onPickGif}
            />

            <Option
              icon="happy-outline"
              color="#F59E0B"
              onPress={onPickSticker}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}