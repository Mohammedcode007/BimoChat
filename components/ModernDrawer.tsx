import { Colors } from "@/constants/theme";
import { DrawerContext } from "@/context/DrawerContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerContent from "./DrawerContent";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.70, 300);

type ModernDrawerProps = {
  children: React.ReactNode;
};

export default function ModernDrawer({ children }: ModernDrawerProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(false);

  const openDrawer = () => {
    setMounted(true);
    progress.value = withTiming(1, { duration: 320 });
  };

  const closeDrawer = () => {
    progress.value = withTiming(0, { duration: 260 }, (finished) => {
      if (finished) {
        runOnJS(setMounted)(false);
      }
    });
  };

  const drawerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-DRAWER_WIDTH, 0]);

    return {
      transform: [{ translateX }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 0.985]),
        },
        {
          translateX: interpolate(progress.value, [0, 1], [0, DRAWER_WIDTH * 0.08]),
        },
      ],
      borderRadius: interpolate(progress.value, [0, 1], [0, 22]),
      overflow: "hidden",
    };
  });

  const contextValue = useMemo(
    () => ({
      open: openDrawer,
      close: closeDrawer,
    }),
    []
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <Animated.View style={[styles.contentLayer, contentAnimatedStyle]}>
          {children}
        </Animated.View>

        {mounted && (
          <>
            <Animated.View
              style={[
                styles.overlay,
                overlayAnimatedStyle,
                {
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.42)"
                    : "rgba(0,0,0,0.24)",
                },
              ]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
            </Animated.View>

            <Animated.View
              style={[
                styles.drawer,
                drawerAnimatedStyle,
                {
                  width: DRAWER_WIDTH,
                  paddingTop: insets.top,
                  backgroundColor: theme.card,
                  borderRightWidth: 1,
                  borderRightColor: theme.border,
                  shadowColor: "#000",
                },
              ]}
            >
              <View
                style={[
                  styles.drawerInner,
                  {
                    backgroundColor: theme.card,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dragIndicator,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(0,0,0,0.10)",
                    },
                  ]}
                />

                <DrawerContent onClose={closeDrawer} />
              </View>
            </Animated.View>
          </>
        )}
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  contentLayer: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 8, height: 0 },
      },
      android: {
        elevation: 18,
      },
    }),
  },

  drawerInner: {
    flex: 1,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  dragIndicator: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    marginTop: 10,
    marginBottom: 6,
  },
});