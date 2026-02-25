import { setTabBarHidden } from "@/redux/slices/ui.slice";
import { useRef } from "react";
import { useDispatch } from "react-redux";

export function useHideTabBarOnScroll() {
  const dispatch = useDispatch();
  const lastY = useRef(0);

  const onScroll = (e: any) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    const dy = y - lastY.current;

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

  return { onScroll, onScrollBeginDrag };
}