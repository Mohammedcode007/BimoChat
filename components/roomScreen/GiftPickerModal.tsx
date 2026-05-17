// components/roomScreen/GiftPickerModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";

import { TEMP_GIFTS } from "./giftHelpers";
import { UserUI } from "./types";


export default function GiftPickerModal({
  visible,
  onClose,
  target,
  onPick,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  target?: UserUI | null;
  onPick: (gift: { key: string }) => void;
  theme: typeof Colors.light;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 18,
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
          onPress={() => {}}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: theme.text,
                }}
              >
                Send a Gift
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: theme.mutedText,
                }}
                numberOfLines={1}
              >
                To: {target?.name || "User"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: theme.separator,
              marginVertical: 12,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {TEMP_GIFTS.map((gift) => (
              <TouchableOpacity
                key={gift.key}
                activeOpacity={0.85}
                onPress={() => onPick({ key: gift.key })}
                style={{
                  width: "30%",
                  minWidth: 95,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface2,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                {gift.lottie ? (
                  <LottieView
                    source={gift.lottie}
                    autoPlay
                    loop
                    style={{
                      width: 56,
                      height: 56,
                    }}
                  />
                ) : (
                  <Text style={{ fontSize: 24 }}>{gift.icon || "🎁"}</Text>
                )}

                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: "800",
                    color: theme.text,
                  }}
                  numberOfLines={1}
                >
                  {gift.title}
                </Text>

                {!!gift.price && (
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: theme.mutedText,
                      fontWeight: "700",
                    }}
                  >
                    {gift.price} Coinz
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

    
        </Pressable>
      </Pressable>
    </Modal>
  );
}