import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { MessageItem } from "@/redux/slices/messageSlice";
import { styles } from "./styles";

type RoomInviteCardProps = {
  item: MessageItem;
  isMe: boolean;
  isDark: boolean;
  onJoin: (roomId: string) => void;
};

export default function RoomInviteCard({
  item,
  isMe,
  isDark,
  onJoin,
}: RoomInviteCardProps) {
  const invite = (item as any).roomInvite;

  if (!invite?.roomId) return null;

  return (
    <View
      style={[
        styles.inviteCard,
        {
          backgroundColor: isMe
            ? "rgba(255,255,255,0.12)"
            : isDark
              ? "#0F172A"
              : "#EEF2FF",
          borderColor: isMe
            ? "rgba(255,255,255,0.18)"
            : isDark
              ? "#1F2937"
              : "#C7D2FE",
        },
      ]}
    >
      <View style={styles.inviteTopRow}>
        {!!invite.roomAvatar ? (
          <Image
            source={{ uri: invite.roomAvatar }}
            style={styles.inviteAvatar}
          />
        ) : (
          <View style={styles.inviteAvatarPlaceholder}>
            <Ionicons name="people-outline" size={18} color="#FFF" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={[
              styles.inviteRoomName,
              {
                color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827",
              },
            ]}
          >
            {invite.roomName || "غرفة"}
          </Text>

          {!!invite.invitedByName && (
            <Text
              numberOfLines={1}
              style={[
                styles.inviteMetaText,
                {
                  color: isMe
                    ? "rgba(255,255,255,0.85)"
                    : isDark
                      ? "#CBD5E1"
                      : "#4B5563",
                },
              ]}
            >
              دعوة من {invite.invitedByName}
            </Text>
          )}
        </View>
      </View>

      {!!(invite.message || item.content) && (
        <Text
          style={[
            styles.inviteMessageText,
            {
              color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827",
            },
          ]}
        >
          {invite.message || item.content}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.joinRoomBtn}
        onPress={() => onJoin(invite.roomId)}
      >
        <Ionicons name="enter-outline" size={16} color="#FFF" />
        <Text style={styles.joinRoomBtnText}>انضمام للغرفة</Text>
      </TouchableOpacity>
    </View>
  );
}