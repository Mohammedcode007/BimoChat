// import { setTabBarHidden } from "@/redux/slices/ui.slice";
// import { useRef } from "react";
// import { useDispatch } from "react-redux";

// export function useHideTabBarOnScroll() {
//   const dispatch = useDispatch();
//   const lastY = useRef(0);

//   const onScroll = (e: any) => {
//     const y = e?.nativeEvent?.contentOffset?.y ?? 0;
//     const dy = y - lastY.current;

//     // تجاهل الحركات الصغيرة
//     if (Math.abs(dy) < 6) return;

//     if (dy > 0 && y > 20) {
//       // ✅ نازل لتحت => اخفِ
//       dispatch(setTabBarHidden(true));
//     } else {
//       // ✅ طالع لفوق => اظهر
//       dispatch(setTabBarHidden(false));
//     }

//     lastY.current = y;
//   };

//   const onScrollBeginDrag = (e: any) => {
//     lastY.current = e?.nativeEvent?.contentOffset?.y ?? 0;
//   };

//   return { onScroll, onScrollBeginDrag };
// }

import { setTabBarHidden } from "@/redux/slices/ui.slice";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

export function useHideTabBarOnScroll() {
  const dispatch = useDispatch();
  const lastY = useRef(0);

  // ✅ عند دخول الشاشة (Focus) => أظهر التاب بار
  useFocusEffect(
    useCallback(() => {
      dispatch(setTabBarHidden(false));
      return () => {
        // ✅ عند مغادرة الشاشة (Unmount/Blur) => أظهر التاب بار
        dispatch(setTabBarHidden(false));
      };
    }, [dispatch])
  );

  const onScroll = (e: any) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    const dy = y - lastY.current;

    // ✅ لو وصلت لأعلى القائمة => أظهر
    if (y <= 0) {
      dispatch(setTabBarHidden(false));
      lastY.current = y;
      return;
    }

    // تجاهل الحركات الصغيرة
    if (Math.abs(dy) < 6) return;

    if (dy > 0 && y > 20) {
      // ✅ نازل لتحت => اخفِ
      dispatch(setTabBarHidden(true));
    } else {
      // ✅ طالع لفوق => اظهر
      dispatch(setTabBarHidden(false));
    }

    lastY.current = y;
  };

  const onScrollBeginDrag = (e: any) => {
    lastY.current = e?.nativeEvent?.contentOffset?.y ?? 0;
  };

  // ✅ مفيد لو تحب تناديه يدويًا من أي مكان
  const showTabBar = () => dispatch(setTabBarHidden(false));

  return { onScroll, onScrollBeginDrag, showTabBar };
}