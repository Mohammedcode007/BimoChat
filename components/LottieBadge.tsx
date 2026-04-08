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

  }, [url, fallbackImage]);

  if (!url && !fallbackImage) {
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
          }}
          onAnimationFailure={(err) => {
           
            setFailed(true);
          }}
        />
      ) : fallbackImage ? (
        (() => {
          return (
            <Image
              source={{ uri: fallbackImage }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: size / 2,
              }}
              onError={(e) => {
              }}
              onLoad={() => {
              }}
            />
          );
        })()
      ) : (
        (() => {
          return null;
        })()
      )}
    </View>
  );
}