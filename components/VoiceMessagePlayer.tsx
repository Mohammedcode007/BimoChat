import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  uri: string;
  isMe: boolean;
}

export default function VoiceMessagePlayer({ uri, isMe }: Props) {

  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlayback = async () => {

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
          }
        }
      );

      soundRef.current = sound;
      setIsPlaying(true);

    } else {

      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const progressPercent = (position / duration) * 100;

  // موجات عشوائية ثابتة للشكل
  const waves = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 20) + 5
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isMe ? "#DCF8C6" : "#FFFFFF" }
      ]}
    >

      {/* Play Button */}
      <TouchableOpacity onPress={togglePlayback}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={22}
          color="#111"
        />
      </TouchableOpacity>

      {/* Waves */}
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
                    ? "#25D366"
                    : "#D1D5DB"
              }
            ]}
          />
        ))}
      </View>

      {/* Time */}
      <Text style={styles.timeText}>
        {isPlaying
          ? formatTime(position)
          : formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
maxWidth: 200,
minWidth: 200,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 10,
    flex: 1
  },
  waveBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2
  },
  timeText: {
    fontSize: 12,
    color: "#555"
  }
});
