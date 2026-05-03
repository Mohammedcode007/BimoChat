// components/roomScreen/StickerPickerModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { STICKER_PACKS, StickerItem } from "@/data/roomStickers";

export default function StickerPickerModal({
  visible,
  onClose,
  onPick,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (item: StickerItem) => void;
  theme: typeof Colors.light;
}) {
  const [activePackId, setActivePackId] = useState(
    STICKER_PACKS[0]?.id || ""
  );

  const activePack = useMemo(() => {
    return (
      STICKER_PACKS.find((pack) => pack.id === activePackId) ||
      STICKER_PACKS[0]
    );
  }, [activePackId]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.28)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 10,
            paddingBottom: 16,
            borderWidth: 1,
            borderColor: theme.border,
            height: 330,
          }}
        >
          <View
            style={{
              width: 42,
              height: 5,
              borderRadius: 999,
              backgroundColor: theme.border,
              alignSelf: "center",
              marginBottom: 10,
            }}
          />

          <View
            style={{
              paddingHorizontal: 14,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              Stickers
            </Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="close" size={19} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: theme.separator,
              paddingVertical: 7,
              marginBottom: 10,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 12,
                gap: 8,
              }}
            >
              {STICKER_PACKS.map((pack) => {
                const active = pack.id === activePackId;

                return (
                  <TouchableOpacity
                    key={pack.id}
                    activeOpacity={0.85}
                    onPress={() => setActivePackId(pack.id)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active ? theme.tint : theme.surface2,
                      borderWidth: 1,
                      borderColor: active ? theme.tint : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 23 }}>{pack.icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={activePack?.stickers || []}
            keyExtractor={(item) => item.id}
            numColumns={4}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 8,
              gap: 8,
            }}
            columnWrapperStyle={{
              gap: 8,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  onClose();

                  requestAnimationFrame(() => {
                    onPick(item);
                  });
                }}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.surface2,
                  borderWidth: 1,
                  borderColor: theme.border,
                  overflow: "hidden",
                  padding: 6,
                }}
              >
                <Image
                  source={{ uri: item.url }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View
                style={{
                  paddingVertical: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="happy-outline"
                  size={30}
                  color={theme.mutedText}
                />

                <Text
                  style={{
                    marginTop: 8,
                    color: theme.mutedText,
                    fontSize: 13,
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                >
                  لا توجد استيكرات في هذه المجموعة.
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}