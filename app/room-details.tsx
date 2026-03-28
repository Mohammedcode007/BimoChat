// app/(tabs)/room-details.tsx
// ✅ صفحة تفاصيل الغرفة (مرتبطـة بـ Redux + API)
// ✅ تعتمد على room.slice.ts (detailsByRoom + fetchRoomDetails + selectors)
// ✅ تدعم Loading/Error + عرض بيانات فعلية
// ملاحظة: تأكد أن api service يرسل التوكن في Authorization Header (Bearer)

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    fetchRoomDetails,
    selectRoomDetailsById,
    selectRoomError,
    selectRoomLoadingDetails
} from "@/redux/slices/room.slice";

/* =========================
   HELPERS
========================= */

function formatRelative(dateIso?: string) {
  if (!dateIso) return "—";
  const d = new Date(dateIso).getTime();
  const now = Date.now();
  const diff = d - now;
  const abs = Math.abs(diff);

  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  if (mins < 60) return diff >= 0 ? `بعد ${mins} دقيقة` : `منذ ${mins} دقيقة`;
  if (hrs < 24) return diff >= 0 ? `بعد ${hrs} ساعة` : `منذ ${hrs} ساعة`;
  return diff >= 0 ? `بعد ${days} يوم` : `منذ ${days} يوم`;
}

function premiumLabel(level: 0 | 1 | 2 | 3 | 4) {
  switch (level) {
    case 0:
      return { label: "FREE", icon: "leaf-outline" as const };
    case 1:
      return { label: "SILVER", icon: "medal-outline" as const };
    case 2:
      return { label: "GOLD", icon: "trophy-outline" as const };
    case 3:
      return { label: "PLATINUM", icon: "diamond-outline" as const };
    case 4:
      return { label: "ELITE", icon: "sparkles-outline" as const };
    default:
      return { label: "FREE", icon: "leaf-outline" as const };
  }
}

function typeMeta(t: "public" | "private" | "protected" | "subscription") {
  if (t === "public") return { label: "PUBLIC", icon: "globe-outline" as const };
  if (t === "private") return { label: "PRIVATE", icon: "lock-closed-outline" as const };
  if (t === "protected") return { label: "PROTECTED", icon: "key-outline" as const };
  return { label: "SUBSCRIPTION", icon: "card-outline" as const };
}

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function safeStr(x: any, fallback = "") {
  const s = String(x ?? "");
  return s.trim() ? s : fallback;
}

