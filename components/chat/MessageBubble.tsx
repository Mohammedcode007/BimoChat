// import { formatTime } from "@/utils/helpFunctions";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { ResizeMode, Video } from "expo-av";
// import { Image } from "expo-image";
// import React from "react";
// import {
//   ActivityIndicator,
//   Pressable,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import RoomInviteCard from "./RoomInviteCard";
// import { styles } from "./styles";
// import { MessageBubbleProps } from "./types";

// function getMessageMediaUri(item: any) {
//   return item?.content || item?.media?.url || "";
// }

// function MessageBubble({
//   item,
//   currentUserId,
//   isDark,
//   inputSearchValue,
//   highlightedMessageIds,
//   selectedSearchMessageId,
//   mediaSendingState,
//   onLongPress,
//   onCopy,
//   onImagePreview,
//   onJoinRoom,
//   onPlayAudio,
//   activeAudioUri,
//   activeAudioPlaying,
//   renderReplyBlock,
//   renderHighlightedText,
// }: MessageBubbleProps) {
//   const isMe = String(item.sender) === String(currentUserId);

//   const isMedia = item.type === "image" || item.type === "video";
//   const isMatched = highlightedMessageIds.has(item._id);
//   const isActiveResult = selectedSearchMessageId === item._id;

//   const mediaUri = getMessageMediaUri(item);
//   const mediaStatus = mediaSendingState[item._id];

//   const showMediaLoading =
//     !!mediaStatus &&
//     (item as any).optimistic &&
//     (item.type === "image" ||
//       item.type === "video" ||
//       item.type === "audio");

//   if ((item as any).deletedForEveryone) {
//     return (
//       <View style={styles.deletedBubble}>
//         <Text
//           allowFontScaling={false}
//           maxFontSizeMultiplier={1}
//           style={[
//             styles.deletedText,
//             { color: isDark ? "#9CA3AF" : "#6B7280" },
//           ]}
//         >
//           This message was deleted
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <Pressable
//       onLongPress={() => onLongPress(item)}
//       onPress={() => onCopy(item)}
//       delayLongPress={250}
//       style={[
//         styles.messageContainer,
//         isMe ? styles.rowMe : styles.rowOther,
//       ]}
//     >
//       <View
//         style={[
//           styles.bubble,
//           !isMedia && (isMe ? styles.me : styles.other),
//           isDark && !isMedia && !isMe ? styles.otherDark : null,
//           isMatched && styles.searchMatchedBubble,
//           isActiveResult && styles.searchActiveBubble,
//         ]}
//       >
//         {renderReplyBlock(item, isMe)}

//         {item.type === "room_invite" && (item as any).roomInvite ? (
//           <RoomInviteCard
//             item={item}
//             isMe={isMe}
//             isDark={isDark}
//             onJoin={onJoinRoom}
//           />
//         ) : item.type === "image" && mediaUri ? (
//           <View style={{ position: "relative" }}>
//             <TouchableOpacity
//               activeOpacity={0.9}
//               onPress={() => onImagePreview(mediaUri)}
//               disabled={showMediaLoading}
//             >
//               <Image
//                 source={{ uri: mediaUri }}
//                 style={{
//                   width: 220,
//                   height: 220,
//                   borderRadius: 14,
//                 }}
//                 contentFit="cover"
//                 transition={120}
//                 cachePolicy="memory-disk"
//               />
//             </TouchableOpacity>

//             {showMediaLoading && (
//               <View style={styles.mediaLoadingOverlay}>
//                 <ActivityIndicator size="small" color="#FFF" />
//                 <Text style={styles.mediaLoadingText}>
//                   {mediaStatus === "uploading"
//                     ? "جاري رفع الصورة..."
//                     : "جاري الإرسال..."}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : item.type === "video" && mediaUri ? (
//           <View style={{ position: "relative" }}>
//             <Video
//               source={{ uri: mediaUri }}
//               style={{
//                 width: 240,
//                 height: 240,
//                 borderRadius: 14,
//               }}
//               useNativeControls={!showMediaLoading}
//               resizeMode={ResizeMode.CONTAIN}
//               isLooping={false}
//               shouldPlay={false}
//             />

