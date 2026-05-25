// import Ionicons from "@expo/vector-icons/Ionicons";
// import React from "react";
// import {
//     Animated,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import Reanimated from "react-native-reanimated";

// type RoomMessageInputProps = {
//   text: string;
//   setText: (value: string) => void;

//   uploadingVisible: boolean;
//   pendingVoiceUri: string | null;
//   recording: any;

//   pulseAnim: Animated.Value;

//   inputBarAnimatedStyle: any;

//   styles: any;
//   theme: any;

//   onLayoutHeight: (height: number) => void;
//   onOpenMediaPicker: () => void;
//   onSendText: () => void;
//   onStartRecording: () => void;
//   onStopRecording: () => void;
//   onInputFocus?: () => void;
// };

// export default function RoomMessageInput({
//   text,
//   setText,
//   uploadingVisible,
//   pendingVoiceUri,
//   recording,
//   pulseAnim,
//   inputBarAnimatedStyle,
//   styles,
//   theme,
//   onLayoutHeight,
//   onOpenMediaPicker,
//   onSendText,
//   onStartRecording,
//   onStopRecording,
//   onInputFocus,
// }: RoomMessageInputProps) {
//   const hasText = Boolean(String(text || "").trim());

//   return (
//     <Reanimated.View
//       onLayout={(e) => {
//         onLayoutHeight(e.nativeEvent.layout.height);
//       }}
//       style={[styles.inputBarWrap, inputBarAnimatedStyle]}
//     >
//       <View style={styles.inputBar}>
//         <TouchableOpacity
//           onPress={onOpenMediaPicker}
//           disabled={uploadingVisible}
//           activeOpacity={0.85}
//           style={{
//             width: 42,
//             height: 42,
//             borderRadius: 16,
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: theme.surface2,
//             borderWidth: 1,
//             borderColor: theme.border,
//             opacity: uploadingVisible ? 0.5 : 1,
//           }}
//         >
//           <Ionicons
//             name="add-circle-outline"
//             size={25}
//             color={theme.text}
//           />
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Type a message"
//           placeholderTextColor={theme.subtleText}
//           value={text}
//           onFocus={onInputFocus}
//           onChangeText={setText}
//           multiline
//         />

//         {hasText ? (
//           <TouchableOpacity
//             onPress={onSendText}
//             disabled={uploadingVisible}
//             activeOpacity={0.85}
//             style={{
//               opacity: uploadingVisible ? 0.5 : 1,
//             }}
//           >
//             <Ionicons name="send" size={22} color={theme.primary} />
//           </TouchableOpacity>
//         ) : (
//           <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//             <TouchableOpacity
//               onPressIn={onStartRecording}
//               onPressOut={onStopRecording}
//               disabled={uploadingVisible || !!pendingVoiceUri}
//               activeOpacity={0.85}
//               style={{
//                 opacity: uploadingVisible || !!pendingVoiceUri ? 0.5 : 1,
//               }}
//             >
//               <Ionicons
//                 name="mic"
//                 size={26}
//                 color={recording ? theme.danger : theme.text}
//               />
//             </TouchableOpacity>
//           </Animated.View>
//         )}
//       </View>
//     </Reanimated.View>
//   );
// }
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated from "react-native-reanimated";
import EmojiPicker, { EmojiType } from "rn-emoji-keyboard";

type RoomMessageInputProps = {
  text: string;
  setText: (value: string) => void;

  uploadingVisible: boolean;
  pendingVoiceUri: string | null;
  recording: any;

  inputBarAnimatedStyle: any;
  theme: any;

  onLayoutHeight: (height: number) => void;

  onOpenMediaPicker: () => void;

  onSendText: () => void;

  onStartRecording: () => void | Promise<void>;
  onPauseRecording?: () => void | Promise<void>;
  onCancelRecording?: () => void | Promise<void>;
  onSendRecording: () => void | Promise<void>;

  onInputFocus?: () => void;
};

const EMOJI_KEYBOARD_HEIGHT = 340;

