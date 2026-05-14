import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  hidden: boolean;
  top: number;
  isDark: boolean;
  title?: string;
  progressMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onHide: () => void;
  onShow: () => void;
  onClose: () => void;
};

export default function MiniAudioBar({
  visible,
  hidden,
  top,
  isDark,
  title,
  progressMillis,
  durationMillis,
  isPlaying,
  onTogglePlay,
  onHide,
  onShow,
  onClose,
}: Props) {
  if (!visible) return null;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(Math.max(0, Number(millis || 0)) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress =
    durationMillis > 0
      ? Math.max(0, Math.min(100, (progressMillis / durationMillis) * 100))
      : 0;

  const bg = isDark ? "#0F172A" : "#FFFFFF";
  const border = isDark ? "#334155" : "#E5E7EB";
  const text = isDark ? "#E5E7EB" : "#111827";
  const subText = isDark ? "#CBD5E1" : "#64748B";
  const softBg = isDark ? "#1E293B" : "#F1F5F9";
  const progressBg = isDark ? "#334155" : "#E5E7EB";

  if (hidden) {
    return (
      <View pointerEvents="box-none" style={[styles.overlay, { top }]}>
        <TouchableOpacity
          onPress={onShow}
          activeOpacity={0.85}
          style={[
            styles.restoreBtn,
            {
              backgroundColor: bg,
              borderColor: border,
            },
          ]}
        >
          <Ionicons
            name={isPlaying ? "volume-high" : "volume-medium"}
            size={16}
            color={text}
          />

          <Text numberOfLines={1} style={[styles.restoreText, { color: text }]}>
            الصوت شغال
          </Text>

          <Ionicons name="chevron-down" size={16} color={subText} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top }]}>
      <View
        style={[
          styles.player,
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onTogglePlay}
          style={[styles.playBtn, { backgroundColor: softBg }]}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={15}
            color={text}
            style={!isPlaying ? { marginLeft: 1 } : undefined}
          />
        </TouchableOpacity>

        <Text numberOfLines={1} style={[styles.title, { color: text }]}>
          {title || "Voice message"}
        </Text>

        <Text style={[styles.time, { color: subText }]}>
          {formatTime(progressMillis)}
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: progressBg }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <TouchableOpacity onPress={onHide} style={styles.iconBtn} activeOpacity={0.85}>
          <Ionicons name="chevron-up" size={18} color={subText} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.85}>
          <Ionicons name="close" size={18} color={subText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },

  player: {
    width: "94%",
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingLeft: 7,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },

  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 6,
  },

  time: {
    fontSize: 10,
    fontWeight: "800",
    minWidth: 34,
    textAlign: "center",
    marginRight: 6,
  },

  progressTrack: {
    width: 44,
    height: 3,
    borderRadius: 99,
    overflow: "hidden",
    marginRight: 3,
  },

  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#2563EB",
  },

  iconBtn: {
    width: 25,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  restoreBtn: {
    alignSelf: "flex-end",
    marginRight: 12,
    height: 34,
    maxWidth: 150,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
  },

  restoreText: {
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 85,
  },
});