// import { Ionicons } from "@expo/vector-icons";
// import { Audio } from "expo-av";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from "react-native";

// interface Props {
//   uri: string;
//   onSend: () => Promise<void>;
//   onCancel: () => void;
//   topOffset?: number;
// }

// export default function VoiceRecorderPreview({
//   uri,
//   onSend,
//   onCancel,
//   topOffset = 90
// }: Props) {
//   const soundRef = useRef<Audio.Sound | null>(null);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(1);
//   const [isSending, setIsSending] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (soundRef.current) {
//         soundRef.current.unloadAsync();
//       }
//     };
//   }, []);

//   const formatTime = (millis: number) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
//   };

//   const togglePlayback = async () => {
//     if (!soundRef.current) {
//       const { sound } = await Audio.Sound.createAsync(
//         { uri },
//         { shouldPlay: true },
//         (status) => {
//           if (!status.isLoaded) return;

//           setPosition(status.positionMillis || 0);
//           setDuration(status.durationMillis || 1);

//           if (status.didJustFinish) {
//             setIsPlaying(false);
//             setPosition(0);
//           }
//         }
//       );

//       soundRef.current = sound;
//       setIsPlaying(true);
//     } else {
//       if (isPlaying) {
//         await soundRef.current.pauseAsync();
//         setIsPlaying(false);
//       } else {
//         await soundRef.current.playAsync();
//         setIsPlaying(true);
//       }
//     }
//   };

//   const handleSend = async () => {
//     if (isSending) return;

//     setIsSending(true);

//     if (soundRef.current) {
//       await soundRef.current.stopAsync();
//     }

//     try {
//       await onSend();
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const progressPercent = (position / duration) * 100;

//   const waves = useMemo(
//     () =>
//       Array.from({ length: 20 }, () => Math.floor(Math.random() * 18) + 6),
//     []
//   );

//   return (
//     <View style={[styles.container, { top: topOffset }]}>
//       <TouchableOpacity onPress={onCancel} disabled={isSending} style={styles.sideButton}>
//         <Ionicons name="trash-outline" size={22} color="#EF4444" />
//       </TouchableOpacity>

//       <View style={styles.player}>
//         <TouchableOpacity
//           onPress={togglePlayback}
//           disabled={isSending}
//           style={styles.playButton}
//         >
//           <Ionicons
//             name={isPlaying ? "pause" : "play"}
//             size={22}
//             color="#111"
//           />
//         </TouchableOpacity>

//         <View style={styles.waveContainer}>
//           {waves.map((height, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.waveBar,
//                 {
//                   height,
//                   backgroundColor:
//                     index < (waves.length * progressPercent) / 100
//                       ? "#25D366"
//                       : "#D1D5DB"
//                 }
//               ]}
//             />
//           ))}
//         </View>

//         <Text style={styles.time}>
//           {isPlaying ? formatTime(position) : formatTime(duration)}
//         </Text>
//       </View>

//       <TouchableOpacity
//         onPress={handleSend}
//         disabled={isSending}
//         style={styles.sendButton}
//       >
//         {isSending ? (
//           <ActivityIndicator size="small" color="#25D366" />
//         ) : (
//           <Ionicons name="send" size={22} color="#25D366" />
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     left: 12,
//     right: 12,
//     zIndex: 999,
//     elevation: 999,

//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     flexDirection: "row",
//     alignItems: "center",

//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 16,

//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 }
//   },
//   sideButton: {
//     width: 34,
//     alignItems: "center",
//     justifyContent: "center"
//   },
//   player: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginHorizontal: 10
//   },
//   playButton: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F3F4F6"
//   },
//   waveContainer: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     flex: 1,
//     marginHorizontal: 8
//   },
//   waveBar: {
//     width: 3,
//     marginHorizontal: 1,
//     borderRadius: 2
//   },
//   time: {
//     fontSize: 12,
//     color: "#555",
//     minWidth: 40,
//     textAlign: "right"
//   },
//   sendButton: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F0FDF4"
//   }
// });
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  uri: string;
  onSend: () => Promise<void>;
  onCancel: () => void;
  topOffset?: number;
}

export default function VoiceRecorderPreview({
  uri,
  onSend,
  onCancel,
  topOffset = 90,
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return () => {
      try {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      } catch {}
    };
  }, []);

  const formatTime = (millis: number) => {
    const safeMillis = Math.max(0, Number(millis || 0));
    const totalSeconds = Math.floor(safeMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlayback = async () => {
    try {
      if (isSending) return;

      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (!status.isLoaded) return;

            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 1);

            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);

              try {
                soundRef.current?.setPositionAsync(0);
              } catch {}
            }
          }
        );

        soundRef.current = sound;
        setIsPlaying(true);
        return;
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleCancel = async () => {
    if (isSending) return;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}

    setIsPlaying(false);
    setPosition(0);
    onCancel();
  };

  const handleSend = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch {}
      }

      setIsPlaying(false);
      await onSend();
    } finally {
      setIsSending(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (position / Math.max(duration, 1)) * 100)
  );

  const waves = useMemo(
    () =>
      Array.from({ length: 24 }, () => Math.floor(Math.random() * 18) + 6),
    []
  );

  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View pointerEvents="box-none" style={styles.modalRoot}>
        <View style={[styles.container, { marginTop: topOffset }]}>
          <TouchableOpacity
            onPress={handleCancel}
            disabled={isSending}
            style={styles.sideButton}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </TouchableOpacity>

          <View style={styles.player}>
            <TouchableOpacity
              onPress={togglePlayback}
              disabled={isSending}
              style={styles.playButton}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color="#111827"
              />
            </TouchableOpacity>

            <View style={styles.waveContainer}>
              {waves.map((h, index) => {
                const active = index / waves.length < progressPercent / 100;

                return (
                  <View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        height: h,
                        backgroundColor: active ? "#25D366" : "#D1D5DB",
                      },
                    ]}
                  />
                );
              })}
            </View>

            <Text style={styles.time}>{formatTime(position)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending}
            style={styles.sendButton}
            activeOpacity={0.85}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#25D366" />
            ) : (
              <Ionicons name="send" size={22} color="#25D366" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    zIndex: 999999,
    elevation: 999999,
  },

  container: {
    width: "100%",
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 20,
  },

  sideButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
  },

  player: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0,
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  waveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    flex: 1,
    marginHorizontal: 8,
    height: 28,
    overflow: "hidden",
  },

  waveBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },

  time: {
    fontSize: 12,
    color: "#555",
    minWidth: 40,
    textAlign: "right",
    fontWeight: "700",
  },

  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
  },
});