export default function RoomMessageInput({
  text,
  setText,
  uploadingVisible,
  pendingVoiceUri,
  recording,
  inputBarAnimatedStyle,
  theme,
  onLayoutHeight,
  onOpenMediaPicker,
  onSendText,
  onStartRecording,
  onPauseRecording,
  onCancelRecording,
  onSendRecording,
  onInputFocus,
}: RoomMessageInputProps) {
  const hasText = Boolean(String(text || "").trim());
  const isRecording = Boolean(recording);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recordHint, setRecordHint] = useState("");
  const [recordAction, setRecordAction] = useState<"send" | "pause" | "cancel">(
    "send"
  );

  const inputRef = useRef<TextInput | null>(null);
  const textRef = useRef(text);
  const shouldFocusInputAfterEmojiRef = useRef(false);

  const longPressStartedRef = useRef(false);
  const actionDoneRef = useRef(false);

  const micScale = useRef(new Animated.Value(1)).current;
  const micGlow = useRef(new Animated.Value(0)).current;
  const micTranslateX = useRef(new Animated.Value(0)).current;
  const micTranslateY = useRef(new Animated.Value(0)).current;

  const inputBackground = useMemo(() => {
    return theme.inputBackground || theme.surface2 || theme.card || "#F2F3F5";
  }, [theme]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

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

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(micScale, {
            toValue: 1.22,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(micScale, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(micGlow, {
            toValue: 1,
            duration: 420,
            useNativeDriver: false,
          }),
          Animated.timing(micGlow, {
            toValue: 0,
            duration: 420,
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [isRecording, micScale, micGlow, micTranslateX, micTranslateY]);

  const micBackgroundColor = micGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.dangerSoft || "rgba(239,68,68,0.18)",
      theme.danger || "#EF4444",
    ],
  });

  const updateRoomText = (value: string) => {
    textRef.current = value;
    setText(value);
  };

  const resetMicPosition = () => {
    Animated.parallel([
      Animated.spring(micTranslateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(micTranslateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEmojiPick = (emoji: EmojiType) => {
    const selectedEmoji = String(emoji?.emoji || "");
    if (!selectedEmoji) return;

    const nextText = `${textRef.current}${selectedEmoji}`;
    updateRoomText(nextText);
  };

  const closeEmojiAndOpenKeyboard = () => {
    shouldFocusInputAfterEmojiRef.current = true;
    setEmojiOpen(false);

    setTimeout(() => {
      if (!shouldFocusInputAfterEmojiRef.current) return;

      shouldFocusInputAfterEmojiRef.current = false;
      inputRef.current?.focus?.();
      onInputFocus?.();
    }, 250);
  };

  const openEmoji = () => {
    shouldFocusInputAfterEmojiRef.current = false;
    setEmojiOpen(true);
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

        micTranslateX.setValue(Math.max(-90, Math.min(0, dx)));
        micTranslateY.setValue(Math.max(-70, Math.min(0, dy)));

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

        resetMicPosition();

        if (dx < -65) {
          setRecordHint("");
          setRecordAction("cancel");
          actionDoneRef.current = true;
          await onCancelRecording?.();
          return;
        }

        if (dy < -45) {
          setRecordHint("Paused");
          setRecordAction("pause");
          actionDoneRef.current = true;
          await onPauseRecording?.();
          return;
        }

        setRecordHint("");
        setRecordAction("send");
        actionDoneRef.current = true;
        await onSendRecording();
      },

      onPanResponderTerminate: async () => {
        resetMicPosition();

        if (!isRecording) return;

        setRecordHint("");
        setRecordAction("cancel");
        actionDoneRef.current = true;
        await onCancelRecording?.();
      },
    });
  }, [
    isRecording,
    micTranslateX,
    micTranslateY,
    onCancelRecording,
    onPauseRecording,
    onSendRecording,
  ]);

  const handleMicLongPress = async () => {
    if (uploadingVisible || pendingVoiceUri || hasText || isRecording) return;

    longPressStartedRef.current = true;
    actionDoneRef.current = false;

    setRecordAction("send");
    setRecordHint("Slide left cancel • up pause");

    await onStartRecording();
  };

  const handleMicPressOut = async () => {
    if (!longPressStartedRef.current) return;

    longPressStartedRef.current = false;

    if (!isRecording) return;
    if (actionDoneRef.current) return;

    actionDoneRef.current = true;

    resetMicPosition();
    setRecordHint("");
    setRecordAction("send");

    await onSendRecording();
  };

  const renderRecordingLabel = () => {
    if (!isRecording) return null;

    let iconName: keyof typeof Ionicons.glyphMap = "mic";
    let label = recordHint || "Slide left cancel • up pause";
    let color = theme.danger || "#EF4444";

    if (recordAction === "cancel") {
      iconName = "trash-outline";
      label = "Release to cancel";
      color = theme.danger || "#EF4444";
    }

    if (recordAction === "pause") {
      iconName = "pause-outline";
      label = "Release to pause";
      color = theme.warning || "#F59E0B";
    }

    return (
      <View
        style={[
          localStyles.recordingBar,
          {
            backgroundColor: theme.card || "#FFFFFF",
          },
        ]}
      >
        <View style={localStyles.recordingLeft}>
          <View
            style={[
              localStyles.recordingIconCircle,
              {
                backgroundColor: color,
              },
            ]}
          >
            <Ionicons name={iconName} size={15} color="#FFFFFF" />
          </View>

          <Text
            numberOfLines={1}
            style={[
              localStyles.recordingText,
              {
                color: theme.text || "#111827",
              },
            ]}
          >
            {label}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={[
            localStyles.slideText,
            {
              color: theme.subtleText || "#6B7280",
            },
          ]}
        >
          Slide left cancel • up pause
        </Text>
      </View>
    );
  };

  return (
    <>
      <Reanimated.View
        onLayout={(e) => {
          onLayoutHeight(e.nativeEvent.layout.height);
        }}
        style={[
          localStyles.wrapper,
          inputBarAnimatedStyle,
          {
            bottom: emojiOpen ? EMOJI_KEYBOARD_HEIGHT : 0,
          },
        ]}
      >
        {renderRecordingLabel()}

        <View
          style={[
            localStyles.inputContainer,
            {
              backgroundColor: inputBackground,
            },
          ]}
        >
          <TouchableOpacity
            onPress={openEmoji}
            disabled={uploadingVisible || isRecording}
            activeOpacity={0.85}
            style={[
              localStyles.iconButton,
              {
                opacity: uploadingVisible || isRecording ? 0.45 : 1,
              },
            ]}
          >
            <Ionicons
              name="happy-outline"
              size={23}
              color={theme.text || "#111827"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenMediaPicker}
            disabled={uploadingVisible || isRecording}
            activeOpacity={0.85}
            style={[
              localStyles.iconButton,
              {
                opacity: uploadingVisible || isRecording ? 0.45 : 1,
              },
            ]}
          >
            <Ionicons
              name="add"
              size={25}
              color={theme.primary || theme.text || "#111827"}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[
              localStyles.input,
              {
                color: theme.text || "#111827",
              },
            ]}
            placeholder={isRecording ? "Recording..." : "Type a message"}
            placeholderTextColor={theme.subtleText || "#9CA3AF"}
            value={text}
            onFocus={onInputFocus}
            onChangeText={updateRoomText}
            multiline
            editable={!isRecording && !uploadingVisible}
            textAlignVertical="center"
          />

          {hasText ? (
            <TouchableOpacity
              onPress={onSendText}
              disabled={uploadingVisible}
              activeOpacity={0.85}
              style={[
                localStyles.sendButton,
                {
                  backgroundColor: "transparent",
                  opacity: uploadingVisible ? 0.45 : 1,
                },
              ]}
            >
              <Ionicons
                name="send"
                size={20}
                color={theme.subtleText || "#6B7280"}
              />
            </TouchableOpacity>
          ) : (
            <Animated.View
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
              <Animated.View
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
                  onLongPress={handleMicLongPress}
                  onPressOut={handleMicPressOut}
                  disabled={uploadingVisible || !!pendingVoiceUri}
                  activeOpacity={0.9}
                  style={[
                    localStyles.micButton,
                    {
                      backgroundColor: isRecording
                        ? theme.danger || "#EF4444"
                        : "transparent",
                      opacity:
                        uploadingVisible || !!pendingVoiceUri ? 0.45 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={isRecording ? "mic" : "mic-outline"}
                    size={25}
                    color={isRecording ? "#FFFFFF" : theme.text || "#111827"}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </Reanimated.View>

      <EmojiPicker
        open={emojiOpen}
        onClose={closeEmojiAndOpenKeyboard}
        onEmojiSelected={handleEmojiPick}
        allowMultipleSelections
        enableSearchBar
        enableRecentlyUsed
        categoryPosition="top"
      />
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
    paddingBottom: 0,
    zIndex: 999,
    elevation: 999,
  },

  inputContainer: {
    minHeight: 56,
    maxHeight: 130,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 0,
    borderRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  micAnimatedWrap: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  micGlow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  micButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingBar: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  slideText: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "700",
    maxWidth: 185,
  },
});