/* =========================
   SCREEN
========================= */

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();

  const dispatch = useAppDispatch();
  const details = useAppSelector((s) => selectRoomDetailsById(s, String(roomId || "")));
  const loading = useAppSelector(selectRoomLoadingDetails);
  const error = useAppSelector(selectRoomError);

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  // ✅ UI Toggles (واجهة فقط)
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    const rid = String(roomId || "");
    if (!rid) return;
    dispatch(fetchRoomDetails(rid));
  }, [dispatch, roomId]);

  // ✅ حماية: لو لم تصل details بعد
  const room = details?.room;

  const type = room?.type ?? "public";
  const premiumLevel = Number(room?.premiumLevel ?? 0) as 0 | 1 | 2 | 3 | 4;

  const t = typeMeta(type);
  const p = premiumLabel(premiumLevel);

  const headerStats = useMemo(
    () => [
      { label: "Online", value: String(room?.usersCount ?? 0), icon: "pulse-outline" as const },
      { label: "Members", value: String(room?.membersCount ?? 0), icon: "people-outline" as const },
      { label: "Messages", value: String(room?.messagesCount ?? 0), icon: "chatbubbles-outline" as const }
    ],
    [room?.usersCount, room?.membersCount, room?.messagesCount]
  );

  const lists = details?.lists;

  // ✅ تعرض شاشة Loading بسيطة
  if (!roomId) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={22} color={theme.mutedText} />
        <Text style={[styles.centerText, { color: theme.mutedText }]}>roomId غير موجود</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover */}
      <View style={[styles.coverWrap, { backgroundColor: theme.cardAlt }]}>
        {room?.cover ? (
          <Image source={{ uri: room.cover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: theme.cardAlt }]} />
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={[styles.iconBtn, { backgroundColor: theme.overlay }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.8}
              style={[styles.iconBtn, { backgroundColor: theme.overlay }]}
            >
              <Ionicons name="share-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.8}
              style={[styles.iconBtn, { backgroundColor: theme.overlay }]}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar + Title */}
        <View style={styles.headerCardWrap}>
          <View style={[styles.headerCard, { backgroundColor: theme.background }]}>
            <View style={styles.headerRow}>
              <View style={[styles.roomAvatar, { backgroundColor: theme.cardAlt }]}>
                {room?.avatar ? (
                  <Image source={{ uri: room.avatar }} style={styles.roomAvatarImg} />
                ) : (
                  <Text style={[styles.avatarInitials, { color: theme.text }]}>
                    {initials(safeStr(room?.name, "Room"))}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.roomName, { color: theme.text }]} numberOfLines={1}>
                    {safeStr(room?.name, "Room")}
                  </Text>

                  {!!room?.isVerified && (
                    <View style={[styles.verifyPill, { backgroundColor: theme.verifyBg }]}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.verifyFg} />
                      <Text style={[styles.verifyText, { color: theme.verifyFg }]}>Verified</Text>
                    </View>
                  )}
                </View>

                {!!room?.description && (
                  <Text style={[styles.roomDesc, { color: theme.mutedText }]} numberOfLines={2}>
                    {room.description}
                  </Text>
                )}

                <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <Pill theme={theme} icon={t.icon} text={t.label} tone="neutral" />
                  <Pill
                    theme={theme}
                    icon={p.icon}
                    text={p.label}
                    tone={premiumLevel >= 2 ? "gold" : "neutral"}
                  />
                  <Pill
                    theme={theme}
                    icon="flame-outline"
                    text={`Boost L${Number(room?.boostLevel ?? 0)}`}
                    tone={Number(room?.boostLevel ?? 0) >= 3 ? "hot" : "neutral"}
                  />
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              {headerStats.map((s) => (
                <StatBox key={s.label} theme={theme} icon={s.icon} label={s.label} value={s.value} />
              ))}
            </View>

            {/* Loading / Error */}
            {!!loading && (
              <View style={[styles.inlineHint, { backgroundColor: theme.cardAlt }]}>
                <Ionicons name="time-outline" size={18} color={theme.mutedText} />
                <Text style={[styles.inlineHintText, { color: theme.mutedText }]}>
                  جاري تحميل التفاصيل...
                </Text>
              </View>
            )}
            {!!error && !loading && (
              <View style={[styles.inlineHint, { backgroundColor: theme.cardAlt }]}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.mutedText} />
                <Text style={[styles.inlineHintText, { color: theme.mutedText }]} numberOfLines={2}>
                  {error}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
        <ActionButton
          theme={theme}
          primary
          icon="enter-outline"
          title="دخول الغرفة"
          subtitle={room?.isLocked ? "الدخول متوقف مؤقتًا" : "انضم الآن وابدأ المحادثة"}
          onPress={() => {}}
          disabled={Boolean(room?.isLocked)}
        />

        <View style={{ height: 10 }} />

        <View style={styles.actionsGrid}>
          <MiniAction theme={theme} icon="settings-outline" label="إدارة" onPress={() => {}} />
          <MiniAction theme={theme} icon="notifications-outline" label="تنبيهات" onPress={() => setNotify((v) => !v)} />
          <MiniAction theme={theme} icon="people-outline" label="الأعضاء" onPress={() => {}} />
          <MiniAction theme={theme} icon="mic-outline" label="الصوت" onPress={() => {}} />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <Ionicons name="notifications-outline" size={20} color={theme.icon} />
            <Text style={[styles.switchText, { color: theme.text }]}>تفعيل التنبيهات</Text>
          </View>
          <Switch value={notify} onValueChange={setNotify} />
        </View>
      </View>

      {/* Overview */}
      <Section title="نظرة عامة">
        <InfoRow
          theme={theme}
          icon="person-outline"
          label="المنشئ"
          value={lists?.creator?.username ? `@${lists.creator.username}` : "—"}
        />
        <InfoRow theme={theme} icon="shield-outline" label="النوع" value={t.label} />
        <InfoRow theme={theme} icon="people-outline" label="الحد الأقصى" value={`${Number(room?.maxUsers ?? 0)} مستخدم`} />
        <InfoRow
          theme={theme}
          icon="time-outline"
          label="Slow Mode"
          value={Number(room?.slowModeSeconds ?? 0) > 0 ? `${Number(room?.slowModeSeconds ?? 0)} ثانية` : "Off"}
        />
        <InfoRow
          theme={theme}
          icon="warning-outline"
          label="Anti Spam"
          value={room?.antiSpamEnabled ? `On (${Number(room?.maxMessagesPerMinute ?? 0)}/min)` : "Off"}
        />
        <InfoRow theme={theme} icon="lock-closed-outline" label="Lock" value={room?.isLocked ? "Locked" : "Open"} />

        {type === "protected" && (
          <InfoRow
            theme={theme}
            icon="key-outline"
            label="Password"
            value={room?.passwordProtected ? "Enabled" : "—"}
          />
        )}

        {type === "subscription" && (
          <InfoRow
            theme={theme}
            icon="card-outline"
            label="Subscription"
            value={`${Number(room?.subscriptionPrice ?? 0)} Coinz`}
          />
        )}
      </Section>

      {/* Voice */}
      <Section title="الصوت">
        <InfoRow theme={theme} icon="mic-outline" label="مقاعد الصوت" value={`${Number(room?.maxVoiceSeats ?? 0)}`} />
        <MiniUsersRow
          theme={theme}
          title="المتحدثون"
          users={lists?.voiceSpeakers ?? []}
          empty="لا يوجد متحدثون الآن"
        />
        <MiniUsersRow
          theme={theme}
          title="قائمة الانتظار"
          users={lists?.voiceQueue ?? []}
          empty="لا يوجد أحد في الانتظار"
        />
        <MiniUsersRow
          theme={theme}
          title="رافعو الأيدي"
          users={lists?.raisedHands ?? []}
          empty="لا يوجد أي يد مرفوعة"
        />
      </Section>

      {/* Roles */}
      <Section title="الإدارة">
        <MiniUsersRow theme={theme} title="Owners" users={lists?.owners ?? []} empty="لا يوجد Owners" />
        <MiniUsersRow theme={theme} title="Admins" users={lists?.admins ?? []} empty="لا يوجد Admins" />
        <MiniUsersRow theme={theme} title="Active الآن" users={lists?.activeUsers ?? []} empty="لا يوجد Active" />
      </Section>

      {/* VIP / Muted */}
      <Section title="السلامة والمزايا">
        <CardLine
          theme={theme}
          icon="diamond-outline"
          title="VIP Users"
          subtitle={`${lists?.vipUsers?.length ?? 0} مستخدم`}
        />
        <View style={{ height: 10 }} />
        {(lists?.vipUsers?.length ?? 0) ? (
          <View style={[styles.listCard, { backgroundColor: theme.cardAlt }]}>
            {(lists?.vipUsers ?? []).map((x) => (
              <UserLine
                key={x.user._id}
                theme={theme}
                user={{ _id: x.user._id, username: x.user.username, avatar: x.user.avatar }}
                rightLabel={`ينتهي ${formatRelative(x.expiresAt)}`}
                rightIcon="time-outline"
              />
            ))}
          </View>
        ) : (
          <EmptyHint theme={theme} text="لا يوجد VIP حاليًا" />
        )}

        <View style={{ height: 16 }} />

        <CardLine
          theme={theme}
          icon="ban-outline"
          title="Muted Users"
          subtitle={`${lists?.mutedUsers?.length ?? 0} مستخدم`}
        />
        <View style={{ height: 10 }} />
        {(lists?.mutedUsers?.length ?? 0) ? (
          <View style={[styles.listCard, { backgroundColor: theme.cardAlt }]}>
            {(lists?.mutedUsers ?? []).map((x, idx) => (
              <View key={`${x.user._id}-${idx}`}>
                <UserLine
                  theme={theme}
                  user={{ _id: x.user._id, username: x.user.username, avatar: x.user.avatar }}
                  rightLabel={`ينتهي ${formatRelative(x.until)}`}
                  rightIcon="time-outline"
                />
                {!!x.reason && (
                  <Text style={[styles.reason, { color: theme.mutedText }]}>السبب: {x.reason}</Text>
                )}
                {idx !== (lists?.mutedUsers?.length ?? 0) - 1 && (
                  <View style={[styles.sep, { backgroundColor: theme.separator }]} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <EmptyHint theme={theme} text="لا يوجد Muted حاليًا" />
        )}
      </Section>

      {/* Poll */}
      <Section title="الاستفتاء">
        {room?.activePoll ? (
          <View style={[styles.pollCard, { backgroundColor: theme.cardAlt }]}>
            <View style={styles.pollHeader}>
              <Ionicons name="stats-chart-outline" size={20} color={theme.icon} />
              <Text style={[styles.pollQ, { color: theme.text }]}>{room.activePoll.question}</Text>
            </View>

            <Text style={[styles.pollMeta, { color: theme.mutedText }]}>
              ينتهي {formatRelative(room.activePoll.expiresAt)}
            </Text>

            <View style={{ marginTop: 10 }}>
              {(room.activePoll.options || []).map((o: any, idx: number) => (
                <View key={`${o.text}-${idx}`} style={styles.pollRow}>
                  <Text style={[styles.pollOpt, { color: theme.text }]} numberOfLines={1}>
                    {o.text}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.pollVotes, { color: theme.mutedText }]}>{o.votes}</Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.mutedText} />
                  </View>
                </View>
              ))}
            </View>

            <View style={{ height: 12 }} />

            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.85}
              style={[styles.pollBtn, { backgroundColor: theme.background }]}
            >
              <Ionicons name="checkbox-outline" size={18} color={theme.text} />
              <Text style={[styles.pollBtnText, { color: theme.text }]}>تصويت سريع</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <EmptyHint theme={theme} text="لا يوجد استفتاء نشط الآن" />
        )}
      </Section>

      {/* Advanced */}
      <Section title="تفاصيل متقدمة">
        <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons name="options-outline" size={20} color={theme.icon} />
              <Text style={[styles.switchText, { color: theme.text }]}>إظهار التفاصيل المتقدمة</Text>
            </View>
            <Switch value={showAdvanced} onValueChange={setShowAdvanced} />
          </View>

          {showAdvanced && (
            <>
              <View style={[styles.sep, { backgroundColor: theme.separator }]} />

              <InfoRow
                theme={theme}
                icon="trending-up-outline"
                label="Level / XP"
                value={`Lv ${Number(room?.level ?? 1)} • ${Number(room?.xp ?? 0)} XP`}
              />
              <InfoRow theme={theme} icon="flame-outline" label="Boost Points" value={`${Number(room?.boostPoints ?? 0)}`} />
              <InfoRow
                theme={theme}
                icon="time-outline"
                label="Boost Expires"
                value={room?.boostExpiresAt ? formatRelative(room.boostExpiresAt) : "—"}
              />
              <InfoRow theme={theme} icon="cash-outline" label="Total Revenue" value={`${Number(room?.totalRevenue ?? 0)} Coinz`} />
              <InfoRow
                theme={theme}
                icon="calendar-outline"
                label="Created"
                value={room?.createdAt ? new Date(room.createdAt).toLocaleString() : "—"}
              />
              <InfoRow
                theme={theme}
                icon="refresh-outline"
                label="Updated"
                value={room?.updatedAt ? new Date(room.updatedAt).toLocaleString() : "—"}
              />

              <View style={{ height: 10 }} />

              <Text style={[styles.subTitle, { color: theme.mutedText }]}>Tags</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {(room?.tags?.length ?? 0) ? (
                  (room?.tags ?? []).map((tag: string) => (
                    <View key={tag} style={[styles.tagPill, { backgroundColor: theme.cardAlt }]}>
                      <Text style={[styles.tagText, { color: theme.text }]}>#{tag}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.muted, { color: theme.mutedText }]}>—</Text>
                )}
              </View>
            </>
          )}
        </View>
      </Section>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* =========================
   UI Components
========================= */

function Section({ title, children }: any) {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>{title}</Text>
      {children}
    </View>
  );
}

function Pill({
  theme,
  icon,
  text,
  tone
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone: "neutral" | "gold" | "hot";
}) {
  const bg = tone === "gold" ? theme.pillGoldBg : tone === "hot" ? theme.pillHotBg : theme.cardAlt;
  const fg = tone === "gold" ? theme.pillGoldFg : tone === "hot" ? theme.pillHotFg : theme.text;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={14} color={fg} />
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function StatBox({
  theme,
  icon,
  label,
  value
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.cardAlt }]}>
      <Ionicons name={icon} size={18} color={theme.icon} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.mutedText }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  theme,
  primary,
  icon,
  title,
  subtitle,
  onPress,
  disabled
}: {
  theme: any;
  primary?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const bg = primary ? theme.primary : theme.cardAlt;
  const fg = primary ? theme.primaryText : theme.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={[styles.actionBtn, { backgroundColor: disabled ? theme.disabledBg : bg }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={[styles.actionIcon, { backgroundColor: primary ? theme.primarySoft : theme.background }]}>
          <Ionicons name={icon} size={18} color={primary ? theme.primary : theme.icon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.actionTitle, { color: fg }]}>{title}</Text>
          {!!subtitle && (
            <Text
              style={[styles.actionSub, { color: primary ? theme.primarySubText : theme.mutedText }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={fg} />
    </TouchableOpacity>
  );
}

function MiniAction({
  theme,
  icon,
  label,
  onPress
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.miniAction, { backgroundColor: theme.cardAlt }]}>
      <Ionicons name={icon} size={18} color={theme.icon} />
      <Text style={[styles.miniActionText, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  theme,
  icon,
  label,
  value
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.separator }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={theme.icon} />
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, { color: theme.mutedText }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CardLine({
  theme,
  icon,
  title,
  subtitle
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={[styles.cardLine, { backgroundColor: theme.background }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={theme.icon} />
        <View>
          <Text style={[styles.cardLineTitle, { color: theme.text }]}>{title}</Text>
          {!!subtitle && <Text style={[styles.cardLineSub, { color: theme.mutedText }]}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.mutedText} />
    </View>
  );
}

function EmptyHint({ theme, text }: { theme: any; text: string }) {
  return (
    <View style={[styles.emptyBox, { backgroundColor: theme.cardAlt }]}>
      <Ionicons name="information-circle-outline" size={18} color={theme.mutedText} />
      <Text style={[styles.emptyText, { color: theme.mutedText }]}>{text}</Text>
    </View>
  );
}

function UserLine({
  theme,
  user,
  rightLabel,
  rightIcon
}: {
  theme: any;
  user: { _id: string; username: string; avatar?: string; role?: string };
  rightLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.userLine}>
      <View style={styles.userLeft}>
        <View style={[styles.userAvatar, { backgroundColor: theme.background }]}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.userAvatarImg} />
          ) : (
            <Text style={[styles.userInitials, { color: theme.text }]}>{initials(user.username)}</Text>
          )}
        </View>
        <View>
          <Text style={[styles.userName, { color: theme.text }]}>{user.username}</Text>
          {!!user.role && <Text style={[styles.userRole, { color: theme.mutedText }]}>{user.role}</Text>}
        </View>
      </View>

      {!!rightLabel && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {!!rightIcon && <Ionicons name={rightIcon} size={16} color={theme.mutedText} />}
          <Text style={[styles.userRight, { color: theme.mutedText }]}>{rightLabel}</Text>
        </View>
      )}
    </View>
  );
}

function MiniUsersRow({
  theme,
  title,
  users,
  empty
}: {
  theme: any;
  title: string;
  users: any[];
  empty: string;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[styles.subTitle, { color: theme.mutedText }]}>{title}</Text>

      {users.length ? (
        <View style={[styles.listCard, { backgroundColor: theme.cardAlt }]}>
          {users.map((u, idx) => (
            <View key={u._id}>
              <UserLine theme={theme} user={{ _id: u._id, username: u.username, avatar: u.avatar, role: u.role }} />
              {idx !== users.length - 1 && <View style={[styles.sep, { backgroundColor: theme.separator }]} />}
            </View>
          ))}
        </View>
      ) : (
        <EmptyHint theme={theme} text={empty} />
      )}
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { fontSize: 13, fontWeight: "800" },

  coverWrap: {
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden"
  },
  cover: { width: "100%", height: 210 },

  topBar: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },

  headerCardWrap: { marginTop: -42, paddingHorizontal: 16, paddingBottom: 16 },
  headerCard: { borderRadius: 22, padding: 14, elevation: 2 },

  headerRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  roomAvatar: {
    width: 74,
    height: 74,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  roomAvatarImg: { width: "100%", height: "100%" },
  avatarInitials: { fontSize: 18, fontWeight: "900" },

  roomName: { fontSize: 18, fontWeight: "900" },
  roomDesc: { marginTop: 4, fontSize: 13, lineHeight: 18 },

  verifyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  verifyText: { fontSize: 12, fontWeight: "800" },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999
  },
  pillText: { fontSize: 12, fontWeight: "800" },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: { flex: 1, borderRadius: 18, padding: 12 },
  statValue: { marginTop: 8, fontSize: 16, fontWeight: "900" },
  statLabel: { marginTop: 2, fontSize: 12, fontWeight: "700" },

  inlineHint: {
    marginTop: 12,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  inlineHintText: { fontSize: 12, fontWeight: "800", flex: 1 },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8 },

  sectionCard: { borderRadius: 22, padding: 14 },

  actionBtn: {
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  actionTitle: { fontSize: 16, fontWeight: "900" },
  actionSub: { marginTop: 2, fontSize: 12, fontWeight: "700" },

  actionsGrid: { flexDirection: "row", gap: 10 },
  miniAction: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  miniActionText: { fontSize: 12, fontWeight: "800" },

  switchRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  switchLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchText: { fontSize: 14, fontWeight: "800" },

  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowLabel: { fontSize: 14, fontWeight: "800" },
  rowValue: { fontSize: 13, fontWeight: "700", maxWidth: "45%", textAlign: "right" },

  subTitle: { fontSize: 12, fontWeight: "900" },
  muted: { fontSize: 12, fontWeight: "700" },

  listCard: { borderRadius: 18, padding: 10 },
  sep: { height: 1, marginVertical: 10 },

  userLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  userAvatarImg: { width: "100%", height: "100%" },
  userInitials: { fontSize: 12, fontWeight: "900" },
  userName: { fontSize: 14, fontWeight: "900" },
  userRole: { marginTop: 2, fontSize: 11, fontWeight: "800" },
  userRight: { fontSize: 12, fontWeight: "800" },

  reason: { marginTop: 6, fontSize: 12, fontWeight: "700" },

  emptyBox: {
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10
  },
  emptyText: { fontSize: 12, fontWeight: "800" },

  cardLine: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardLineTitle: { fontSize: 14, fontWeight: "900" },
  cardLineSub: { marginTop: 2, fontSize: 12, fontWeight: "700" },

  pollCard: { borderRadius: 22, padding: 14 },
  pollHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  pollQ: { flex: 1, fontSize: 14, fontWeight: "900" },
  pollMeta: { marginTop: 6, fontSize: 12, fontWeight: "700" },
  pollRow: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  pollOpt: { flex: 1, fontSize: 13, fontWeight: "800" },
  pollVotes: { fontSize: 12, fontWeight: "900" },
  pollBtn: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  pollBtnText: { fontSize: 13, fontWeight: "900" },

  tagPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  tagText: { fontSize: 12, fontWeight: "900" }
});