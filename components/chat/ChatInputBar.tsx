// import Ionicons from "@expo/vector-icons/Ionicons";
// import React from "react";
// import { TextInput, TouchableOpacity, View } from "react-native";
// import Animated from "react-native-reanimated";

// import { styles } from "./styles";

// type ChatInputBarProps = {
//   isDark: boolean;
//   isBlocked: boolean;
//   insetsBottom: number;
//   inputBarAnimatedStyle: any;

//   text: string;
//   isRecording: boolean;

//   onTextChange: (value: string) => void;
//   onFocus: () => void;

//   onPickVideo: () => void;
//   onPickImage: () => void;

//   onSend: () => void;

//   onMicPressIn: () => void;
//   onMicPressOut: () => void;
// };

// export default function ChatInputBar({
//   isDark,
//   isBlocked,
//   insetsBottom,
//   inputBarAnimatedStyle,
//   text,
//   isRecording,
//   onTextChange,
//   onFocus,
//   onPickVideo,
//   onPickImage,
//   onSend,
//   onMicPressIn,
//   onMicPressOut,
// }: ChatInputBarProps) {
//   return (
//     <Animated.View
//       style={[
//         styles.inputBarWrap,
//         inputBarAnimatedStyle,
//         {
//           paddingBottom: Math.max(insetsBottom, 8),
//           backgroundColor: isDark ? "#0F172A" : "#FFF",
//           borderColor: isDark ? "#111827" : "#E5E7EB",
//           opacity: isBlocked ? 0.55 : 1,
//         },
//       ]}
//       pointerEvents={isBlocked ? "none" : "auto"}
//     >
//       <View
//         style={[
//           styles.inputBar,
//           {
//             backgroundColor: isDark ? "#0F172A" : "#FFF",
//             borderColor: isDark ? "#111827" : "#E5E7EB",
//           },
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.iconBtn}
//           onPress={onPickVideo}
//           activeOpacity={0.75}
//         >
//           <Ionicons
//             name="videocam-outline"
//             size={22}
//             color={isDark ? "#9CA3AF" : "#6B7280"}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.iconBtn}
//           onPress={onPickImage}
//           activeOpacity={0.75}
//         >
//           <Ionicons
//             name="image-outline"
//             size={22}
//             color={isDark ? "#9CA3AF" : "#6B7280"}
//           />
//         </TouchableOpacity>

//         <TextInput
//           style={[
//             styles.input,
//             {
//               backgroundColor: isDark ? "#111827" : "#F3F4F6",
//               color: isDark ? "#E5E7EB" : "#111827",
//             },
//           ]}
//           placeholder={isBlocked ? "لا يمكنك المراسلة أثناء الحظر" : "Type a message"}
//           placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
//           value={text}
//           onChangeText={onTextChange}
//           onFocus={onFocus}
//           multiline
//         />

//         {text.trim() ? (
//           <TouchableOpacity
//             style={styles.sendBtn}
//             onPress={onSend}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="send" size={20} color="#FFF" />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             style={styles.micBtn}
//             onPressIn={onMicPressIn}
//             onPressOut={onMicPressOut}
//             activeOpacity={0.75}
//           >
//             <Ionicons
//               name={isRecording ? "mic" : "mic-outline"}
//               size={22}
//               color={isRecording ? "red" : isDark ? "#9CA3AF" : "#6B7280"}
//             />
//           </TouchableOpacity>
//         )}
//       </View>
//     </Animated.View>
//   );
// }

import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import EmojiPicker, { EmojiType } from "rn-emoji-keyboard";

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

  onMicPressIn: () => void | Promise<void>;
  onMicPressOut: () => void | Promise<void>;

  // ✅ جديد للإلغاء عند السحب يسار
  onCancelRecording?: () => void | Promise<void>;

  // ✅ اختياري: عند السحب لأعلى
  // لو لم ترسلها، سنستخدم onMicPressOut كإيقاف مؤقت/معاينة
  onPauseRecording?: () => void | Promise<void>;
};

type RecordAction = "send" | "pause" | "cancel";
const EMOJI_KEYBOARD_HEIGHT = 340;
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
  onCancelRecording,
  onPauseRecording,
}: ChatInputBarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recordHint, setRecordHint] = useState("");
  const [recordAction, setRecordAction] = useState<RecordAction>("send");
  const inputRef = useRef<TextInput | null>(null);
