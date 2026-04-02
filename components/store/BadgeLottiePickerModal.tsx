import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LottieBadge from "../LottieBadge";

type Props = {
  visible: boolean;
  onClose: () => void;
  items: any[];
  selectedKey?: string;
  onConfirm: (item: any, setActive: boolean) => void;

  theme: any;
  isRTL: boolean;
  t: (key: string) => string;

  loading?: boolean;
  coinz?: number;
};

function formatCoinz(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.round(x).toLocaleString();
}

export default function BadgeLottiePickerModal({
  visible,
  onClose,
  items,
  selectedKey,
  onConfirm,
  theme,
  isRTL,
  t,
  loading = false,
  coinz = 0,
}: Props) {
  const [pickedKey, setPickedKey] = useState<string>(selectedKey || "");
  const [setActive, setSetActive] = useState(true);

  const row = isRTL ? "row-reverse" : "row";
  const textAlign = isRTL ? "right" : "left";
  const writingDirection = isRTL ? "rtl" : "ltr";

  const selectedItem = useMemo(() => {
    return items.find((x) => String(x.key) === String(pickedKey)) || null;
  }, [items, pickedKey]);

  const badgeItems = useMemo(() => {
    return (items || []).filter((x) => String(x.type) === "badge");
  }, [items]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={() => (loading ? null : onClose())}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          padding: 14,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            borderRadius: 20,
            padding: 14,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            maxHeight: "82%",
          }}
        >
          <View
            style={{
              flexDirection: row,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                fontWeight: "900",
                textAlign,
                writingDirection,
              }}
            >
              {t("storeScreen.badgePicker.title")}
            </Text>

            <TouchableOpacity disabled={loading} onPress={onClose}>
              <Text style={{ color: theme.subtleText, fontSize: 18, padding: 6 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: theme.mutedText,
              fontSize: 12,
              marginTop: 6,
              textAlign,
              writingDirection,
            }}
          >
            {t("storeScreen.badgePicker.subtitle")}
          </Text>

          <View
            style={{
              marginTop: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface2,
              padding: 12,
            }}
          >
            {!selectedItem ? (
              <Text
                style={{
                  color: theme.subtleText,
                  textAlign,
                  writingDirection,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {t("storeScreen.badgePicker.selectOne")}
              </Text>
            ) : (
              <View style={{ flexDirection: row, gap: 12, alignItems: "center" }}>
            <View
  style={{
    width: 66,
    height: 66,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  }}
>
  {selectedItem?.meta?.lottieUrl ? (
    <LottieBadge url={selectedItem.meta.lottieUrl} size={58} />
  ) : (
    <Text style={{ color: theme.subtleText, fontWeight: "900" }}>
      {t("storeScreen.common.img")}
    </Text>
  )}
</View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "900",
                      fontSize: 15,
                      textAlign,
                      writingDirection,
                    }}
                  >
                    {selectedItem.name || selectedItem.key}
                  </Text>

                  <Text
                    style={{
                      color: theme.mutedText,
                      fontSize: 12,
                      marginTop: 4,
                      textAlign,
                      writingDirection,
                    }}
                  >
                    {selectedItem.description || t("storeScreen.badgePicker.defaultDesc")}
                  </Text>

                  <Text
                    style={{
                      color: theme.pillGoldFg,
                      fontSize: 13,
                      fontWeight: "900",
                      marginTop: 6,
                      textAlign,
                      writingDirection,
                    }}
                  >
                    {formatCoinz(Number(selectedItem.priceCoinz || 2000))} {t("storeScreen.common.coinz")}
                    {"  •  "}
                    {Number(selectedItem.durationDays || 30)} {t("storeScreen.common.daysSuffix")}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <FlatList
            data={badgeItems}
            keyExtractor={(item) => String(item._id || item.key)}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
            renderItem={({ item }) => {
              const selected = String(item.key) === String(pickedKey);

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPickedKey(String(item.key))}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1.4,
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.primarySoft : theme.surface2,
                    padding: 12,
                  }}
                >
                  <View style={{ flexDirection: row, gap: 12, alignItems: "center" }}>
              <View
  style={{
    width: 54,
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  }}
>
  {item?.meta?.lottieUrl ? (
    <LottieBadge url={item.meta.lottieUrl} size={46} />
  ) : (
    <Text style={{ color: theme.subtleText, fontWeight: "900" }}>
      {t("storeScreen.common.img")}
    </Text>
  )}
</View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 14,
                          fontWeight: "900",
                          textAlign,
                          writingDirection,
                        }}
                        numberOfLines={1}
                      >
                        {item.name || item.key}
                      </Text>

                      <Text
                        style={{
                          color: theme.mutedText,
                          fontSize: 12,
                          marginTop: 4,
                          textAlign,
                          writingDirection,
                        }}
                        numberOfLines={2}
                      >
                        {item.description || t("storeScreen.badgePicker.defaultDesc")}
                      </Text>

                      <Text
                        style={{
                          color: theme.pillGoldFg,
                          fontSize: 12,
                          fontWeight: "900",
                          marginTop: 5,
                          textAlign,
                          writingDirection,
                        }}
                      >
                        {formatCoinz(Number(item.priceCoinz || 2000))} {t("storeScreen.common.coinz")}
                        {"  •  "}
                        {Number(item.durationDays || 30)} {t("storeScreen.common.daysSuffix")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View
            style={{
              marginTop: 12,
              flexDirection: row,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: theme.mutedText,
                fontSize: 13,
                fontWeight: "800",
                textAlign,
                writingDirection,
              }}
            >
              {t("storeScreen.badgePicker.activateNow")}
            </Text>

            <TouchableOpacity
              disabled={loading}
              onPress={() => setSetActive((v) => !v)}
              style={{
                width: 54,
                height: 30,
                borderRadius: 999,
                padding: 3,
                justifyContent: "center",
                backgroundColor: setActive ? theme.primary : theme.disabledBg,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  backgroundColor: theme.primaryText,
                  alignSelf: setActive
                    ? isRTL
                      ? "flex-start"
                      : "flex-end"
                    : isRTL
                      ? "flex-end"
                      : "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 14, flexDirection: row, gap: 10 }}>
            <TouchableOpacity
              disabled={loading}
              onPress={onClose}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface2,
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>
                {t("storeScreen.common.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!selectedItem || loading}
              onPress={() => {
                if (!selectedItem) return;
                onConfirm(selectedItem, setActive);
              }}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "transparent",
                backgroundColor: theme.primary,
                opacity: !selectedItem || loading ? 0.62 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.primaryText} />
              ) : (
                <Text style={{ color: theme.primaryText, fontWeight: "900", fontSize: 14 }}>
                  {t("storeScreen.purchase.confirm")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: theme.subtleText,
              fontSize: 12,
              marginTop: 10,
              textAlign,
              writingDirection,
            }}
          >
            {t("storeScreen.common.yourBalance")} {formatCoinz(coinz)} {t("storeScreen.common.coinz")}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}