// components/roomScreen/PinnedHtmlWebView.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    View,
} from "react-native";
import WebView from "react-native-webview";

type PinnedHtmlWebViewProps = {
  html?: string;
  width: number;
  minHeight?: number;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
  lineHeight?: number;
};

const escapeHtml = (value: string) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const normalizeHtml = (value?: string) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "<div></div>";
  }

  const hasHtmlTag = /<[a-z][\s\S]*>/i.test(raw);

  if (hasHtmlTag) {
    return raw;
  }

  return `<div>${escapeHtml(raw).replace(/\n/g, "<br/>")}</div>`;
};

export default function PinnedHtmlWebView({
  html,
  width,
  minHeight = 42,
  textColor = "#333333",
  textAlign = "center",
  fontSize = 15,
  lineHeight = 26,
}: PinnedHtmlWebViewProps) {
  const raw = String(html || "").trim();

  const plainText = useMemo(() => {
    return raw
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [raw]);

  const estimateHeight = useMemo(() => {
    const safeWidth = Math.max(1, Number(width || 1));
    const safeFontSize = Math.max(10, Number(fontSize || 15));
    const safeLineHeight = Math.max(16, Number(lineHeight || 26));

    const charsPerLine = Math.max(
      18,
      Math.floor(safeWidth / (safeFontSize * 0.65))
    );

    const lines = Math.max(
      1,
      Math.ceil((plainText.length || 1) / charsPerLine)
    );

    return Math.max(
      minHeight,
      Math.min(220, lines * safeLineHeight + 10)
    );
  }, [plainText, width, fontSize, lineHeight, minHeight]);

  const [webHeight, setWebHeight] = useState(estimateHeight);
  const [measured, setMeasured] = useState(false);

  const heightAnim = useRef(new Animated.Value(estimateHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0.92)).current;
  const scaleAnim = useRef(new Animated.Value(0.985)).current;
  const translateYAnim = useRef(new Animated.Value(4)).current;

  const lastHeightRef = useRef(estimateHeight);

  const bodyHtml = useMemo(() => {
    return normalizeHtml(raw);
  }, [raw]);

  useEffect(() => {
    lastHeightRef.current = estimateHeight;
    setWebHeight(estimateHeight);
    setMeasured(false);

    heightAnim.setValue(estimateHeight);
    opacityAnim.setValue(0.92);
    scaleAnim.setValue(0.985);
    translateYAnim.setValue(4);
  }, [
    raw,
    width,
    estimateHeight,
    heightAnim,
    opacityAnim,
    scaleAnim,
    translateYAnim,
  ]);

  const animateToHeight = (nextHeight: number) => {
    const finalHeight = Math.max(
      Math.ceil(Number(nextHeight || minHeight)),
      minHeight
    );

    if (Math.abs(lastHeightRef.current - finalHeight) < 2) {
      setMeasured(true);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();

      return;
    }

    lastHeightRef.current = finalHeight;
    setWebHeight(finalHeight);
    setMeasured(true);

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: finalHeight,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const fullHtml = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />

    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow: hidden;
        background: transparent;
      }

      body {
        color: ${textColor};
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        text-align: ${textAlign};
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      * {
        box-sizing: border-box;
        max-width: 100%;
      }

      p {
        margin: 0 0 6px 0;
      }

      b,
      strong {
        font-weight: 800;
      }

      a {
        color: inherit;
        text-decoration: underline;
      }

      img,
      video {
        max-width: 100%;
        height: auto;
      }

      .root {
        width: 100%;
        min-height: ${minHeight}px;
        padding: 0;
      }
    </style>
  </head>

  <body>
    <div id="root" class="root">
      ${bodyHtml}
    </div>

    <script>
      (function () {
        function getHeight() {
          var body = document.body;
          var html = document.documentElement;
          var root = document.getElementById("root");

          var height = Math.max(
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0,
            html ? html.clientHeight : 0,
            html ? html.scrollHeight : 0,
            html ? html.offsetHeight : 0,
            root ? root.scrollHeight : 0,
            ${minHeight}
          );

          return Math.ceil(height);
        }

        function sendHeight() {
          var height = getHeight();

          if (
            window.ReactNativeWebView &&
            window.ReactNativeWebView.postMessage
          ) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "height",
                height: height
              })
            );
          }
        }

        window.addEventListener("load", function () {
          setTimeout(sendHeight, 20);
          setTimeout(sendHeight, 120);
          setTimeout(sendHeight, 350);
        });

        setTimeout(sendHeight, 20);
        setTimeout(sendHeight, 120);
        setTimeout(sendHeight, 350);
      })();
    </script>
  </body>
</html>
`;
  }, [
    bodyHtml,
    textColor,
    fontSize,
    lineHeight,
    textAlign,
    minHeight,
  ]);

  return (
    <Animated.View
      style={{
        width,
        minHeight,
        height: heightAnim,
        opacity: opacityAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: translateYAnim },
        ],
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width,
          height: Math.max(webHeight, minHeight),
          minHeight,
          overflow: "hidden",
        }}
      >
        <WebView
          originWhitelist={["*"]}
          source={{ html: fullHtml }}
          style={{
            width,
            height: Math.max(webHeight, minHeight),
            minHeight,
            backgroundColor: "transparent",
            opacity: measured ? 1 : 0.98,
          }}
          containerStyle={{
            width,
            height: Math.max(webHeight, minHeight),
            backgroundColor: "transparent",
          }}
          javaScriptEnabled
          domStorageEnabled={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          setSupportMultipleWindows={false}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);

              if (data?.type !== "height") return;

              const nextHeight = Number(data.height || minHeight);

              if (!Number.isFinite(nextHeight)) return;

              animateToHeight(Math.min(260, Math.max(minHeight, nextHeight)));
            } catch {
              animateToHeight(estimateHeight);
            }
          }}
        />
      </View>
    </Animated.View>
  );
}