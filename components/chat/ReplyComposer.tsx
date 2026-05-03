import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";
import { ReplyState } from "./types";

type ReplyComposerProps = {
  replyToMessage: ReplyState;
  isDark: boolean;
  getReplyPreviewText: (msg: any) => string;
  onClose: () => void;
};

export default function ReplyComposer({
  replyToMessage,
  isDark,
  getReplyPreviewText,
  onClose,
}: ReplyComposerProps) {
  if (!replyToMessage) return null;

  return (
    <View
      style={[
        styles.replyComposer,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFF",
          borderColor: isDark ? "#1F2937" : "#E5E7EB",
        },
      ]}
    >
      <View style={styles.replyComposerLine} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.replyComposerTitle, { color: "#6D5DF6" }]}>
          Replying
        </Text>

        <Text
          numberOfLines={2}
          style={{
            color: isDark ? "#CBD5E1" : "#374151",
            fontSize: 13,
            marginTop: 2,
          }}
        >
          {getReplyPreviewText(replyToMessage)}
        </Text>
      </View>

      <TouchableOpacity onPress={onClose} activeOpacity={0.75}>
        <Ionicons
          name="close"
          size={20}
          color={isDark ? "#CBD5E1" : "#374151"}
        />
      </TouchableOpacity>
    </View>
  );
}