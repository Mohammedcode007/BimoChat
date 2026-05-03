import { getTextDirectionStyle } from "@/utils/textDirection";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TWEET_PREVIEW_LENGTH } from "./constants";
import { openExternalLink, parseRichText } from "./helpers";

function renderTweetRichText(
  text: string,
  s: any,
  onPressMention?: (mention: string) => void,
  onPressHashtag?: (hashtag: string) => void
) {
  if (!text) return null;

  const parts = parseRichText(text);
  const directionStyle = getTextDirectionStyle(text);

  return (
    <Text style={[s.text, directionStyle]}>
      {parts.map((part, index) => {
        if (!part.value) return null;

        if (part.type === "link") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.link}
              onPress={() => openExternalLink(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "mention") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.mention}
              onPress={() => onPressMention?.(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "hashtag") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.hashtag}
              onPress={() => onPressHashtag?.(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        return (
          <Text key={`${part.type}-${index}`} style={s.normalText}>
            {part.value}
          </Text>
        );
      })}
    </Text>
  );
}

export function ExpandableTweetText({
  text,
  s,
  previewLength = TWEET_PREVIEW_LENGTH,
  onPressMention,
  onPressHashtag,
}: {
  text: string;
  s: any;
  previewLength?: number;
  onPressMention?: (mention: string) => void;
  onPressHashtag?: (hashtag: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > previewLength;

  const displayedText =
    shouldTruncate && !expanded
      ? `${text.slice(0, previewLength).trim()}...`
      : text;

  const directionStyle = getTextDirectionStyle(displayedText);
  const isRtl = directionStyle.writingDirection === "rtl";

  return (
    <View
      style={{
        marginTop: 8,
        alignSelf: "stretch",
        alignItems: isRtl ? "flex-end" : "flex-start",
      }}
    >
      {renderTweetRichText(
        displayedText,
        s,
        onPressMention,
        onPressHashtag
      )}

      {shouldTruncate && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setExpanded((prev) => !prev)}
          style={[
            s.readMoreBtn,
            {
              alignSelf: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text style={s.readMoreText}>
            {expanded ? "عرض أقل" : "عرض المزيد"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}