//             {showMediaLoading && (
//               <View style={styles.mediaLoadingOverlay}>
//                 <ActivityIndicator size="small" color="#FFF" />
//                 <Text style={styles.mediaLoadingText}>
//                   {mediaStatus === "uploading"
//                     ? "جاري رفع الفيديو..."
//                     : "جاري الإرسال..."}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : item.type === "audio" && mediaUri ? (
//           <View style={{ minWidth: 160 }}>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 gap: 6,
//                 paddingVertical: 2,
//               }}
//             >
//               <Text
//                 allowFontScaling={false}
//                 maxFontSizeMultiplier={1}
//                 numberOfLines={1}
//                 style={{
//                   fontSize: 13,
//                   fontWeight: "700",
//                   color: isMe ? "#FFFFFF" : isDark ? "#E5E7EB" : "#111827",
//                 }}
//               >
//                 Voice message
//               </Text>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 disabled={showMediaLoading}
//                 onPress={() => onPlayAudio(mediaUri)}
//                 style={{
//                   paddingHorizontal: 6,
//                   paddingVertical: 2,
//                   borderRadius: 8,
//                   backgroundColor: isMe
//                     ? "rgba(255,255,255,0.18)"
//                     : isDark
//                       ? "rgba(255,255,255,0.08)"
//                       : "#EEF2FF",
//                 }}
//               >
//                 <Text
//                   allowFontScaling={false}
//                   maxFontSizeMultiplier={1}
//                   style={{
//                     fontSize: 13,
//                     fontWeight: "900",
//                     color:
//                       activeAudioUri === mediaUri && activeAudioPlaying
//                         ? "#22C55E"
//                         : isMe
//                           ? "#FFFFFF"
//                           : "#6D5DF6",
//                   }}
//                 >
//                   {activeAudioUri === mediaUri && activeAudioPlaying ? "Playing" : "Play"}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {showMediaLoading && (
//               <View
//                 style={[
//                   styles.audioLoadingBox,
//                   {
//                     marginTop: 8,
//                     backgroundColor: isMe
//                       ? "rgba(255,255,255,0.12)"
//                       : isDark
//                         ? "rgba(255,255,255,0.06)"
//                         : "#E5E7EB",
//                   },
//                 ]}
//               >
//                 <ActivityIndicator
//                   size="small"
//                   color={isMe ? "#FFF" : "#6D5DF6"}
//                 />

//                 <Text
//                   style={{
//                     marginTop: 6,
//                     fontSize: 12,
//                     fontWeight: "700",
//                     color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827",
//                   }}
//                 >
//                   {mediaStatus === "uploading"
//                     ? "جاري رفع الصوت..."
//                     : "جاري الإرسال..."}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           renderHighlightedText(
//             item.content,
//             inputSearchValue,
//             isMe,
//             isActiveResult
//           )
//         )}
//       </View>

//       <View
//         style={[
//           styles.timeWrapper,
//           isMe ? styles.timeRight : styles.timeLeft,
//         ]}
//       >
//         <Text
//           style={[
//             styles.timeText,
//             isMe ? styles.timeMe : styles.timeOther,
//             { color: isDark ? "#9CA3AF" : undefined },
//           ]}
//         >
//           {formatTime(item.createdAt)}
//         </Text>

//         {isMe && (
//           <View style={styles.statusIcon}>
//             {item.deliveryStatus?.seenBy?.length ? (
//               <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
//             ) : item.deliveryStatus?.deliveredTo?.length ? (
//               <Ionicons
//                 name="checkmark-done"
//                 size={14}
//                 color={isDark ? "#9CA3AF" : "#E5E7EB"}
//               />
//             ) : (
//               <Ionicons
//                 name="checkmark"
//                 size={14}
//                 color={isDark ? "#9CA3AF" : "#E5E7EB"}
//               />
//             )}
//           </View>
//         )}
//       </View>
//     </Pressable>
//   );
// }
import { formatTime } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import RoomInviteCard from "./RoomInviteCard";
import { styles } from "./styles";
import { MessageBubbleProps } from "./types";

