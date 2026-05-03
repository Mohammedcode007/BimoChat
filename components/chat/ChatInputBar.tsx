import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

import { styles } from "./styles";

type ChatInputBarProps = {
  isDark: boolean;
  isBlocked: boolean;
  insetsBottom: number;
  inputBarAnimatedStyle: any;

  text: string;
  isRecording: boolean;

  onTextChange: (value: string) => void;
  onFocus: () => void;

  onPickVideo: () => void;
  onPickImage: () => void;

  onSend: () => void;

  onMicPressIn: () => void;
  onMicPressOut: () => void;
};

export default function ChatInputBar({
  isDark,
  isBlocked,
  insetsBottom,
  inputBarAnimatedStyle,
  text,
  isRecording,
  onTextChange,
  onFocus,
  onPickVideo,
  onPickImage,
  onSend,
  onMicPressIn,
  onMicPressOut,
}: ChatInputBarProps) {
  return (
    <Animated.View
      style={[
        styles.inputBarWrap,
        inputBarAnimatedStyle,
        {
          paddingBottom: Math.max(insetsBottom, 8),
          backgroundColor: isDark ? "#0F172A" : "#FFF",
          borderColor: isDark ? "#111827" : "#E5E7EB",
          opacity: isBlocked ? 0.55 : 1,
        },
      ]}
      pointerEvents={isBlocked ? "none" : "auto"}
    >
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFF",
            borderColor: isDark ? "#111827" : "#E5E7EB",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPickVideo}
          activeOpacity={0.75}
        >
          <Ionicons
            name="videocam-outline"
            size={22}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPickImage}
          activeOpacity={0.75}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#111827" : "#F3F4F6",
              color: isDark ? "#E5E7EB" : "#111827",
            },
          ]}
          placeholder={isBlocked ? "لا يمكنك المراسلة أثناء الحظر" : "Type a message"}
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          value={text}
          onChangeText={onTextChange}
          onFocus={onFocus}
          multiline
        />

        {text.trim() ? (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={onSend}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micBtn}
            onPressIn={onMicPressIn}
            onPressOut={onMicPressOut}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={22}
              color={isRecording ? "red" : isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}