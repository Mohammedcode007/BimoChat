import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type NotifyToastCustomProps = {
  title?: string;
  subtitle?: string;
  avatar?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  count?: number;
};

type NotifyToastProps = {
  text1?: string;
  text2?: string;
  props?: NotifyToastCustomProps;
};

function NotifyToast({ props }: NotifyToastProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const data = props || {};

  const initials = (data.title || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  return (
    <Pressable
      onPress={data.onPress}
      style={{
        width: "92%",
        alignSelf: "center",
        minHeight: 74,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.background,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row-reverse",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      {data.avatar ? (
        <Image
          source={{ uri: data.avatar }}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            marginLeft: 12,
          }}
        />
      ) : (
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            marginLeft: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.surface2,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "900" }}>{initials}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: theme.text,
              fontSize: 14,
              fontWeight: "900",
              textAlign: "right",
            }}
          >
            {data.title || "إشعار جديد"}
          </Text>

          {!!data.count && data.count > 1 && (
            <View
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: 11,
                paddingHorizontal: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primary + "18",
              }}
            >
              <Text style={{ color: theme.primary, fontWeight: "900", fontSize: 11 }}>
                {data.count}
              </Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={2}
          style={{
            marginTop: 4,
            color: theme.text,
            fontSize: 12,
            fontWeight: "700",
            textAlign: "right",
            lineHeight: 18,
          }}
        >
          {data.subtitle || ""}
        </Text>
      </View>

      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface2,
          marginRight: 10,
        }}
      >
        <Ionicons
          name={data.iconName || "notifications"}
          size={18}
          color={theme.primary}
        />
      </View>
    </Pressable>
  );
}

export const toastConfig = {
  notify: (props: NotifyToastProps) => <NotifyToast {...props} />,
};