function getMessageMediaUri(item: any) {
  return item?.content || item?.media?.url || "";
}

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function normalizeUrl(url: string) {
  const clean = String(url || "").trim();

  if (!clean) return "";

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  if (/^www\./i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
}

function isUrlText(value: string) {
  return /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i.test(
    String(value || "").trim()
  );
}

function getFileExtensionFromUrl(url: string) {
  const cleanUrl = String(url || "")
    .split("?")[0]
    .split("#")[0]
    .toLowerCase();

  if (cleanUrl.endsWith(".png")) return "png";
  if (cleanUrl.endsWith(".webp")) return "webp";
  if (cleanUrl.endsWith(".gif")) return "gif";
  if (cleanUrl.endsWith(".jpeg")) return "jpg";
  if (cleanUrl.endsWith(".jpg")) return "jpg";

  return "jpg";
}

async function openMessageLink(url: string) {
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
}

async function saveImageToGallery(imageUri: string) {
  try {
    const uri = String(imageUri || "").trim();

    if (!uri) {
      Alert.alert("Error", "Image not found");
      return;
    }

    const permission = await MediaLibrary.requestPermissionsAsync(false, [
      "photo",
    ]);

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo access to save images."
      );
      return;
    }

    let finalUri = uri;

    if (!uri.startsWith("file://")) {
      const ext = getFileExtensionFromUrl(uri);

      const cacheDir = FileSystem.cacheDirectory;

      if (!cacheDir) {
        Alert.alert("Error", "Cache directory not found");
        return;
      }

      const localUri = `${cacheDir}bimo_${Date.now()}.${ext}`;

      const downloaded = await FileSystem.downloadAsync(uri, localUri);

      if (!downloaded?.uri) {
        Alert.alert("Error", "Image download failed");
        return;
      }

      finalUri = downloaded.uri;
    }

    const asset = await MediaLibrary.createAssetAsync(finalUri);

    await MediaLibrary.createAlbumAsync("Bimo", asset, false).catch(() => null);

    Alert.alert("Saved", "Image saved to gallery");
  } catch (e: any) {
    console.log("SAVE_IMAGE_ERROR:", e);
    Alert.alert("Error", e?.message || "Failed to save image");
  }
}

function renderTextWithLinks({
  text,
  isMe,
  isDark,
}: {
  text?: string;
  isMe: boolean;
  isDark: boolean;
}) {
  const value = String(text || "");

  if (!value) return null;

  const parts = value.split(URL_REGEX);
  const hasArabic = /[\u0600-\u06FF]/.test(value);

  return (
    <Text
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={{
        fontSize: 15,
        lineHeight: 21,
        fontWeight: "500",
        color: isMe ? "#FFFFFF" : isDark ? "#E5E7EB" : "#111827",
        textAlign: hasArabic ? "right" : "left",
        writingDirection: hasArabic ? "rtl" : "ltr",
      }}
    >
      {parts.map((part, index) => {
        const cleanPart = String(part || "");

        if (!isUrlText(cleanPart)) {
          return <Text key={`text-${index}`}>{cleanPart}</Text>;
        }

        return (
          <Text
            key={`link-${index}`}
            onPress={() => openMessageLink(cleanPart)}
            style={{
              color: isMe ? "#DBEAFE" : "#2563EB",
              fontWeight: "900",
              textDecorationLine: "underline",
            }}
          >
            {cleanPart}
          </Text>
        );
      })}
    </Text>
  );
}

