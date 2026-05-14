
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  uri: string;
  isMe: boolean;
}

export default function VoiceMessagePlayer({ uri, isMe }: Props) {
  const player = useAudioPlayer(uri, {
    updateInterval: 250,
    downloadFirst: false,
  });

  const status = useAudioPlayerStatus(player);

  const isPlaying = Boolean(status?.playing);
  const position = Number(status?.currentTime || 0);
  const duration = Math.max(Number(status?.duration || 0), 0);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(Number(seconds || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (e) {
      console.log("togglePlayback error:", e);
    }
  };

  const seekForward = async () => {
    try {
      const next = Math.min(duration || 0, position + 10);
      await player.seekTo(next);
    } catch (e) {
      console.log("seekForward error:", e);
    }
  };

  const seekBackward = async () => {
    try {
      const next = Math.max(0, position - 10);
      await player.seekTo(next);
    } catch (e) {
      console.log("seekBackward error:", e);
    }
  };

  const progressPercent =
    duration > 0 ? Math.max(0, Math.min(100, (position / duration) * 100)) : 0;

const waves = useMemo(
  () => [
    4, 7, 5, 8, 4, 6, 9, 5, 7, 4,
    8, 6, 5, 7, 4, 8, 5, 6, 9, 4,
    7, 5, 8, 4, 6, 9, 5, 7, 4, 8,
    6, 5, 7, 4, 8, 5, 6, 9
  ],
  []
);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isMe ? "#F8FAFC" : "#FFFFFF" }
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={togglePlayback}
          style={styles.playBtn}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color="#111827"
            style={!isPlaying ? { marginLeft: 2 } : undefined}
          />
        </TouchableOpacity>

        <View style={styles.waveSection}>
          <View style={styles.waveContainer}>
            {waves.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor:
                      index < (waves.length * progressPercent) / 100
                        ? "#111827"
                        : "#D1D5DB"
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={seekBackward}
          style={styles.seekBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="play-back" size={15} color="#475569" />
          <Text style={styles.seekText}>10s</Text>
        </TouchableOpacity>

        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>

        <TouchableOpacity
          onPress={seekForward}
          style={styles.seekBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.seekText}>10s</Text>
          <Ionicons name="play-forward" size={15} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  waveSection: {
    flex: 1,
    justifyContent: "center",
  },
waveContainer: {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  width: "100%",
  height: 16,
},
 waveBar: {
  width: 1.5,
  borderRadius: 999,
},
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seekBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
  },
  seekText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
});