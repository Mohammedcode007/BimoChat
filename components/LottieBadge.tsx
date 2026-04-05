// // components/LottieBadge.tsx

// import LottieView from "lottie-react-native";
// import React from "react";
// import { View } from "react-native";

// export default function LottieBadge({ url, size = 60 }: { url: string; size?: number }) {
//   if (!url) return null;

//   return (
//     <View style={{ width: size, height: size }}>
//       <LottieView
//         source={{ uri: url }}
//         autoPlay
//         loop
//         style={{ width: "100%", height: "100%" }}
//       />
//     </View>
//   );
// }

import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";

export default function LottieBadge({
  url,
  size = 60,
  fallbackImage,
}: {
  url: string;
  size?: number;
  fallbackImage?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    console.log("🎬 [LottieBadge] INIT");
    console.log("➡️ url:", url);
    console.log("➡️ fallbackImage:", fallbackImage);
  }, [url, fallbackImage]);

  if (!url && !fallbackImage) {
    console.log("⚠️ [LottieBadge] لا يوجد url ولا fallback");
    return null;
  }

  return (
    <View style={{ width: size, height: size }}>
      {!failed && url ? (
        <LottieView
          source={{ uri: url }}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
          onAnimationFinish={() => {
            console.log("✅ [LottieBadge] animation finished:", url);
          }}
          onAnimationFailure={(err) => {
            console.log("❌ [LottieBadge] animation FAILED");
            console.log("➡️ url:", url);
            console.log("➡️ error:", err);
            setFailed(true);
          }}
        />
      ) : fallbackImage ? (
        (() => {
          console.log("🖼️ [LottieBadge] استخدام fallback image:", fallbackImage);
          return (
            <Image
              source={{ uri: fallbackImage }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: size / 2,
              }}
              onError={(e) => {
                console.log("❌ [LottieBadge] fallback image failed:", e.nativeEvent);
              }}
              onLoad={() => {
                console.log("✅ [LottieBadge] fallback image loaded");
              }}
            />
          );
        })()
      ) : (
        (() => {
          console.log("🚫 [LottieBadge] لا يوجد شيء للعرض");
          return null;
        })()
      )}
    </View>
  );
}