function MessageBubble({
  item,
  currentUserId,
  isDark,
  inputSearchValue,
  highlightedMessageIds,
  selectedSearchMessageId,
  mediaSendingState,
  onLongPress,
  onCopy,
  onImagePreview,
  onJoinRoom,
  onPlayAudio,
  activeAudioUri,
  activeAudioPlaying,
  renderReplyBlock,
  renderHighlightedText,
}: MessageBubbleProps) {
  const isMe = String(item.sender) === String(currentUserId);

  const isMedia = item.type === "image" || item.type === "video";
  const isMatched = highlightedMessageIds.has(item._id);
  const isActiveResult = selectedSearchMessageId === item._id;

  const mediaUri = getMessageMediaUri(item);
  const mediaStatus = mediaSendingState[item._id];

  const showMediaLoading =
    !!mediaStatus &&
    (item as any).optimistic &&
    (item.type === "image" ||
      item.type === "video" ||
      item.type === "audio");

  const handleBubblePress = () => {
    /*
      لا ننسخ الرسالة النصية بالضغط العادي حتى لا يحدث تعارض
      بين فتح اللينك ونسخ الرسالة.
      النسخ يظل من الضغط المطول.
    */
    if (item.type === "text") return;

    onCopy(item);
  };

  if ((item as any).deletedForEveryone) {
    return (
      <View style={styles.deletedBubble}>
        <Text
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          style={[
            styles.deletedText,
            { color: isDark ? "#9CA3AF" : "#6B7280" },
          ]}
        >
          This message was deleted
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onLongPress={() => onLongPress(item)}
      onPress={handleBubblePress}
      delayLongPress={250}
      style={[
        styles.messageContainer,
        isMe ? styles.rowMe : styles.rowOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          !isMedia && (isMe ? styles.me : styles.other),
          isDark && !isMedia && !isMe ? styles.otherDark : null,
          isMatched && styles.searchMatchedBubble,
          isActiveResult && styles.searchActiveBubble,
        ]}
      >
        {renderReplyBlock(item, isMe)}

        {item.type === "room_invite" && (item as any).roomInvite ? (
          <RoomInviteCard
            item={item}
            isMe={isMe}
            isDark={isDark}
            onJoin={onJoinRoom}
          />
        ) : item.type === "image" && mediaUri ? (
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onImagePreview(mediaUri)}
              disabled={showMediaLoading}
            >
              <Image
                source={{ uri: mediaUri }}
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 14,
                }}
                contentFit="cover"
                transition={120}
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>

            {!showMediaLoading && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => saveImageToGallery(mediaUri)}
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Ionicons name="download-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {showMediaLoading && (
              <View style={styles.mediaLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.mediaLoadingText}>
                  {mediaStatus === "uploading"
                    ? "جاري رفع الصورة..."
                    : "جاري الإرسال..."}
                </Text>
              </View>
            )}
          </View>
        ) : item.type === "video" && mediaUri ? (
          <View style={{ position: "relative" }}>
            <Video
              source={{ uri: mediaUri }}
              style={{
                width: 240,
                height: 240,
                borderRadius: 14,
              }}
              useNativeControls={!showMediaLoading}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay={false}
            />

            {showMediaLoading && (
              <View style={styles.mediaLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.mediaLoadingText}>
                  {mediaStatus === "uploading"
                    ? "جاري رفع الفيديو..."
                    : "جاري الإرسال..."}
                </Text>
              </View>
            )}
          </View>
        ) : item.type === "audio" && mediaUri ? (
          <View style={{ minWidth: 160 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: isMe ? "#FFFFFF" : isDark ? "#E5E7EB" : "#111827",
                }}
              >
                Voice message
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={showMediaLoading}
                onPress={() => onPlayAudio(mediaUri)}
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  backgroundColor: isMe
                    ? "rgba(255,255,255,0.18)"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#EEF2FF",
                }}
              >
                <Text
                  allowFontScaling={false}
                  maxFontSizeMultiplier={1}
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color:
                      activeAudioUri === mediaUri && activeAudioPlaying
                        ? "#22C55E"
                        : isMe
                          ? "#FFFFFF"
                          : "#6D5DF6",
                  }}
                >
                  {activeAudioUri === mediaUri && activeAudioPlaying
                    ? "Playing"
                    : "Play"}
                </Text>
              </TouchableOpacity>
            </View>

            {showMediaLoading && (
              <View
                style={[
                  styles.audioLoadingBox,
                  {
                    marginTop: 8,
                    backgroundColor: isMe
                      ? "rgba(255,255,255,0.12)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#E5E7EB",
                  },
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={isMe ? "#FFF" : "#6D5DF6"}
                />

                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: "700",
                    color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827",
                  }}
                >
                  {mediaStatus === "uploading"
                    ? "جاري رفع الصوت..."
                    : "جاري الإرسال..."}
                </Text>
              </View>
            )}
          </View>
        ) : item.type === "text" ? (
          inputSearchValue ? (
            renderHighlightedText(
              item.content,
              inputSearchValue,
              isMe,
              isActiveResult
            )
          ) : (
            renderTextWithLinks({
              text: item.content,
              isMe,
              isDark,
            })
          )
        ) : (
          renderHighlightedText(
            item.content,
            inputSearchValue,
            isMe,
            isActiveResult
          )
        )}
      </View>

      <View
        style={[
          styles.timeWrapper,
          isMe ? styles.timeRight : styles.timeLeft,
        ]}
      >
        <Text
          style={[
            styles.timeText,
            isMe ? styles.timeMe : styles.timeOther,
            { color: isDark ? "#9CA3AF" : undefined },
          ]}
        >
          {formatTime(item.createdAt)}
        </Text>

        {isMe && (
          <View style={styles.statusIcon}>
            {item.deliveryStatus?.seenBy?.length ? (
              <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
            ) : item.deliveryStatus?.deliveredTo?.length ? (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={isDark ? "#9CA3AF" : "#E5E7EB"}
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={14}
                color={isDark ? "#9CA3AF" : "#E5E7EB"}
              />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default React.memo(MessageBubble);