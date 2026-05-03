import { ResizeMode, Video } from "expo-av";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { isValidUrl } from "./helpers";
import { TweetMediaItem } from "./types";

export function TweetMediaGrid({
  media,
  s,
  onPressImage,
}: {
  media: TweetMediaItem[];
  s: any;
  onPressImage?: (url: string) => void;
}) {
  const validMedia = (media || []).filter((m) => isValidUrl(m?.url));

  if (!validMedia.length) return null;

  const videos = validMedia.filter((m) => m.type === "video");
  const images = validMedia.filter((m) => m.type !== "video");

  if (videos.length > 0) {
    return (
      <View style={s.mediaSection}>
        {videos.map((mediaItem, index) => (
          <Video
            key={`${mediaItem.url}-${index}`}
            source={{ uri: mediaItem.url }}
            style={s.singleMedia}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        ))}
      </View>
    );
  }

  if (images.length === 1) {
    return (
      <View style={s.mediaSection}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onPressImage?.(images[0].url)}
        >
          <Image source={{ uri: images[0].url }} style={s.singleMedia} />
        </TouchableOpacity>
      </View>
    );
  }

  if (images.length === 2) {
    return (
      <View style={s.grid2}>
        {images.slice(0, 2).map((mediaItem, index) => (
          <TouchableOpacity
            key={`${mediaItem.url}-${index}`}
            style={{ flex: 1 }}
            activeOpacity={0.92}
            onPress={() => onPressImage?.(mediaItem.url)}
          >
            <Image source={{ uri: mediaItem.url }} style={s.grid2Item} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (images.length === 3) {
    return (
      <View style={s.grid3}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={{ flex: 1.2 }}
          onPress={() => onPressImage?.(images[0].url)}
        >
          <Image source={{ uri: images[0].url }} style={s.grid3Left} />
        </TouchableOpacity>

        <View style={s.grid3Right}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={{ flex: 1 }}
            onPress={() => onPressImage?.(images[1].url)}
          >
            <Image source={{ uri: images[1].url }} style={s.grid3Small} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            style={{ flex: 1 }}
            onPress={() => onPressImage?.(images[2].url)}
          >
            <Image source={{ uri: images[2].url }} style={s.grid3Small} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.grid4}>
      {images.slice(0, 4).map((mediaItem, index) => (
        <TouchableOpacity
          key={`${mediaItem.url}-${index}`}
          style={s.grid4ItemWrap}
          activeOpacity={0.92}
          onPress={() => onPressImage?.(mediaItem.url)}
        >
          <Image source={{ uri: mediaItem.url }} style={s.grid4Item} />

          {index === 3 && images.length > 4 && (
            <View style={s.moreOverlay}>
              <Text style={s.moreOverlayText}>+{images.length - 4}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}