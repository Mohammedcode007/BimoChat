import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
    Gesture,
    GestureDetector
} from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  children
}: Props) {

  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 150
      });
    } else {
      translateY.value = withTiming(height, { duration: 250 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > 150) {
        translateY.value = withTiming(height);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  if (!visible) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sheet, animatedStyle]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 12
  }
});
