// components/roomScreen/ReactionDetailsModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { REACTIONS } from "./constants";
import { MessageUI, Reaction } from "./types";

export default function ReactionDetailsModal({
  visible,
  message,
  onClose,
  theme,
}: {
  visible: boolean;
  message: MessageUI | null;
  onClose: () => void;
  theme: typeof Colors.light;
}) {
  const reactions = useMemo(() => {
    return Array.isArray(message?.reactions) ? message!.reactions! : [];
  }, [message]);

  const grouped = useMemo(() => {
    return REACTIONS.map((emoji) => ({
      emoji,
      users: reactions.filter((reaction) => reaction.emoji === emoji),
    })).filter((group) => group.users.length > 0);
  }, [reactions]);

  const total = reactions.length || Number(message?.reactionCount || 0);

  const [activeEmoji, setActiveEmoji] = useState<Reaction | "all">("all");

  useEffect(() => {
    if (!visible) return;

    const firstEmoji = grouped[0]?.emoji;
    setActiveEmoji(firstEmoji || "all");
  }, [visible, message?.id, grouped]);

  const visibleUsers = useMemo(() => {
    if (activeEmoji === "all") {
      return reactions;
    }

    return reactions.filter((reaction) => reaction.emoji === activeEmoji);
  }, [activeEmoji, reactions]);

  const uniqueUsers = useMemo(() => {
    return visibleUsers.filter((user, index, arr) => {
      const id = String(user.userId || user.username || index);

      return (
        arr.findIndex((item) => {
          return String(item.userId || item.username) === id;
        }) === index
      );
    });
  }, [visibleUsers]);

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
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 22,
            borderWidth: 1,
            borderColor: theme.border,
            maxHeight: "70%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                Reactions
              </Text>

              <Text
                style={{
                  color: theme.mutedText,
                  fontSize: 12,
                  fontWeight: "700",
                  marginTop: 3,
                }}
              >
                Total: {total}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {grouped.length > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 10,
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveEmoji("all")}
                  style={{
                    paddingHorizontal: 12,
                    height: 36,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    backgroundColor:
                      activeEmoji === "all" ? theme.tint : theme.surface2,
                    borderWidth: 1,
                    borderColor:
                      activeEmoji === "all" ? theme.tint : theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: activeEmoji === "all" ? "#FFFFFF" : theme.text,
                      fontSize: 13,
                      fontWeight: "900",
                    }}
                  >
                    All {total}
                  </Text>
                </TouchableOpacity>

                {grouped.map((group) => {
                  const active = activeEmoji === group.emoji;

                  return (
                    <TouchableOpacity
                      key={group.emoji}
                      activeOpacity={0.85}
                      onPress={() => setActiveEmoji(group.emoji)}
                      style={{
                        paddingHorizontal: 12,
                        height: 36,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        backgroundColor: active ? theme.tint : theme.surface2,
                        borderWidth: 1,
                        borderColor: active ? theme.tint : theme.border,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {group.emoji}
                      </Text>

                      <Text
                        style={{
                          marginLeft: 6,
                          color: active ? "#FFFFFF" : theme.text,
                          fontSize: 13,
                          fontWeight: "900",
                        }}
                      >
                        {group.users.length}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View
                style={{
                  height: 1,
                  backgroundColor: theme.separator,
                  marginBottom: 8,
                }}
              />

              <ScrollView showsVerticalScrollIndicator={false}>
                {uniqueUsers.map((user, index) => (
                  <View
                    key={`${user.emoji}-${user.userId || user.username || index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 11,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.separator,
                    }}
                  >
                    <Text
                      style={{
                        width: 34,
                        fontSize: 18,
                        textAlign: "center",
                      }}
                    >
                      {user.emoji}
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: "900",
                      }}
                      numberOfLines={1}
                    >
                      {user.username || "مستخدم"}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <View
              style={{
                paddingVertical: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="heart-outline"
                size={34}
                color={theme.mutedText}
              />

              <Text
                style={{
                  color: theme.mutedText,
                  fontSize: 13,
                  fontWeight: "800",
                  textAlign: "center",
                  marginTop: 10,
                  lineHeight: 20,
                }}
              >
                لا توجد تفاصيل مستخدمين متاحة لهذا الرياكشن.
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}