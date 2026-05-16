import React, { useEffect, useMemo } from "react";
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

type Props = {
  width?: DimensionValue;
  height?: number;
  backgroundColor?: string;
  dotColor?: string;
  lineColor?: string;
  dotOpacity?: number;
  lineOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

type Dot = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  glow?: boolean;
};

const VIEWBOX_W = 320;
const VIEWBOX_H = 50;
const OUTSIDE_OFFSET = 22; // حتى تختفي النقطة خارج الإطار قبل العودة

const DOTS: Dot[] = [
  { x: 24,  y: 14, r: 2.0, speed: 0.78, drift: 7, phase: 0.05, glow: true },
  { x: 62,  y: 34, r: 1.8, speed: 0.92, drift: 8, phase: 0.18 },
  { x: 108, y: 20, r: 2.2, speed: 0.84, drift: 9, phase: 0.33, glow: true },
  { x: 152, y: 40, r: 1.7, speed: 0.98, drift: 7, phase: 0.47 },
  { x: 198, y: 18, r: 2.1, speed: 0.88, drift: 8, phase: 0.61, glow: true },
  { x: 246, y: 31, r: 1.9, speed: 0.95, drift: 10, phase: 0.79 },
  { x: 292, y: 12, r: 2.0, speed: 0.86, drift: 7, phase: 0.93, glow: true },
];

// بعض الأزواج فقط متصلة
const PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
];

type ProgressLike = { value: number };

function fract(v: number) {
  "worklet";
  return v - Math.floor(v);
}

function wrapVerticalLoop(
  progress: ProgressLike,
  startY: number,
  speed: number,
  phase: number
) {
  "worklet";

  // حركة مستمرة من أسفل لأعلى عبر مسافة أكبر من الارتفاع
  const travel = VIEWBOX_H + OUTSIDE_OFFSET * 2;
  const t = fract(progress.value * speed + phase);

  // نبدأ من أسفل خارج الإطار ونتحرك للأعلى حتى نخرج من الأعلى
  return VIEWBOX_H + OUTSIDE_OFFSET - t * travel + (startY - VIEWBOX_H / 2) * 0.18;
}

function sideDrift(
  progress: ProgressLike,
  x: number,
  amount: number,
  phase: number
) {
  "worklet";
  return x + Math.sin(progress.value * Math.PI * 2 * 0.9 + phase * Math.PI * 2) * amount;
}

function pulse(progress: ProgressLike, base: number, glow = false, phase = 0) {
  "worklet";
  const p = (Math.sin(progress.value * Math.PI * 2 * 1.5 + phase * Math.PI * 2) + 1) / 2;
  return base * (glow ? 1 + p * 0.22 : 1 + p * 0.12);
}

function opacityWave(progress: ProgressLike, base: number, phase = 0, glow = false) {
  "worklet";
  const p = (Math.sin(progress.value * Math.PI * 2 * 1.2 + phase * Math.PI * 2) + 1) / 2;
  return glow ? base * (0.78 + p * 0.22) : base * (0.68 + p * 0.18);
}

function DotNode({
  dot,
  progress,
  dotColor,
  dotOpacity,
}: {
  dot: Dot;
  progress: ProgressLike;
  dotColor: string;
  dotOpacity: number;
}) {
  const animatedGlow = useAnimatedProps(() => {
    const cx = sideDrift(progress, dot.x, dot.drift, dot.phase);
    const cy = wrapVerticalLoop(progress, dot.y, dot.speed, dot.phase);

    return {
      cx,
      cy,
      r: dot.glow ? dot.r * 3.0 : dot.r * 1.8,
      fillOpacity: dot.glow
        ? 0.06 + ((Math.sin(progress.value * Math.PI * 2 * 1.1 + dot.phase * 10) + 1) / 2) * 0.14
        : 0.02 + ((Math.sin(progress.value * Math.PI * 2 * 1.0 + dot.phase * 10) + 1) / 2) * 0.05,
    };
  });

  const animatedMain = useAnimatedProps(() => {
    const cx = sideDrift(progress, dot.x, dot.drift, dot.phase);
    const cy = wrapVerticalLoop(progress, dot.y, dot.speed, dot.phase);
    const r = pulse(progress, dot.r, !!dot.glow, dot.phase);
    const fillOpacity = opacityWave(progress, dotOpacity, dot.phase, !!dot.glow);

    return { cx, cy, r, fillOpacity };
  });

  return (
    <>
      <AnimatedCircle animatedProps={animatedGlow} fill={dotColor} />
      <AnimatedCircle animatedProps={animatedMain} fill={dotColor} />
    </>
  );
}

function PairLine({
  from,
  to,
  progress,
  lineColor,
  lineOpacity,
}: {
  from: Dot;
  to: Dot;
  progress: ProgressLike;
  lineColor: string;
  lineOpacity: number;
}) {
  const animatedProps = useAnimatedProps(() => {
    const x1 = sideDrift(progress, from.x, from.drift, from.phase);
    const y1 = wrapVerticalLoop(progress, from.y, from.speed, from.phase);

    const x2 = sideDrift(progress, to.x, to.drift, to.phase);
    const y2 = wrapVerticalLoop(progress, to.y, to.speed, to.phase);

    const fade =
      0.62 + ((Math.sin(progress.value * Math.PI * 2 * 1.05 + from.phase * 8) + 1) / 2) * 0.32;

    return {
      x1,
      y1,
      x2,
      y2,
      strokeOpacity: lineOpacity * fade,
    };
  });

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={lineColor}
      strokeWidth={0.9}
      strokeLinecap="round"
    />
  );
}

export default function FloatingPairsBackground({
  width = "100%",
  height = 50,
  backgroundColor = "transparent",
  dotColor = "#60A5FA",
  lineColor = "#60A5FA",
  dotOpacity = 0.92,
  lineOpacity = 0.17,
  style,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: 5200, // أطول لأن الحركة الآن مسار كامل وليس اهتزاز بسيط
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const lines = useMemo(
    () =>
      PAIRS.map(([a, b], index) => (
        <PairLine
          key={`pair-${index}`}
          from={DOTS[a]}
          to={DOTS[b]}
          progress={progress}
          lineColor={lineColor}
          lineOpacity={lineOpacity}
        />
      )),
    [progress, lineColor, lineOpacity]
  );

  const dots = useMemo(
    () =>
      DOTS.map((dot, index) => (
        <DotNode
          key={`dot-${index}`}
          dot={dot}
          progress={progress}
          dotColor={dotColor}
          dotOpacity={dotOpacity}
        />
      )),
    [progress, dotColor, dotOpacity]
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          width,
          height,
          backgroundColor,
        },
        style,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="none"
      >
        {lines}
        {dots}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
});