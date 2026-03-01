

import { AppTheme, Colors, ThemeName } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
    cancelFriendRequest,
    searchUsers,
    sendFriendRequest,
} from "@/redux/slices/friendSlice";

import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";

export default function AddFriendScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const scheme = useColorScheme();

    const themeName: ThemeName = scheme === "dark" ? "dark" : "light";
    const theme: AppTheme = Colors[themeName];
    const s = useMemo(() => makeStyles(theme), [theme]);

    const { searchResults, loading } = useSelector((state: RootState) => state.friends);

    const [search, setSearch] = useState("");
    const [creatingChatId, setCreatingChatId] = useState<string | null>(null);

    /* ================= Handle Search ================= */

    const handleSearch = () => {
        const q = search.trim();
        if (!q) return;
        dispatch(searchUsers(q));
    };

    /* ================= Start Chat ================= */
const openChat = async (targetUserId: string) => {
  console.log("=======================================");
  console.log("[openChat] START");
  console.log("[openChat] targetUserId:", targetUserId);

  if (creatingChatId) {
    console.log("[openChat] Already creating chat for:", creatingChatId);
    console.log("=======================================");
    return;
  }

  try {
    setCreatingChatId(targetUserId);
    console.log("[openChat] Dispatch createChat...");

    const chat = await dispatch(createChat(targetUserId)).unwrap();

    console.log("[openChat] Chat created successfully");
    console.log("[openChat] chat._id:", chat?._id);
    console.log("[openChat] Full chat object:", chat);

    dispatch(setActiveChat(chat._id));
    console.log("[openChat] setActiveChat dispatched");

    console.log("[openChat] Fetching messages...");
    const messagesRes = await api.get(`/messages/${chat._id}?page=1`);

    console.log("[openChat] Messages fetched");
    console.log(
      "[openChat] messages count:",
      Array.isArray(messagesRes.data)
        ? messagesRes.data.length
        : "Not an array"
    );
    console.log("[openChat] messagesRes.data:", messagesRes.data);

    dispatch(
      setMessages({
        chatId: chat._id,
        messages: messagesRes.data,
      })
    );

    console.log("[openChat] setMessages dispatched");

    console.log("[openChat] Navigating to chat screen...");
    router.push(`/chat/${chat._id}`);

    console.log("[openChat] Navigation done");
  } catch (e: any) {
    console.log("❌ [openChat] ERROR OCCURRED");
    console.log("[openChat] Error message:", e?.message);
    console.log("[openChat] Full error:", e);
  } finally {
    setCreatingChatId(null);
    console.log("[openChat] FINISHED");
    console.log("=======================================");
  }
};

    /* ================= Render Button ================= */

    const renderFriendButton = (user: any) => {
        const disabled = loading;

        switch (user.relationshipStatus) {
            case "none":
                return (
                    <TouchableOpacity
                        style={[s.pillBtn, s.pillPrimary, disabled && s.disabledBtn]}
                        disabled={disabled}
                        onPress={() => dispatch(sendFriendRequest(user._id))}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="person-add-outline" size={16} color={theme.primaryText} />
                        <Text style={s.pillTextOnPrimary}>Add</Text>
                    </TouchableOpacity>
                );

            case "pending_sent":
                return (
                    <TouchableOpacity
                        style={[s.pillBtn, s.pillWarning, disabled && s.disabledBtn]}
                        disabled={disabled}
                        onPress={() => dispatch(cancelFriendRequest(user._id))}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="close-circle-outline" size={16} color="#111827" />
                        <Text style={s.pillTextOnWarning}>Cancel</Text>
                    </TouchableOpacity>
                );

            case "pending_received":
                return (
                    <View style={[s.pillBtn, s.pillNeutral]}>
                        <Ionicons name="time-outline" size={16} color={theme.icon} />
                        <Text style={s.pillTextNeutral}>Pending</Text>
                    </View>
                );

            case "accepted":
                return (
                    <View style={[s.pillBtn, s.pillSuccess]}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={theme.primaryText} />
                        <Text style={s.pillTextOnPrimary}>Friends</Text>
                    </View>
                );

            case "blocked_by_me":
                return (
                    <View style={[s.pillBtn, s.pillMuted]}>
                        <Ionicons name="ban-outline" size={16} color={theme.primaryText} />
                        <Text style={s.pillTextOnPrimary}>Blocked</Text>
                    </View>
                );

            case "blocked_me":
                return (
                    <View style={[s.pillBtn, s.pillDanger]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.primaryText} />
                        <Text style={s.pillTextOnPrimary}>Blocked You</Text>
                    </View>
                );

            default:
                return null;
        }
    };

    /* ================= Render Item ================= */

    const renderItem = ({ item }: any) => {
        const isBusy = creatingChatId === String(item?._id || "");

        return (
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Avatar */}
              <TouchableOpacity
  onPress={() =>
    router.push({
      pathname: "/profile/[id]",
      params: { id: item._id },
    })
  }
  style={{ position: "relative" }}
>
  <Image
    source={{
      uri:
        item.avatar ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU7ukgfgh3h397fTWEGFf9ZtmU7jY6wbDY1Q&s",
    }}
    style={s.avatar}
  />

  <View
    style={[
      s.onlineDot,
      {
        backgroundColor: item.isOnline
          ? theme.success
          : theme.subtleText,
        borderColor: theme.card,
      },
    ]}
  />
</TouchableOpacity>

                {/* Info */}
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[s.name, { color: theme.text }]} numberOfLines={1}>
                            {item.username}
                        </Text>

                        {item.isOnline ? (
                            <View style={[s.onlinePill, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
                                <Text style={[s.onlinePillText, { color: theme.text }]}>Online</Text>
                            </View>
                        ) : null}
                    </View>

                    <Text style={[s.username, { color: theme.mutedText }]} numberOfLines={1}>
                        {item.atUsername}
                    </Text>
                </View>

                {/* Actions */}
                <View style={s.actionsCol}>
                    {/* Chat icon (بعد البحث) */}
                    <TouchableOpacity
                        style={[s.chatIconBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
onPress={() => openChat(String(item?._id))}
                        disabled={isBusy}
                        activeOpacity={0.85}
                    >
                        {isBusy ? (
                            <ActivityIndicator size="small" color={theme.primaryText} />
                        ) : (
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.primaryText} />
                        )}
                    </TouchableOpacity>

                    {renderFriendButton(item)}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[s.header, { borderBottomColor: theme.separator }]}>
                <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.85} hitSlop={10}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={[s.headerTitle, { color: theme.text }]}>Add Friends</Text>
                    <Text style={[s.headerSub, { color: theme.mutedText }]}>ابحث ثم أرسل طلب أو ابدأ دردشة</Text>
                </View>

                <View style={s.headerBtn} />
            </View>

            {/* Search Box */}
            <View style={s.searchWrapper}>
                <View style={[s.searchBox, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                    <View style={[s.searchIcon, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                        <Ionicons name="search" size={18} color={theme.icon} />
                    </View>

                    <TextInput
                        placeholder="Search users..."
                        value={search}
                        onChangeText={setSearch}
                        style={[s.searchInput, { color: theme.text }]}
                        placeholderTextColor={theme.mutedText}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />

                    {!!search.trim() && (
                        <TouchableOpacity onPress={() => setSearch("")} style={[s.clearBtn, { borderColor: theme.border }]} hitSlop={10}>
                            <Ionicons name="close" size={18} color={theme.icon} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={[s.searchBtn, { backgroundColor: theme.primary }]} onPress={handleSearch} activeOpacity={0.85}>
                    <Ionicons name="search-outline" size={18} color={theme.primaryText} />
                </TouchableOpacity>
            </View>

            {/* Loader */}
            {loading && (
                <View style={{ paddingTop: 10 }}>
                    <ActivityIndicator />
                </View>
            )}

            {/* Empty State */}
            {!loading && search.length > 0 && searchResults.length === 0 && (
                <View style={s.empty}>
                    <Ionicons name="alert-circle-outline" size={20} color={theme.icon} />
                    <Text style={[s.emptyText, { color: theme.mutedText }]}>No users found</Text>
                </View>
            )}

            {/* Results */}
            <FlatList
                data={searchResults}
                keyExtractor={(item) => String(item._id)}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 14 }}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </SafeAreaView>
    );
}

/* ================= Styles (Theme) ================= */

function makeStyles(theme: any) {
    return StyleSheet.create({
        container: { flex: 1, paddingHorizontal: 14 },

        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 10,
            borderBottomWidth: 1,
            marginBottom: 10,
        },
        headerBtn: {
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
        },
        headerTitle: { fontSize: 18, fontWeight: "900" },
        headerSub: { marginTop: 2, fontSize: 12, fontWeight: "700" },

        searchWrapper: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
        },

        searchBox: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            borderWidth: 1,
            paddingHorizontal: 10,
            height: 48,
        },

        searchIcon: {
            width: 34,
            height: 34,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            marginRight: 10,
        },

        searchInput: {
            flex: 1,
            fontSize: 14,
            fontWeight: "800",
            paddingVertical: 0,
        },

        clearBtn: {
            width: 34,
            height: 34,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.surface2,
            borderWidth: 1,
        },

        searchBtn: {
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
        },

        card: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10, // ✅ كثافة أعلى
            paddingHorizontal: 10,
            borderRadius: 18,
            borderWidth: 1,
            marginBottom: 8,
        },

        avatar: {
            width: 50,
            height: 50,
            borderRadius: 18,
            marginRight: 10,
        },

        onlineDot: {
            position: "absolute",
            bottom: 2,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: 2,
        },

        name: { fontSize: 14, fontWeight: "900", maxWidth: "85%" },
        username: { marginTop: 2, fontSize: 12, fontWeight: "700" },

        onlinePill: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            borderWidth: 1,
        },
        onlinePillText: { fontSize: 11, fontWeight: "900" },

        actionsCol: { alignItems: "flex-end", gap: 8 },

        chatIconBtn: {
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
        },

        pillBtn: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
        },

        pillPrimary: { backgroundColor: theme.primary },
        pillSuccess: { backgroundColor: theme.success },
        pillWarning: { backgroundColor: theme.warning },
        pillDanger: { backgroundColor: theme.danger },
        pillMuted: { backgroundColor: "#6B7280" },
        pillNeutral: { backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },

        pillTextOnPrimary: { color: theme.primaryText, fontSize: 12, fontWeight: "900" },
        pillTextOnWarning: { color: "#111827", fontSize: 12, fontWeight: "900" },
        pillTextNeutral: { color: theme.text, fontSize: 12, fontWeight: "900" },

        disabledBtn: { opacity: 0.5 },

        empty: {
            marginTop: 14,
            alignItems: "center",
            gap: 8,
            paddingVertical: 10,
        },
        emptyText: { fontSize: 13, fontWeight: "800" },
    });
}