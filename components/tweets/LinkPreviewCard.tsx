import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getHostName, isValidUrl, openExternalLink } from "./helpers";
import { LinkPreview } from "./types";

export function LinkPreviewCard({
  url,
  preview,
  s,
}: {
  url: string;
  preview?: LinkPreview;
  s: any;
}) {
  const siteName = preview?.siteName || getHostName(url) || "Link";
  const title = preview?.title || url;
  const description = preview?.description || "";
  const image =
    preview?.image && isValidUrl(preview.image)
      ? preview.image
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => openExternalLink(url)}
      style={s.linkCard}
    >
      {image ? (
        <Image source={{ uri: image }} style={s.linkCardImage} />
      ) : (
        <View style={s.linkCardImagePlaceholder}>
          <Ionicons name="link-outline" size={28} color={s._iconColor} />
        </View>
      )}

      <View style={s.linkCardBody}>
        <Text style={s.linkCardSite} numberOfLines={1}>
          {siteName}
        </Text>

        <Text style={s.linkCardTitle} numberOfLines={2}>
          {title}
        </Text>

        {!!description && (
          <Text style={s.linkCardDesc} numberOfLines={2}>
            {description}
          </Text>
        )}

        <Text style={s.linkCardUrl} numberOfLines={1}>
          {url}
        </Text>
      </View>
    </TouchableOpacity>
  );
}