// components/roomScreen/MessageItem.tsx

import { Feather, Octicons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Alert,
  Animated,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import CricketGameMessage from "@/components/room/CricketGameMessage";
import { Colors } from "@/constants/theme";
import { getTextDirectionStyle } from "@/utils/textDirection";

import { stripHtmlToText } from "../stripHtmlToText";
import {
  CustomEmojiBadgeView,
  DynamicUserBadge,
  pickPrimaryBadge,
} from "./badgeHelpers";
import {
  getStarColor,
  resolveAvatarSource,
  resolveMessageTextColor,
  resolveUsernameColor,
  shouldShowStar,
} from "./helpers";
import PinnedHtmlWebView from "./PinnedHtmlWebView";
import { MessageUI, UserUI } from "./types";

export default function MessageItem({
  item,
  isMe,
  showName,
  onLongPress,
  onPressImage,
  onTogglePlay,
  playingId,
  progressAnim,
  onGiftDone,
  onAvatarPress,
  onAvatarLongPress,
  onOpenAudioModal,
  theme,
  bubble,
  currentUserId,
  onSendCricketJoin,
  onSendCricketPlay,
  onSendSongLove,
    onSendBombColorAnswer,

  onOpenReactionDetails,
}: {
  item: MessageUI;
  isMe: boolean;
  showName: boolean;
  onLongPress: () => void;
  onPressImage: (uri: string) => void;
  onTogglePlay: (uri: string, id: string) => void;
  playingId: string | null;
  progressAnim: Animated.Value;
  onGiftDone?: () => void;
  onAvatarPress: (u?: UserUI) => void;
  onAvatarLongPress: (u?: UserUI) => void;
  onOpenAudioModal: (message: MessageUI) => void;
  theme: typeof Colors.light;
  bubble: any;
  currentUserId: string;
  onSendCricketJoin?: (gameId: string) => void;
  onSendCricketPlay?: (gameId: string, n: number) => void;
  onSendSongLove?: (songCode: string) => void;
    onSendBombColorAnswer?: (
    color: "red" | "green" | "blue",
    challengeId?: string
  ) => void;
  onOpenReactionDetails?: (message: MessageUI) => void;
}) {
  const { width } = useWindowDimensions();
  const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

const normalizeUrl = (url: string) => {
  const clean = String(url || "").trim();

  if (!clean) return "";

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  if (/^www\./i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
};

const openMessageLink = async (url: string) => {
  try {
    const safeUrl = normalizeUrl(url);

    if (!safeUrl) return;

    const canOpen = await Linking.canOpenURL(safeUrl);

    if (!canOpen) {
      Alert.alert("Error", "Cannot open this link");
      return;
    }

    await Linking.openURL(safeUrl);
  } catch (e) {
    Alert.alert("Error", "Failed to open link");
  }
};

const renderMessageTextWithLinks = (text?: string) => {
  const value = String(text || "");

  if (!value) return null;

  const parts = value.split(URL_REGEX);

  return parts.map((part, index) => {
    const isLink = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i.test(part);

    if (!isLink) {
      return (
        <Text key={`text-${index}`}>
          {part}
        </Text>
      );
    }

    return (
      <Text
        key={`link-${index}`}
        onPress={() => openMessageLink(part)}
        style={{
          color: "#2563EB",
          fontWeight: "800",
          textDecorationLine: "underline",
        }}
      >
        {part}
      </Text>
    );
  });
};
  type CricketMessageUI = MessageUI & {
    type: "game";
    game: {
      gameType: "cricket" | string;
      gameId?: string;
      title?: string;
      state?: string;
      turnUserId?: string;
      winnerUserId?: string;
      payload?: any;
    };
  };
  function isCricketMessage(item: MessageUI): item is CricketMessageUI {
    return item.type === "game" && item.game?.gameType === "cricket";
  }
  function isSugarLuckMessage(item: MessageUI) {
    return item.type === "game" && item.game?.gameType === "luck";
  }
  function isShotMessage(item: MessageUI) {
  return (
    item.type === "game" &&
    (
      item.game?.gameType === "shot" ||
      item.game?.payload?.game === "shot_game" ||
      item.game?.payload?.command === "shot" ||
      item.action === "shot_game" ||
      item.meta?.action === "shot_game"
    )
  );
}
function isLookalikeMessage(item: MessageUI) {
  return (
    item.type === "game" &&
    (
      item.game?.gameType === "lookalike" ||
      item.game?.payload?.game === "lookalike_game" ||
      item.game?.payload?.action === "lookalike_game" ||
      item.meta?.action === "lookalike_game" ||
      item.action === "lookalike_game"
    )
  );
}
  function isAnaTitleMessage(item: MessageUI) {
  return (
    item.type === "game" &&
    (
      item.game?.gameType === "ana_title" ||
      item.game?.payload?.game === "ana_title_game"
    )
  );
}
  function isDuelMessage(item: MessageUI) {
  return item.type === "game" && item.game?.gameType === "duel";
}
function isBombColorMessage(item: MessageUI) {
  return (
    item.type === "game" &&
    (
      item.game?.gameType === "bomb" ||
      item.game?.payload?.game === "bomb_color" ||
      item.game?.title === "Bomb Color"
    )
  );
}
  const copyUserNameOnly = async (user?: UserUI) => {
    const name = String(user?.name || "").trim();
    if (!name) return;

    await Clipboard.setStringAsync(name);
    Alert.alert("Copied", "Name copied");
  };
  const copyMessageContent = async () => {
    if (item.type === "system") return;
    if (item.deletedForEveryone) return;

    const value =
      item.type === "text"
        ? item.text || ""
        : item.type === "file"
          ? item.text || item.uri || ""
          : item.type === "image" || item.type === "video" || item.type === "audio"
            ? item.uri || ""
            : "";

    const v = String(value || "").trim();
    if (!v) return;

    await Clipboard.setStringAsync(v);
  };
  if (item.type === "song" || (item.type === "system" && item.systemType === "music")) {
    const audioUrl = String(item.music?.audioUrl || item.uri || "").trim();

    const playedByName = String(
      item.music?.playedByName ||
      item.sender?.name ||
      "مستخدم"
    ).trim();

    const songCode = String(item.music?.songCode || "").trim().toUpperCase();
    const loveCommand = String(
      item.music?.loveCommand || (songCode ? `love@${songCode}` : "")
    ).trim();



    return (
      <View style={bubble.sysWrap}>
        <View
          style={[
            bubble.sysBubble,
            {
              width: Math.min(width - 36, 340),
              padding: 12,
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: "900",
              fontSize: 14,
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {item.music?.title || item.text || "Audio Track"}
          </Text>

          <Text
            style={{
              color: theme.mutedText,
              fontSize: 12,
              marginTop: 6,
              textAlign: "center",
              fontWeight: "800",
            }}
            numberOfLines={1}
          >
            الأغنية من {playedByName}
          </Text>

          {!!item.music?.channel && (
            <Text
              style={{
                color: theme.mutedText,
                fontSize: 12,
                marginTop: 4,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {item.music.channel}
            </Text>
          )}

          {!!songCode && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={async () => {
                await Clipboard.setStringAsync(loveCommand);
                Alert.alert("تم النسخ", `تم نسخ ${loveCommand}`);
              }}
              style={{
                marginTop: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                ID: {songCode}
              </Text>
            </TouchableOpacity>
          )}

          {!!audioUrl && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                onOpenAudioModal({
                  ...item,
                  type: "audio",
                  uri: audioUrl,
                  text: item.music?.title || item.text || "Audio Track",
                })
              }
              style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text,
                  fontWeight: "500",
                }}
              >
                Audio track{" "}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#2563EB",
                  fontWeight: "800",
                }}
              >
                Play
              </Text>
            </TouchableOpacity>
          )}

          {!!songCode ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onSendSongLove?.(songCode)}
              style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: "rgba(239,68,68,0.12)",
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.25)",
              }}
            >
              <Ionicons name="heart" size={16} color="#EF4444" />

              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 13,
                  color: "#EF4444",
                  fontWeight: "900",
                }}
              >
                للإعجاب اضغط إعجاب
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                marginTop: 10,
                color: theme.mutedText,
                fontSize: 12,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              للإعجاب استخدم أمر الإعجاب الخاص بالأغنية
            </Text>
          )}

          <Text style={[bubble.sysTime, { marginTop: 8 }]}>{item.time}</Text>
        </View>
      </View>
    );
  }

  if (item.type === "system") {
    const isJoin = item.systemType === "join";
    const isLeave = item.systemType === "leave";

    const systemText = String(item.text || "").trim();

    const isPrivateMentionStatus =
      systemText.includes("Private message sent") ||
      systemText.includes("Private message failed") ||
      systemText.includes("User @") ||
      systemText.includes("You cannot send a private mention message");

    if (isJoin || isLeave) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {isJoin && (
              <Octicons
                name="sign-in"
                size={16}
                color={theme.text}
                style={{ marginRight: 6 }}
              />
            )}

            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {item.text}
            </Text>

            {isLeave && (
              <Feather
                name="log-out"
                size={16}
                color={theme.text}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        </View>
      );
    }

    // ✅ هذا التعديل خاص برسائل المنشن فقط
    if (isPrivateMentionStatus) {
      const isSuccess = systemText.includes("Private message sent");

      const cleanText = systemText
        .replace(/^✅\s*/, "")
        .replace(/^❌\s*/, "")
        .trim();

      return (
        <View style={bubble.sysWrap}>
          <View
            style={[
              bubble.privateMentionBubble,
              {
                borderColor: isSuccess
                  ? "rgba(22,163,74,0.25)"
                  : "rgba(239,68,68,0.25)",
                backgroundColor: isSuccess
                  ? "rgba(22,163,74,0.08)"
                  : "rgba(239,68,68,0.08)",
              },
            ]}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "close-circle"}
              size={16}
              color={isSuccess ? "#16A34A" : "#EF4444"}
              style={{ marginRight: 6 }}
            />

            <Text
              style={[
                bubble.privateMentionText,
                {
                  color: isSuccess ? "#166534" : "#991B1B",
                },
              ]}
              numberOfLines={2}
            >
              {cleanText}
            </Text>
          </View>
        </View>
      );
    }
