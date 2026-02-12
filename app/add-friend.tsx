import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
    acceptFriendRequest,
    cancelFriendRequest,
    rejectFriendRequest,
    searchUsers,
    sendFriendRequest,
} from "@/redux/slices/friendSlice";

import { AppDispatch, RootState } from "@/redux/store";

export default function AddFriendScreen() {

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

    const { searchResults, loading } =
        useSelector((state: RootState) => state.friends);

    const [search, setSearch] = useState("");

    /* ================= Handle Search ================= */

    const handleSearch = () => {
        if (!search.trim()) return;
        dispatch(searchUsers(search.trim()));
    };

    /* ================= Render Button ================= */

    const renderButton = (user: any) => {

        const disabled = loading;

        switch (user.relationshipStatus) {

            /* ===== NO RELATION ===== */
            case "none":
                return (
                    <TouchableOpacity
                        style={[styles.addBtn, disabled && styles.disabledBtn]}
                        disabled={disabled}
                        onPress={() => dispatch(sendFriendRequest(user._id))}
                    >
                        <Text style={styles.btnText}>Add</Text>
                    </TouchableOpacity>
                );

            /* ===== YOU SENT REQUEST ===== */
            case "pending_sent":
                return (
                    <TouchableOpacity
                        style={[styles.cancelBtn, disabled && styles.disabledBtn]}
                        disabled={disabled}
                        onPress={() => dispatch(cancelFriendRequest(user._id))}
                    >
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                );

            /* ===== HE SENT REQUEST ===== */
            case "pending_received":
                return (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.acceptBtn, disabled && styles.disabledBtn]}
                            disabled={disabled}
                            onPress={() => dispatch(acceptFriendRequest(user._id))}
                        >
                            <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.declineBtn, disabled && styles.disabledBtn]}
                            disabled={disabled}
                            onPress={() => dispatch(rejectFriendRequest(user._id))}
                        >
                            <Text style={styles.btnText}>Decline</Text>
                        </TouchableOpacity>
                    </View>
                );

            /* ===== FRIENDS ===== */
            case "accepted":
                return (
                    <View style={styles.friendBtn}>
                        <Text style={styles.friendText}>Friends</Text>
                    </View>
                );

            /* ===== BLOCKED BY ME ===== */
            case "blocked_by_me":
                return (
                    <View style={styles.blockedBtn}>
                        <Text style={styles.friendText}>Blocked</Text>
                    </View>
                );

            /* ===== BLOCKED ME ===== */
            case "blocked_me":
                return (
                    <View style={styles.blockedByBtn}>
                        <Text style={styles.friendText}>Blocked You</Text>
                    </View>
                );

            default:
                return null;
        }
    };



    /* ================= Render Item ================= */

    const renderItem = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>

            <View style={{ position: "relative" }}>
                <Image
                    source={{
                        uri: item.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU7ukgfgh3h397fTWEGFf9ZtmU7jY6wbDY1Q&s"
                    }}
                    style={styles.avatar}
                />

                {item.isOnline && (
                    <View style={styles.onlineDot} />
                )}
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>
                    {item.username}
                </Text>

                <Text style={styles.username}>
                    {item.atUsername}
                </Text>
            </View>

            {renderButton(item)}

        </View>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
        >

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    Add Friends
                </Text>

                <View style={{ width: 22 }} />
            </View>

            {/* Search Box */}
            <View style={styles.searchWrapper}>
                <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
                    <Ionicons name="search" size={18} color="#9CA3AF" />

                    <TextInput
                        placeholder="Search users..."
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />
                </View>

                <TouchableOpacity
                    style={styles.searchBtn}
                    onPress={handleSearch}
                >
                    <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* Loader */}
            {loading && (
                <ActivityIndicator style={{ marginTop: 15 }} />
            )}

            {/* Empty State */}
            {!loading && search.length > 0 && searchResults.length === 0 && (
                <Text style={styles.emptyText}>
                    No users found
                </Text>
            )}

            {/* Results */}
            <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 10 }}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />


        </SafeAreaView>
    );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({

    container: { flex: 1, paddingHorizontal: 16 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    searchBox: {
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: "center",
    },

    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },

    searchBtn: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },

    searchBtnText: {
        color: "#FFF",
        fontWeight: "600",
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 18,
        marginBottom: 10,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    actionRow: {
        flexDirection: "row",
        gap: 6,
    },

    cancelBtn: {
        backgroundColor: "#F59E0B",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },

    acceptBtn: {
        backgroundColor: "#10B981",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },

    declineBtn: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },

    onlineDot: {
        position: "absolute",
        bottom: 2,
        right: 10,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#22C55E",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    disabledBtn: {
        opacity: 0.5,
    },

    blockedBtn: {
        backgroundColor: "#6B7280",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },

    blockedByBtn: {
        backgroundColor: "#991B1B",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },

    name: {
        fontSize: 14,
        fontWeight: "600",
    },

    username: {
        fontSize: 12,
        color: "#9CA3AF",
    },

    addBtn: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },

    pendingBtn: {
        backgroundColor: "#F59E0B",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },

    friendBtn: {
        backgroundColor: "#10B981",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },

    btnText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600"
    },

    friendText: {
        color: "#FFF",
        fontWeight: "600",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 20,
        color: "#9CA3AF",
    },

});
