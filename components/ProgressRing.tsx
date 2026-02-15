import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  progress,
  size = 70,
  strokeWidth = 8
}: Props) {

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useSharedValue(progress);

  animatedValue.value = withTiming(progress, { duration: 300 });

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference -
      (circumference * animatedValue.value) / 100
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* الخلفية */}
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* الدائرة المتحركة */}
        <AnimatedCircle
          stroke="#1D9BF0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.text}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },
  text: {
    fontWeight: "700",
    fontSize: 16
  }
});