const hasHtml = /<[a-z][\s\S]*>/i.test(systemText);

return (
  <View style={bubble.sysWrap}>
    <View style={[bubble.sysBubble, { width: width - 50 }]}>
      {hasHtml ? (
        <PinnedHtmlWebView
          html={systemText}
          width={width - 70}
          minHeight={36}
          textColor={theme.text}
          textAlign="center"
          fontSize={14}
          lineHeight={24}
        />
      ) : (
        <Text
          style={{
            color: theme.text,
            fontSize: 14,
            lineHeight: 22,
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          {systemText}
        </Text>
      )}
    </View>
  </View>
);
   
  }
  if (isLookalikeMessage(item)) {
  const payload = item.game?.payload || {};

  const targetName = String(payload?.targetName || "").trim();

  const title = String(
    payload?.title ||
      item.game?.title ||
      item.text ||
      ""
  ).trim();

  return (
    <View style={[bubble.row, bubble.rowOther]}>
<Pressable
  style={bubble.avatarWrapLeft}
  onPress={() => onAvatarPress(item.sender)}
  onLongPress={() => onAvatarLongPress(item.sender)}
  delayLongPress={350}
>
<Image
  source={{
    uri:
      item.game?.payload?.avatar ||
      item.meta?.avatar ||
      item.sender?.avatar ||
      item.sender?.avatarGif ||
      "https://res.cloudinary.com/dmejkp0m4/image/upload/v1778658281/k7pj9rdqhuipqr0ecu1v.jpg",
  }}
  style={[
    bubble.avatar,
    {
      borderColor: "#F59E0B",
      borderWidth: 2,
    },
  ]}
  contentFit="cover"
  cachePolicy="memory-disk"
  transition={0}
/>
</Pressable>
      <TouchableOpacity
        activeOpacity={0.88}
        onLongPress={onLongPress}
        style={[bubble.bubble, bubble.bubbleOther]}
      >
        <View style={bubble.nameWrap}>
          <View style={[bubble.nameRow, { alignSelf: "flex-start" }]}>
            <Text
              style={[
                bubble.senderName,
                {
                  color: "#F59E0B",
                  flexShrink: 1,
                  flexWrap: "wrap",
                },
              ]}
              numberOfLines={1}
            >
              game
            </Text>
          </View>

          <View style={bubble.nameUnderline} />
        </View>

        {!!targetName && (
          <Text
            style={[
              bubble.msgText,
              {
                fontWeight: "900",
                marginBottom: 4,
                color: theme.text,
              },
            ]}
            numberOfLines={1}
          >
            شبيه {targetName}
          </Text>
        )}

        <Text
          style={[
            bubble.msgText,
            {
              color: "#F59E0B",
              fontSize: 18,
              fontWeight: "900",
            },
            getTextDirectionStyle(title),
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
if (isShotMessage(item)) {
  const payload = item.game?.payload || {};

  const title = String(item.game?.title || "🔫 Shot").trim();
  const state = String(item.game?.state || payload?.state || "").trim();
  const pointsChange = Number(payload?.pointsChange || 0);
  const balance = Number(payload?.balance || 0);

  const targetName = String(payload?.targetName || "").trim();
  const targetEmoji = String(payload?.targetEmoji || "🎯").trim();

  const isWin = state === "win" || pointsChange > 0;
  const isMiss = state === "miss";

  const accentColor = isWin ? "#22C55E" : isMiss ? "#94A3B8" : "#F59E0B";

  return (
    <View style={bubble.sysWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
        style={[
          bubble.sysBubble,
          {
            width: Math.min(width - 36, 360),
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: `${accentColor}55`,
            backgroundColor:
              theme.background === "#000" ||
              String(theme.background).toLowerCase().includes("000")
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
          },
        ]}
      >
        <View
          style={{
            alignSelf: "stretch",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 20 }}>🔫</Text>

          <Text
            style={{
              marginLeft: 6,
              color: accentColor,
              fontSize: 14,
              fontWeight: "900",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            Shot
          </Text>
        </View>

        {!!title && (
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: "900",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {title}
          </Text>
        )}

        {!!targetName && (
          <View
            style={{
              marginBottom: 8,
              alignSelf: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${accentColor}18`,
              borderWidth: 1,
              borderColor: `${accentColor}45`,
            }}
          >
            <Text
              style={{
                color: accentColor,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              {targetEmoji} {targetName}
            </Text>
          </View>
        )}

        <Text
          style={[
            {
              color: theme.text,
              fontSize: 13,
              lineHeight: 22,
              fontWeight: "800",
              textAlign: "center",
            },
            getTextDirectionStyle(item.text || ""),
          ]}
        >
          {item.text}
        </Text>

        {typeof payload?.player?.points !== "undefined" ? (
          <View
            style={{
              marginTop: 10,
              alignSelf: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${accentColor}18`,
              borderWidth: 1,
              borderColor: `${accentColor}45`,
            }}
          >
            <Text
              style={{
                color: accentColor,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Balance: {payload.player.points} points
            </Text>
          </View>
        ) : balance ? (
          <View
            style={{
              marginTop: 10,
              alignSelf: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${accentColor}18`,
              borderWidth: 1,
              borderColor: `${accentColor}45`,
            }}
          >
            <Text
              style={{
                color: accentColor,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Balance: {balance} points
            </Text>
          </View>
        ) : null}

        <Text style={[bubble.sysTime, { marginTop: 8 }]}>
          {item.time}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
  if (isAnaTitleMessage(item)) {
  const payload = item.game?.payload || {};

  const targetName = String(
    payload?.targetName ||
      item.game?.title ||
      ""
  ).trim();

  const title = String(
    payload?.title ||
      item.game?.title ||
      item.text ||
      ""
  ).trim();

  return (
    <View style={bubble.sysWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
        style={[
          bubble.sysBubble,
          {
            width: Math.min(width - 36, 320),
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.35)",
            backgroundColor:
              theme.background === "#000" ||
              String(theme.background).toLowerCase().includes("000")
                ? "rgba(255,255,255,0.06)"
                : "rgba(245,158,11,0.08)",
          },
        ]}
      >
        <View
          style={{
            alignSelf: "stretch",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="game-controller-outline"
            size={17}
            color="#F59E0B"
          />

          <Text
            style={{
              marginLeft: 6,
              color: "#F59E0B",
              fontSize: 13,
              fontWeight: "900",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            game
          </Text>
        </View>

        {!!targetName && (
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: "900",
              textAlign: "center",
              marginBottom: 6,
            }}
            numberOfLines={1}
          >
            {targetName}
          </Text>
        )}

        <Text
          style={{
            color: "#F59E0B",
            fontSize: 22,
            lineHeight: 30,
            fontWeight: "900",
            textAlign: "center",
          }}
          numberOfLines={2}
        >
          {title}
        </Text>

    
      </TouchableOpacity>
    </View>
  );
}

  if (isSugarLuckMessage(item)) {
    const title = String(item.game?.title || "سُــــــكَّــــــر").trim();
    const state = String(item.game?.state || "").trim();
    const pointsChange = Number(item.game?.payload?.pointsChange || 0);

    const isWin =
      state.includes("win") ||
      state === "mega_win" ||
      pointsChange > 0;

    const isLoss =
      state.includes("loss") ||
      pointsChange < 0;

    const accentColor = isWin
      ? "#22C55E"
      : isLoss
        ? "#EF4444"
        : "#F59E0B";

    return (
      <View style={bubble.sysWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={onLongPress}
          style={[
            bubble.sysBubble,
            {
              width: Math.min(width - 36, 360),
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: `${accentColor}55`,
              backgroundColor:
                theme.background === "#000" || String(theme.background).toLowerCase().includes("000")
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
            },
          ]}
        >
          <View
            style={{
              alignSelf: "stretch",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="game-controller-outline" size={17} color={accentColor} />

            <Text
              style={{
                marginLeft: 6,
                color: accentColor,
                fontSize: 14,
                fontWeight: "900",
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              سُــــــكَّــــــر
            </Text>
          </View>

          {!!title && (
            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "900",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {title}
            </Text>
          )}

          <Text
            style={[
              {
                color: theme.text,
                fontSize: 13,
                lineHeight: 22,
                fontWeight: "800",
              },
              getTextDirectionStyle(item.text || ""),
            ]}
          >
            {item.text}
          </Text>

          {typeof item.game?.payload?.player?.points !== "undefined" && (
            <View
              style={{
                marginTop: 10,
                alignSelf: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: `${accentColor}18`,
                borderWidth: 1,
                borderColor: `${accentColor}45`,
              }}
            >
              <Text
                style={{
                  color: accentColor,
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                الرصيد: {item.game.payload.player.points} نقطة  
              </Text>
            </View>
          )}

          <Text style={[bubble.sysTime, { marginTop: 8 }]}>
            {item.time}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
if (isDuelMessage(item)) {
  const title = String(item.game?.title || "لعبة ضرب").trim();
  const state = String(item.game?.state || "").trim();
  const payload = item.game?.payload || {};

  const rawAnimationUrl = String(
    payload?.animation?.lottieUrl ||
      payload?.lottieUrl ||
      item.uri ||
      ""
  ).trim();

  const animationUrl = rawAnimationUrl.replace(
    "http://localhost:5000",
    "https://te-bot.site"
  );

  const animationKey = String(
    payload?.animation?.key ||
      payload?.command ||
      ""
  ).trim();

  const phase = String(payload?.phase || state || "").trim();



  return (
    <View style={bubble.sysWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
        style={[
          bubble.sysBubble,
          {
            width: Math.min(width - 36, 360),
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.35)",
            backgroundColor:
              theme.background === "#000" ||
              String(theme.background).toLowerCase().includes("000")
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
          },
        ]}
      >
        <View
          style={{
            alignSelf: "stretch",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="game-controller-outline"
            size={17}
            color="#F59E0B"
          />

          <Text
            style={{
              marginLeft: 6,
              color: "#F59E0B",
              fontSize: 14,
              fontWeight: "900",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {!!animationUrl ? (
          <View
            style={{
              width: 180,
              height: 180,
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <LottieView
              source={{ uri: animationUrl }}
              autoPlay
              loop
              resizeMode="contain"
              style={{
                width: 180,
                height: 180,
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: 96,
              height: 96,
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              borderRadius: 24,
              backgroundColor: theme.surface2,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ fontSize: 44 }}>
              {animationKey === "slap"
                ? "✋"
                : animationKey === "box"
                  ? "🥊"
                  : "💥"}
            </Text>
          </View>
        )}

        <Text
          style={[
            {
              color: theme.text,
              fontSize: 13,
              lineHeight: 22,
              fontWeight: "800",
              textAlign: "center",
            },
            getTextDirectionStyle(item.text || ""),
          ]}
        >
          {item.text}
        </Text>

        {!!phase && (
          <Text
            style={{
              marginTop: 8,
              color: theme.mutedText,
              fontSize: 11,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            {phase}
          </Text>
        )}

        <Text style={[bubble.sysTime, { marginTop: 8 }]}>
          {item.time}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
if (isBombColorMessage(item)) {
  const state = String(item.game?.state || "").trim();
  const payload = item.game?.payload || {};

  const challengeId = String(
    payload?.challengeId ||
    item.game?.gameId ||
    ""
  ).trim();

  const targetId = String(payload?.targetId || "").trim();
  const targetName = String(payload?.targetName || "المستخدم").trim();
  const attackerName = String(payload?.attackerName || "مستخدم").trim();
  const stake = Number(payload?.stake || 0);

  const isStarted = state === "started";
  const isMyTurn =
    isStarted &&
    !!currentUserId &&
    !!targetId &&
    String(currentUserId) === String(targetId);

  const accent =
    state === "success"
      ? "#22C55E"
      : state === "failed"
        ? "#EF4444"
        : "#F59E0B";

  const ColorButton = ({
    label,
    color,
    bg,
    onPress,
  }: {
    label: string;
    color: string;
    bg: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={!isMyTurn}
      style={{
        flex: 1,
        minHeight: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isMyTurn ? bg : theme.surface2,
        borderWidth: 1,
        borderColor: isMyTurn ? color : theme.border,
        opacity: isMyTurn ? 1 : 0.45,
      }}
    >
      <Text
        style={{
          color: isMyTurn ? color : theme.mutedText,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={bubble.sysWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
        style={[
          bubble.sysBubble,
          {
            width: Math.min(width - 36, 370),
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: `${accent}55`,
            backgroundColor:
              theme.background === "#000" ||
              String(theme.background).toLowerCase().includes("000")
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
          },
        ]}
      >
        <View
          style={{
            alignSelf: "stretch",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 22 }}>💣</Text>

          <Text
            style={{
              marginLeft: 6,
              color: accent,
              fontSize: 14,
              fontWeight: "900",
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            Bomb Color
          </Text>
        </View>

        <Text
          style={{
            color: theme.text,
            fontSize: 13,
            lineHeight: 22,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          {item.text}
        </Text>

        {!!stake && (
          <View
            style={{
              marginTop: 10,
              alignSelf: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${accent}18`,
              borderWidth: 1,
              borderColor: `${accent}45`,
            }}
          >
            <Text
              style={{
                color: accent,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              الرهان: {stake.toLocaleString()} نقطة
            </Text>
          </View>
        )}

        {isStarted && (
          <Text
            style={{
              marginTop: 10,
              color: isMyTurn ? theme.text : theme.mutedText,
              fontSize: 12,
              lineHeight: 18,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            {isMyTurn
              ? "اختر لونًا قبل انتهاء الوقت"
              : `بانتظار اختيار ${targetName}`}
          </Text>
        )}

        {isStarted && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 12,
              alignSelf: "stretch",
            }}
          >
            <ColorButton
              label="أحمر"
              color="#EF4444"
              bg="rgba(239,68,68,0.12)"
              onPress={() => onSendBombColorAnswer?.("red", challengeId)}
            />

            <ColorButton
              label="أخضر"
              color="#22C55E"
              bg="rgba(34,197,94,0.12)"
              onPress={() => onSendBombColorAnswer?.("green", challengeId)}
            />

            <ColorButton
              label="أزرق"
              color="#2563EB"
              bg="rgba(37,99,235,0.12)"
              onPress={() => onSendBombColorAnswer?.("blue", challengeId)}
            />
          </View>
        )}

        <Text style={[bubble.sysTime, { marginTop: 8 }]}>
          {item.time}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
  if (isCricketMessage(item)) {
    const gameId = String(item.game?.gameId || item.game?.payload?.gameId || "").trim();
    return (
      <CricketGameMessage
        item={item}
        currentUserId={currentUserId}
        theme={theme}
        onJoin={() => {
          if (!gameId) {
            Alert.alert("Notice", "Game id not found");
            return;
          }

          onSendCricketJoin?.(gameId);
        }}
        onChooseNumber={(n) => {
          if (!gameId) {
            Alert.alert("Notice", "Game id not found");
            return;
          }

          onSendCricketPlay?.(gameId, n);
        }}
      />
    );
  }
  const senderRole = item.sender?.role;
  const starColor = getStarColor(senderRole);

  const shouldShowAvatarAndName = showName && !!item.sender?.name;

  const avatarBorderColor = resolveUsernameColor(item.sender) || theme.border;

  const avatarStyle = [
    bubble.avatar,
    {
      borderColor: avatarBorderColor,
      borderWidth: resolveUsernameColor(item.sender) ? 2 : 2,
    },
  ];
  return (
    <View style={[bubble.row, isMe ? bubble.rowMe : bubble.rowOther]}>
      {!isMe && (
        shouldShowAvatarAndName ? (
          <Pressable
            style={bubble.avatarWrapLeft}
            onPress={() => onAvatarPress(item.sender)}
            onLongPress={() => onAvatarLongPress(item.sender)}
            delayLongPress={350}
          >
            <Image
              source={{ uri: resolveAvatarSource(item.sender) }}
              style={avatarStyle}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
            />

            {shouldShowStar(senderRole) && (
              <Text style={[bubble.avatarStarLeft, { color: starColor }]}>★</Text>
            )}
          </Pressable>
        ) : (
          <View style={bubble.avatarSpacerLeft} />
        )
      )}

<TouchableOpacity
  activeOpacity={0.88}
  onLongPress={onLongPress}
  delayLongPress={350}
  onPress={() => {
    if (item.type === "text") {
      copyMessageContent();
    }
  }}
  style={[bubble.bubble, isMe ? bubble.bubbleMe : bubble.bubbleOther]}
>
        {shouldShowAvatarAndName && (
          <View style={bubble.nameWrap}>
            {/* <View style={bubble.nameRow}>
              <Text style={bubble.senderName} numberOfLines={1}>
                {item.sender.name}
              </Text>

              <CustomEmojiBadgeView badge={item.sender?.customEmojiBadge} />

              <DynamicUserBadge badge={pickPrimaryBadge(item.sender?.activeBadges)} />
            </View> */}
            <View
              style={[
                bubble.nameRow,
                { alignSelf: isMe ? "flex-end" : "flex-start" }
              ]}
            >
              <DynamicUserBadge badge={pickPrimaryBadge(item.sender?.activeBadges)} />
              <CustomEmojiBadgeView badge={item.sender?.customEmojiBadge} />

              <Text
                style={[
                  bubble.senderName,
                  resolveUsernameColor(item.sender)
                    ? { color: resolveUsernameColor(item.sender) }
                    : null,
                  { flexShrink: 1, flexWrap: "wrap" }
                ]}
                onLongPress={() => copyUserNameOnly(item.sender)}

              >
                {item?.sender?.name}
              </Text>
            </View>
            <View style={bubble.nameUnderline} />
          </View>
        )}

        {!!item.deletedForEveryone ? (
          <Text style={bubble.msgTextMuted}>🚫 تم حذف الرسالة</Text>
        ) : (
          <>
            {!item.deletedForEveryone && item.replyTo && (
              <View style={bubble.replyBox}>
                <View style={bubble.replyTop}>
                  <Text style={bubble.replyName} numberOfLines={1}>
                    {item.replyTo.sender?.name || "User"}
                  </Text>
                  <Text style={bubble.replyTag}>Reply</Text>
                </View>

                {item.replyTo.type !== "text" ? (
                  <Text style={bubble.replyText} numberOfLines={2}>
                    {item.replyTo.type === "image"
                      ? `📷 ${stripHtmlToText(String(item.replyTo.text || "")) || "Image"}`
                      : item.replyTo.type === "video"
                        ? `🎬 ${stripHtmlToText(String(item.replyTo.text || "")) || "Video"}`
                        : item.replyTo.type === "audio"
                          ? `🎤 ${stripHtmlToText(String(item.replyTo.text || "")) || "Voice"}`
                          : item.replyTo.type === "file"
                            ? `📄 ${stripHtmlToText(String(item.replyTo.text || "")) || "File"}`
                            : stripHtmlToText(String(item.replyTo.text || "")) || "—"}
                  </Text>
                ) : (
                  <Text style={bubble.replyText} numberOfLines={2}>
                    {stripHtmlToText(String(item.replyTo.text || "")) || "—"}
                  </Text>
                )}
              </View>
            )}

   {item.type === "text" && (
  <Text
    style={[
      bubble.msgText,
      getTextDirectionStyle(item.text),
      resolveMessageTextColor(item.sender)
        ? { color: resolveMessageTextColor(item.sender) }
        : null,
    ]}
  >
    {renderMessageTextWithLinks(item.text)}
  </Text>
)}

            {item.type === "gift" ? (
              (() => {
                const key = item.gift?.key || "";
                const senderName = item.sender?.name || "Someone";
                if (key.startsWith("boost")) {
                  return (
                    <Text style={[bubble.msgTextMuted, { fontWeight: "900", color: theme.warning }]}>
                      🚀 {senderName} Boosted the Room
                    </Text>
                  );
                }
                return (
                  <Text style={bubble.msgTextMuted}>
                    🎁 {senderName} → {item.gift?.targetName || "Someone"} {item.gift?.icon || "🎁"}
                  </Text>
                );
              })()
            ) : null}
            {/* 
            {item.type === "image" && item.uri ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(item.uri!)}>
                <Image source={{ uri: item.uri }} style={bubble.media} />
              </TouchableOpacity>
            ) : null} */}
            {item.type === "image" && item.uri ? (
              (() => {
                const mime = String(item.mediaMimeType || "").toLowerCase();
                const uri = String(item.uri || "").toLowerCase();

                const isStickerOrGif =
                  mime === "image/gif" ||
                  mime === "image/webp" ||
                  uri.endsWith(".gif") ||
                  uri.endsWith(".webp");

                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onPressImage(item.uri!)}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={isStickerOrGif ? bubble.stickerMedia : bubble.media}
                      contentFit={isStickerOrGif ? "contain" : "cover"}
                      cachePolicy="memory-disk"
                    />
                  </TouchableOpacity>
                );
              })()
            ) : null}
            {item.type === "video" && item.uri ? (
              <View style={bubble.videoWrapper}>
                <Video source={{ uri: item.uri }} style={bubble.video} useNativeControls resizeMode={ResizeMode.CONTAIN} isLooping={false} />
              </View>
            ) : null}

            {item.type === "file" ? (
              <View style={bubble.fileRow}>
                <Text style={bubble.fileIcon}>📄</Text>
                <Text style={bubble.fileName} numberOfLines={1}>
                  {item.text || "File"}
                </Text>
              </View>
            ) : null}

            {item.type === "audio" && item.uri ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onOpenAudioModal(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.text,
                    fontWeight: "500",
                  }}
                >
                  Voice message{" "}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#2563EB",
                    fontWeight: "800",
                  }}
                >
                  Play
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}

      </TouchableOpacity>
      {item.reaction && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onOpenReactionDetails?.(item)}
          style={[
            bubble.reactionOutside,
            isMe ? bubble.reactionOutsideMe : bubble.reactionOutsideOther,
          ]}
        >
          <Text style={bubble.reactionEmoji}>{item.reaction}</Text>

          {Number(item.reactionCount || 0) > 1 && (
            <Text style={bubble.reactionCount}>
              {item.reactionCount}
            </Text>
          )}
        </TouchableOpacity>
      )}
      {isMe && (
        shouldShowAvatarAndName ? (
          <Pressable
            style={bubble.avatarWrapRight}
            onPress={() => onAvatarPress(item.sender)}
            onLongPress={() => onAvatarLongPress(item.sender)}
            delayLongPress={350}
          >
            <Image
              source={{ uri: resolveAvatarSource(item.sender) }}
              style={avatarStyle}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
            />

            {shouldShowStar(senderRole) && (
              <Text style={[bubble.avatarStarRight, { color: starColor }]}>★</Text>
            )}
          </Pressable>
        ) : (
          <View style={bubble.avatarSpacerRight} />
        )
      )}
    </View>
  );
}
