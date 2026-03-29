// app/story/[id].tsx
// ✅ StoryViewerScreen (Expo + React Native)
// ✅ يعرض كل قصص نفس المالك بالتتابع (لو عنده 2 أو أكثر)
// ✅ يدعم "id=me" لعرض حالتي (myStories)
// ✅ يبدأ من الـ storyId المفتوح
// ✅ يسجل viewStory لكل قصة عند عرضها (ليس للمالك)

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  deleteStory,
  fetchMyStories,
  fetchStoriesFeed,
  fetchStoryViewers,
  viewStory,
} from "@/redux/slices/storySlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width: W, height: H } = Dimensions.get("window");

type StoryMediaType = "image" | "video" | "text";

type Story = {
  _id: string;
  type: StoryMediaType;
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  createdAt?: string;
  viewsCount?: number;
  privacy?: "public" | "followers" | "private";
};

type StoryOwnerGroup = {
  _id: string; // ownerId
  username?: string;
  atUsername?: string;
  avatar?: string;
  isOnline?: boolean;
  latestStoryAt?: string;
  stories: Story[];
};

export default function StoryViewerScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  // Auth
  const me = useSelector((st: RootState) => st.auth?.user);

  // Stories state
  const feed = useSelector((st: RootState) => (st.stories?.feed || []) as StoryOwnerGroup[]);
  const myGroup = useSelector((st: RootState) => st.stories?.myStories as StoryOwnerGroup | null);

  const loadingViewers = useSelector((st: RootState) => Boolean(st.stories?.loadingViewers));
  const deleting = useSelector((st: RootState) => Boolean(st.stories?.loadingDelete));
  const error = useSelector((st: RootState) => st.stories?.error);

  const videoRef = useRef<Video>(null);

  // progress
  const [progress, setProgress] = useState(0); // 0..1
  const [loadingVideo, setLoadingVideo] = useState(false);
  const timerRef = useRef<any>(null);

  // viewers modal
  const [viewersOpen, setViewersOpen] = useState(false);

  // ✅ current index داخل قصص نفس المالك
  const [idx, setIdx] = useState(0);

  const CLOSE = () => router.back();

  const storyParam = String(id || "");
  const isMeParam = storyParam === "me";

  /** ======================================================
   * ✅ ضمان تحميل البيانات عند فتح الشاشة
   * ====================================================== */
  useEffect(() => {
    if (isMeParam) {
      void dispatch(fetchMyStories() as any);
      return;
    }

    void dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any);
    void dispatch(fetchMyStories() as any);
  }, [dispatch, isMeParam]);

  /** ======================================================
   * ✅ حدّد المالك + قائمة القصص + index البداية
   * - id=me => owner = myGroup ، startIndex = 0
   * - id=storyId => ابحث عن owner في myGroup ثم feed، وابدأ من نفس الـ storyId
   * ====================================================== */
  const resolved = useMemo(() => {
    const sid = storyParam;
    if (!sid) return null;

    // ✅ id=me
    if (sid === "me") {
      const storiesArr = myGroup?.stories || [];
      if (!myGroup) return null;
      return { owner: myGroup, stories: storiesArr, startIndex: 0 };
    }

    // 1) داخل حالتي
    if (myGroup?.stories?.length) {
      const startIndex = myGroup.stories.findIndex((x) => String(x._id) === sid);
      if (startIndex >= 0) {
        return { owner: myGroup, stories: myGroup.stories, startIndex };
      }
    }

    // 2) داخل feed
    for (const g of feed || []) {
      const startIndex = (g?.stories || []).findIndex((x) => String(x._id) === sid);
      if (startIndex >= 0) {
        return { owner: g, stories: g.stories || [], startIndex };
      }
    }

    return null;
  }, [storyParam, myGroup, feed]);

  // ✅ ثبّت idx عند تغيّر resolved (فتح قصة جديدة)
  useEffect(() => {
    if (!resolved) return;
    const safe = Math.max(0, Math.min(resolved.startIndex || 0, (resolved.stories?.length || 1) - 1));
    setIdx(safe);
  }, [resolved]);

  const owner = resolved?.owner || null;
  const stories = resolved?.stories || [];
  const story = stories?.[idx] || null;

  const isOwner = useMemo(() => {
    return String(owner?._id || "") !== "" && String(owner?._id) === String(me?._id || "");
  }, [owner?._id, me?._id]);

  /** ✅ viewersState (بعد تعريف story) */
  const viewersState = useSelector((st: RootState) =>
    story?._id ? st.stories?.viewersByStoryId?.[String(story._id)] : undefined
  );

  /** ======================================================
   * ✅ لو id=me ولم توجد قصص => اذهب للإنشاء مباشرة
   * ====================================================== */
  useEffect(() => {
    if (!isMeParam) return;
    if (myGroup && (myGroup.stories?.length || 0) === 0) {
      router.replace("/story/create" as any);
    }
  }, [isMeParam, myGroup, router]);

  /** =========================
   * ✅ تسجيل مشاهدة (ليس لحالتي)
   * ========================= */
  useEffect(() => {
    if (!story?._id) return;
    if (isOwner) return;
    void dispatch(viewStory(String(story._id)) as any);
  }, [dispatch, story?._id, isOwner]);

  /** =========================
   * ✅ انتقال للقصة التالية/السابقة
   * ========================= */
  const goNext = () => {
    if (!stories?.length) return CLOSE();
    if (idx < stories.length - 1) {
      setIdx((p) => Math.min(stories.length - 1, p + 1));
      return;
    }
    CLOSE();
  };

  const goPrev = () => {
    if (!stories?.length) return;
    if (idx > 0) {
      setIdx((p) => Math.max(0, p - 1));
      return;
    }
    // لو أول قصة: نخليها تعيد من البداية
    setProgress(0);
  };

  /** =========================
   * ✅ تشغيل progress لكل قصة:
   * - image/text => 6 ثواني ثم next
   * - video => من playback status ثم next عند النهاية
   * ========================= */
  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);

    if (!story) return;

    if (story.type === "image" || story.type === "text") {
      const totalMs = 6000;
      const stepMs = 50;
      let elapsed = 0;

      timerRef.current = setInterval(() => {
        elapsed += stepMs;
        const p = Math.min(1, elapsed / totalMs);
        setProgress(p);
        if (p >= 1) {
          clearInterval(timerRef.current);
          goNext();
        }
      }, stepMs);
    } else {
      setLoadingVideo(true);
    }

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?._id, idx]);

  const onPlaybackStatusUpdate = (st: any) => {
    if (!st?.isLoaded) return;

    const dur = Number(st.durationMillis || 0);
    const pos = Number(st.positionMillis || 0);

    if (dur > 0) setProgress(Math.max(0, Math.min(1, pos / dur)));

    if (st.didJustFinish) {
      goNext();
    }
  };

  const openViewers = async () => {
    if (!story?._id) return;
    if (!isOwner) return;

    setViewersOpen(true);
    await dispatch(fetchStoryViewers({ storyId: String(story._id), page: 1, limit: 50 }) as any);
  };

  const confirmDelete = async () => {
    if (!story?._id) return;

    const deletingId = String(story._id);
    const res = await dispatch(deleteStory(deletingId) as any);

    if ((res as any)?.meta?.requestStatus === "fulfilled") {
      await Promise.allSettled([
        dispatch(fetchMyStories() as any),
        dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any),
      ]);

      // ✅ بعد الحذف: لو في قصة بعد الحالية داخل نفس المجموعة اعرضها، وإلا اقفل
      if (idx < (stories.length - 1)) {
        setIdx((p) => p); // نفس index سيشير للي بعد الحذف
      } else if (idx > 0) {
        setIdx((p) => p - 1);
      } else {
        CLOSE();
      }
    }
  };

  if (!story || !owner) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text style={{ color: theme.text, fontWeight: "900", textAlign: "center" }}>الحالة غير موجودة</Text>

        {isMeParam ? (
          <Text style={{ marginTop: 8, color: theme.subtleText, fontWeight: "800", textAlign: "center" }}>
            لا توجد حالة لديك الآن. سيتم تحويلك لصفحة الإنشاء إن كانت البيانات محمّلة.
          </Text>
        ) : null}

        <Pressable
          onPress={CLOSE}
          style={{
            marginTop: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "900" }}>رجوع</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const ownerName = isOwner ? "حالتك" : owner.username || "User";
  const ownerSub = owner.atUsername || (story.createdAt ? String(story.createdAt) : "الآن");

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <View style={s.bg} />

      {/* ✅ Tap zones (يمين/يسار) للتنقل بين القصص */}
      <View style={s.tapRow}>
        <Pressable style={s.tapZone} onPress={goPrev} />
        <Pressable style={s.tapZone} onPress={goNext} />
      </View>

      {/* ✅ Top overlay */}
      <SafeAreaView style={s.safe}>
        <View style={s.progressWrap}>
          <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Ionicons name="person" size={18} color={"#fff"} />
            </View>

            <View>
              <Text style={s.name} numberOfLines={1}>
                {ownerName}
              </Text>
              <Text style={s.sub} numberOfLines={1}>
                {ownerSub}
              </Text>
            </View>

            {/* ✅ مؤشر (1/2) */}
            <View style={s.counterPill}>
              <Text style={s.counterText}>
                {Math.min(idx + 1, stories.length)}/{stories.length}
              </Text>
            </View>
          </View>

          <Pressable onPress={CLOSE} style={s.closeBtn}>
            <Ionicons name="close" size={20} color={"#fff"} />
          </Pressable>
        </View>

        {!!error && (
          <View style={s.errTop}>
            <Text style={s.errTopText}>{String(error)}</Text>
          </View>
        )}
      </SafeAreaView>

      {/* ✅ Content */}
      <View style={s.content}>
        {story.type === "image" && (
          <>
            <Image source={{ uri: story.mediaUrl! }} style={s.media} resizeMode="cover" />
            {!!story.text && (
              <View style={s.captionWrap}>
                <Text style={s.captionText}>{story.text}</Text>
              </View>
            )}
          </>
        )}

        {story.type === "video" && (
          <>
            <Video
              ref={videoRef}
              source={{ uri: story.mediaUrl! }}
              style={s.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              useNativeControls={false}
              onLoadStart={() => setLoadingVideo(true)}
              onReadyForDisplay={() => setLoadingVideo(false)}
              onLoad={() => setLoadingVideo(false)}
              onError={() => setLoadingVideo(false)}
            />

            {loadingVideo && (
              <View style={s.loadingOverlay}>
                <ActivityIndicator />
                <Text style={s.loadingText}>جاري تحميل الفيديو...</Text>
              </View>
            )}

            {!!story.text && (
              <View style={s.captionWrap}>
                <Text style={s.captionText}>{story.text}</Text>
              </View>
            )}
          </>
        )}

        {story.type === "text" && (
          <View style={s.textCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={"#fff"} />
            <Text style={s.textStory}>{story.text || ""}</Text>
          </View>
        )}
      </View>

      {/* ✅ Bottom actions */}
      <SafeAreaView style={s.bottomSafe}>
        <View style={s.bottomBar}>
          {isOwner ? (
            <>
              <Pressable style={s.bottomBtn} onPress={openViewers} disabled={loadingViewers}>
                {loadingViewers ? <ActivityIndicator /> : <Ionicons name="eye-outline" size={18} color={"#fff"} />}
                <Text style={s.bottomBtnText}>المشاهدات</Text>
                <Text style={s.bottomBtnMini}>{String(story.viewsCount ?? 0)}</Text>
              </Pressable>

              <Pressable
                style={[s.bottomBtn, { opacity: deleting ? 0.7 : 1 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? <ActivityIndicator /> : <Ionicons name="trash-outline" size={18} color={"#fff"} />}
                <Text style={s.bottomBtnText}>حذف</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={s.bottomBtn} onPress={() => {}}>
                <Ionicons name="arrow-undo-outline" size={18} color={"#fff"} />
                <Text style={s.bottomBtnText}>رد</Text>
              </Pressable>

              <Pressable style={[s.bottomBtn, { opacity: 0.9 }]} onPress={() => {}}>
                <Ionicons name="paper-plane-outline" size={18} color={"#fff"} />
                <Text style={s.bottomBtnText}>إرسال</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* ✅ Viewers Modal */}
      <Modal visible={viewersOpen} transparent animationType="fade" onRequestClose={() => setViewersOpen(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setViewersOpen(false)} />
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>من شاهد الحالة</Text>
            <Pressable onPress={() => setViewersOpen(false)} style={s.modalClose}>
              <Ionicons name="close" size={18} color={theme.text} />
            </Pressable>
          </View>

          <FlatList
            data={viewersState?.viewers || []}
            keyExtractor={(it: any, idx2) => String(it?._id || idx2)}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={{ paddingVertical: 18 }}>
                <Text style={{ color: theme.subtleText, fontWeight: "900", textAlign: "center" }}>
                  لا يوجد مشاهدات حتى الآن
                </Text>
              </View>
            }
            renderItem={({ item }: any) => (
              <View style={s.viewerRow}>
                <View style={s.viewerAvatar}>
                  <Ionicons name="person" size={16} color={theme.icon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.viewerName} numberOfLines={1}>
                    {item?.username || "User"}
                  </Text>
                  {!!item?.atUsername && (
                    <Text style={s.viewerSub} numberOfLines={1}>
                      {item.atUsername}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

/** ================= Styles ================= */
function makeStyles(theme: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: "#000" },
    bg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },

    // ✅ tap overlay
    tapRow: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      flexDirection: "row",
    },
    tapZone: { flex: 1 },

    safe: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },

    progressWrap: {
      height: 3,
      marginTop: Platform.select({ ios: 6, android: 10 }),
      marginHorizontal: 14,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.25)",
      overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 999 },

    header: {
      marginTop: 10,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 10 },

    avatar: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    name: { color: "#fff", fontWeight: "900", fontSize: 14, maxWidth: 200 },
    sub: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 12, marginTop: 2 },

    counterPill: {
      marginLeft: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },
    counterText: { color: "#fff", fontWeight: "900", fontSize: 12 },

    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },

    errTop: {
      marginTop: 10,
      marginHorizontal: 14,
      padding: 10,
      borderRadius: 14,
      backgroundColor: "rgba(255,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,0,0,0.25)",
    },
    errTopText: { color: "#fff", fontWeight: "900", fontSize: 12 },

    content: { flex: 1, justifyContent: "center", zIndex: 1 },
    media: { width: W, height: H },

    captionWrap: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 110,
      padding: 12,
      borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.35)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },
    captionText: { color: "#fff", fontWeight: "900", fontSize: 14, lineHeight: 20 },

    loadingOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    loadingText: { marginTop: 10, color: "rgba(255,255,255,0.85)", fontWeight: "900", fontSize: 12 },

    textCard: {
      marginHorizontal: 16,
      padding: 18,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      gap: 10,
    },
    textStory: { color: "#fff", fontWeight: "900", fontSize: 18, lineHeight: 26, textAlign: "center" },

    bottomSafe: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10 },
    bottomBar: {
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: Platform.select({ ios: 18, android: 14 }),
      flexDirection: "row",
      gap: 10,
    },
    bottomBtn: {
      flex: 1,
      height: 48,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 10,
    },
    bottomBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
    bottomBtnMini: { color: "rgba(255,255,255,0.85)", fontWeight: "900", fontSize: 12, marginLeft: 2 },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    modalCard: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 18,
      maxHeight: Math.round(H * 0.55),
      borderRadius: 18,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    modalTitle: { color: theme.text, fontWeight: "900", fontSize: 14 },
    modalClose: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    viewerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 10,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    viewerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    viewerName: { color: theme.text, fontWeight: "900", fontSize: 13 },
    viewerSub: { color: theme.mutedText, fontWeight: "800", fontSize: 12, marginTop: 2 },
  });
}