const shouldFocusInputAfterEmojiRef = useRef(false);
const textRef = useRef(text);

useEffect(() => {
  textRef.current = text;
}, [text]);
  const longPressStartedRef = useRef(false);
  const actionDoneRef = useRef(false);

  const micScale = useRef(new RNAnimated.Value(1)).current;
  const micGlow = useRef(new RNAnimated.Value(0)).current;
  const micTranslateX = useRef(new RNAnimated.Value(0)).current;
  const micTranslateY = useRef(new RNAnimated.Value(0)).current;

  const hasText = Boolean(String(text || "").trim());

  const colors = useMemo(() => {
    return {
      barBackground: isDark ? "#0F172A" : "#FFFFFF",
      inputBackground: isDark ? "#111827" : "#F2F3F5",
      iconColor: isDark ? "#E5E7EB" : "#111827",
      mutedIcon: isDark ? "#6B7280" : "#9CA3AF",
      textColor: isDark ? "#E5E7EB" : "#111827",
      placeholder: isDark ? "#9CA3AF" : "#6B7280",
      border: isDark ? "#1F2937" : "#E5E7EB",
      danger: "#EF4444",
      warning: "#F59E0B",
      primary: "#2563EB",
      softDanger: "rgba(239,68,68,0.18)",
    };
  }, [isDark]);

  useEffect(() => {
    if (!isRecording) {
      micScale.stopAnimation();
      micGlow.stopAnimation();

      micScale.setValue(1);
      micGlow.setValue(0);
      micTranslateX.setValue(0);
      micTranslateY.setValue(0);

      setRecordHint("");
      setRecordAction("send");
      longPressStartedRef.current = false;
      actionDoneRef.current = false;
      return;
    }

    const loop = RNAnimated.loop(
      RNAnimated.parallel([
        RNAnimated.sequence([
          RNAnimated.timing(micScale, {
            toValue: 1.22,
            duration: 420,
            useNativeDriver: true,
          }),
          RNAnimated.timing(micScale, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
        RNAnimated.sequence([
          RNAnimated.timing(micGlow, {
            toValue: 1,
            duration: 420,
            useNativeDriver: false,
          }),
          RNAnimated.timing(micGlow, {
            toValue: 0,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [isRecording, micScale, micGlow, micTranslateX, micTranslateY]);

  const micBackgroundColor = micGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.softDanger, colors.danger],
  });

  const resetMicPosition = () => {
    RNAnimated.parallel([
      RNAnimated.spring(micTranslateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      RNAnimated.spring(micTranslateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEmojiPick = (emoji: EmojiType) => {
  const selectedEmoji = String(emoji?.emoji || "");
  if (!selectedEmoji) return;

  const nextText = `${textRef.current}${selectedEmoji}`;

  textRef.current = nextText;
  onTextChange(nextText);
};

  const startLongRecording = async () => {
    if (isBlocked || hasText || isRecording) return;

    longPressStartedRef.current = true;
    actionDoneRef.current = false;

    setRecordAction("send");
    setRecordHint("Slide left cancel • up pause");

    await onMicPressIn();
  };

  const finishRecordingNormally = async () => {
    if (actionDoneRef.current) return;
    actionDoneRef.current = true;

    resetMicPosition();
    setRecordHint("");
    setRecordAction("send");

    await onMicPressOut();
  };

  const cancelRecording = async () => {
    if (actionDoneRef.current) return;
    actionDoneRef.current = true;

    resetMicPosition();
    setRecordHint("");
    setRecordAction("cancel");

    if (onCancelRecording) {
      await onCancelRecording();
      return;
    }

    // fallback لو لم تضف onCancelRecording
    await onMicPressOut();
  };

  const pauseRecording = async () => {
    if (actionDoneRef.current) return;
    actionDoneRef.current = true;

    resetMicPosition();
    setRecordHint("");
    setRecordAction("pause");

    if (onPauseRecording) {
      await onPauseRecording();
      return;
    }

    // في كودك الحالي stopRecording يوقف التسجيل ويظهر المعاينة
    await onMicPressOut();
  };

  const handlePressOut = async () => {
    if (!longPressStartedRef.current) return;

    longPressStartedRef.current = false;

    if (!isRecording) return;
    if (actionDoneRef.current) return;

    await finishRecordingNormally();
  };

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,

      onMoveShouldSetPanResponder: (_, gesture) => {
        if (!isRecording) return false;
        return Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6;
      },

      onPanResponderMove: (_, gesture) => {
        if (!isRecording) return;

        const dx = gesture.dx;
        const dy = gesture.dy;

        micTranslateX.setValue(Math.max(-95, Math.min(0, dx)));
        micTranslateY.setValue(Math.max(-75, Math.min(0, dy)));

        if (dx < -65) {
          setRecordAction("cancel");
          setRecordHint("Release to cancel");
          return;
        }

        if (dy < -45) {
          setRecordAction("pause");
          setRecordHint("Release to pause");
          return;
        }

        setRecordAction("send");
        setRecordHint("Slide left cancel • up pause");
      },

      onPanResponderRelease: async (_, gesture) => {
        if (!isRecording) return;

        const dx = gesture.dx;
        const dy = gesture.dy;

        if (dx < -65) {
          await cancelRecording();
          return;
        }

        if (dy < -45) {
          await pauseRecording();
          return;
        }

        await finishRecordingNormally();
      },

      onPanResponderTerminate: async () => {
        if (!isRecording) return;
        await cancelRecording();
      },
    });
  }, [isRecording, micTranslateX, micTranslateY]);

  const renderRecordingBar = () => {
    if (!isRecording) return null;

    let iconName: keyof typeof Ionicons.glyphMap = "mic";
    let label = recordHint || "Slide left cancel • up pause";
    let color = colors.danger;

    if (recordAction === "cancel") {
      iconName = "trash-outline";
      label = "Release to cancel";
      color = colors.danger;
    }

    if (recordAction === "pause") {
      iconName = "pause-outline";
      label = "Release to pause";
      color = colors.warning;
    }

    return (
      <View
        style={[
          localStyles.recordingBar,
          {
            backgroundColor: colors.barBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={localStyles.recordingLeft}>
          <View style={[localStyles.recordingIconCircle, { backgroundColor: color }]}>
            <Ionicons name={iconName} size={15} color="#FFFFFF" />
          </View>

          <Text
            numberOfLines={1}
            style={[localStyles.recordingText, { color: colors.textColor }]}
          >
            {label}
          </Text>
        </View>
      </View>
    );
  };

  const openImage = () => {
    setAttachOpen(false);
    onPickImage();
  };

  const openVideo = () => {
    setAttachOpen(false);
    onPickVideo();
  };

  const closeEmojiAndOpenKeyboard = () => {
  shouldFocusInputAfterEmojiRef.current = true;
  setEmojiOpen(false);

  setTimeout(() => {
    if (!shouldFocusInputAfterEmojiRef.current) return;

    shouldFocusInputAfterEmojiRef.current = false;
    inputRef.current?.focus?.();
  }, 250);
};
  return (
    <>
      <Animated.View
        style={[
          localStyles.wrapper,
          inputBarAnimatedStyle,
          {
            bottom: emojiOpen ? EMOJI_KEYBOARD_HEIGHT : 0,
            paddingBottom: Math.max(insetsBottom, 0),
            backgroundColor: colors.barBackground,
            opacity: isBlocked ? 0.55 : 1,
          },
        ]}
        pointerEvents={isBlocked ? "none" : "auto"}
      >
        {renderRecordingBar()}

        <View
          style={[
            localStyles.inputContainer,
            {
              backgroundColor: colors.barBackground,
            },
          ]}
        >
          {/* ✅ كل الأيقونات داخل الإنبت */}
          <View
            style={[
              localStyles.inputPill,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
      onPress={() => {
  shouldFocusInputAfterEmojiRef.current = false;
  setAttachOpen(false);
  setEmojiOpen(true);
}}
              disabled={isBlocked || isRecording}
              activeOpacity={0.85}
              style={[
                localStyles.iconButton,
                {
                  opacity: isBlocked || isRecording ? 0.45 : 1,
                },
              ]}
            >
              <Ionicons
                name="happy-outline"
                size={23}
                color={isBlocked || isRecording ? colors.mutedIcon : colors.iconColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEmojiOpen(false);
                setAttachOpen(true);
              }}
              disabled={isBlocked || isRecording}
              activeOpacity={0.85}
              style={[
                localStyles.iconButton,
                {
                  opacity: isBlocked || isRecording ? 0.45 : 1,
                },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={25}
                color={isBlocked || isRecording ? colors.mutedIcon : colors.primary}
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}

              style={[
                localStyles.input,
                {
                  color: colors.textColor,
                },
              ]}
              placeholder={
                isBlocked
                  ? "لا يمكنك المراسلة أثناء الحظر"
                  : isRecording
                    ? "Recording..."
                    : "Type a message"
              }
              placeholderTextColor={colors.placeholder}
              value={text}
              onChangeText={onTextChange}
              onFocus={onFocus}
              multiline
              editable={!isBlocked && !isRecording}
              textAlignVertical="center"
            />

            {hasText ? (
              <TouchableOpacity
                style={localStyles.sendButton}
                onPress={onSend}
                activeOpacity={0.85}
                disabled={isBlocked}
              >
                <Ionicons name="send" size={18} color="grey" />
              </TouchableOpacity>
            ) : (
              <RNAnimated.View
                {...panResponder.panHandlers}
                style={[
                  localStyles.micAnimatedWrap,
                  {
                    transform: [
                      { scale: micScale },
                      { translateX: micTranslateX },
                      { translateY: micTranslateY },
                    ],
                  },
                ]}
              >
                <RNAnimated.View
                  style={[
                    localStyles.micGlow,
                    {
                      backgroundColor: isRecording
                        ? micBackgroundColor
                        : "transparent",
                    },
                  ]}
                >
                  <TouchableOpacity
                    delayLongPress={180}
                    onLongPress={startLongRecording}
                    onPressOut={handlePressOut}
                    disabled={isBlocked || hasText}
                    activeOpacity={0.9}
                    style={[
                      localStyles.micButton,
                      {
                        backgroundColor: isRecording
                          ? colors.danger
                          : "transparent",
                      },
                    ]}
                  >
                    <Ionicons
                      name={isRecording ? "mic" : "mic-outline"}
                      size={25}
                      color={isRecording ? "#FFFFFF" : colors.iconColor}
                    />
                  </TouchableOpacity>
                </RNAnimated.View>
              </RNAnimated.View>
            )}
          </View>
        </View>
      </Animated.View>

<EmojiPicker
  open={emojiOpen}
  onClose={closeEmojiAndOpenKeyboard}
  onEmojiSelected={handleEmojiPick}
  allowMultipleSelections
  enableSearchBar
  enableRecentlyUsed
  categoryPosition="top"
/>
<Modal
  visible={attachOpen}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() => setAttachOpen(false)}
>
  <Pressable
    style={localStyles.attachOverlay}
    onPress={() => setAttachOpen(false)}
  >
    <Pressable
      style={[
        localStyles.attachMiniBox,
        {
          backgroundColor: colors.barBackground,
          borderColor: colors.border,
          bottom: Math.max(insetsBottom, 0) + 62,
        },
      ]}
      onPress={() => {}}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openImage}
        style={[localStyles.attachMiniIcon, { backgroundColor: "#EEF2FF" }]}
      >
        <Ionicons name="image-outline" size={23} color="#4F46E5" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openVideo}
        style={[localStyles.attachMiniIcon, { backgroundColor: "#ECFDF5" }]}
      >
        <Ionicons name="videocam-outline" size={23} color="#10B981" />
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    zIndex: 999,
    elevation: 999,
  },

  inputContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  inputPill: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingVertical: 3,
  },

  iconButton: {
    width: 36,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 96,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },

  micAnimatedWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  micGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingBar: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
  },

  recordingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  recordingIconCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  recordingText: {
    fontSize: 13,
    fontWeight: "900",
  },
attachOverlay: {
  flex: 1,
  backgroundColor: "transparent",
},

attachMiniBox: {
  position: "absolute",

  // مكانه قريب من زر +
  left: 42,

  flexDirection: "row",
  alignItems: "center",
  gap: 10,

  paddingHorizontal: 8,
  paddingVertical: 7,

  borderWidth: 1,
  borderRadius: 999,

  elevation: 8,
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
},

attachMiniIcon: {
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
},
});