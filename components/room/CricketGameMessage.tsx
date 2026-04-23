// import LottieView from "lottie-react-native";
// import React, { useMemo } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// type ThemeType = {
//   card: string;
//   text: string;
//   mutedText: string;
//   border: string;
//   primary: string;
//   success: string;
//   danger: string;
//   warning: string;
//   surface: string;
//   surface2: string;
// };

// type CricketMessageItem = {
//   id: string;
//   type: "game";
//   text?: string;
//   time: string;
//   sender?: {
//     id: string;
//     name: string;
//     avatar?: string;
//   };
//   game: {
//     gameType?: string;
//     title?: string;
//     state?: string;
//     turnUserId?: string;
//     winnerUserId?: string;
//     payload?: any;
//   };
// };

// export default function CricketGameMessage({
//   item,
//   currentUserId,
//   onPressAction,
//   theme,
// }: {
//   item: CricketMessageItem;
//   currentUserId: string;
//   onPressAction?: () => void;
//   theme: ThemeType;
// }) {
//   const cricket = item.game || {};
//   const payload = cricket.payload || {};
//   const state = String(cricket.state || "").trim().toLowerCase();

//   const isMyTurn =
//     Boolean(currentUserId) &&
//     String(cricket.turnUserId || "") === String(currentUserId);

//   const amWinner =
//     Boolean(currentUserId) &&
//     String(cricket.winnerUserId || "") === String(currentUserId);

//   const title = String(cricket.title || "Cricket").trim();

//   const players = Array.isArray(payload?.players)
//     ? payload.players.map((p: any) => String(p?.username || "")).filter(Boolean)
//     : [];

//   const scoreText = useMemo(() => {
//     const innings = payload?.innings || {};
//     const runs = Number(innings?.totalRuns || 0);
//     const wickets = Number(innings?.wickets || 0);
//     const overNumber = Number(innings?.overNumber || 0);
//     const overBalls = Number(innings?.overBalls || 0);

//     return `${runs}/${wickets} • ${overNumber}.${overBalls} ov`;
//   }, [payload]);

//   const winnerName = String(payload?.winnerUsername || "").trim();

//   const stateLabel = useMemo(() => {
//     if (state === "waiting") return "Waiting for players";
//     if (state === "live" && isMyTurn) return "Your turn";
//     if (state === "live" && !isMyTurn) return "Opponent turn";
//     if (state === "finished" && amWinner) return "You won";
//     if (state === "finished" && !amWinner) return "Match finished";
//     return "Cricket";
//   }, [state, isMyTurn, amWinner]);

//   const lottieSource = useMemo(() => {
//     if (state === "waiting") {
//       return require("@/assets/lottie/cricket/cricket-waiting.json");
//     }

//     if (state === "live" && isMyTurn) {
//       return require("@/assets/lottie/cricket/cricket-my-turn.json");
//     }

//     if (state === "live" && !isMyTurn) {
//       return require("@/assets/lottie/cricket/cricket-opponent-turn.json");
//     }

//     if (state === "finished" && amWinner) {
//       return require("@/assets/lottie/cricket/cricket-win.json");
//     }

//     if (state === "finished") {
//       return require("@/assets/lottie/cricket/cricket-result.json");
//     }

//     return require("@/assets/lottie/cricket/cricket-waiting.json");
//   }, [state, isMyTurn, amWinner]);

//   return (
//     <View
//       style={[
//         styles.card,
//         {
//           backgroundColor: theme.card,
//           borderColor: theme.border,
//         },
//       ]}
//     >
//       <View style={styles.topRow}>
//         <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
//         <Text style={[styles.time, { color: theme.mutedText }]}>{item.time}</Text>
//       </View>

//       <View style={styles.lottieWrap}>
//         <LottieView
//           source={lottieSource}
//           autoPlay
//           loop={state !== "finished"}
//           style={styles.lottie}
//         />
//       </View>

//       <Text
//         style={[
//           styles.stateText,
//           {
//             color:
//               state === "finished"
//                 ? amWinner
//                   ? theme.success
//                   : theme.warning
//                 : isMyTurn
//                 ? theme.primary
//                 : theme.text,
//           },
//         ]}
//       >
//         {stateLabel}
//       </Text>

//       {!!item.text && (
//         <Text style={[styles.messageText, { color: theme.text }]}>
//           {item.text}
//         </Text>
//       )}

//       {!!players.length && (
//         <Text style={[styles.players, { color: theme.mutedText }]}>
//           Players: {players.join(" • ")}
//         </Text>
//       )}

//       {state === "live" && (
//         <Text style={[styles.score, { color: theme.text }]}>
//           Score: {scoreText}
//         </Text>
//       )}

//       {state === "finished" && !!winnerName && (
//         <Text style={[styles.winner, { color: amWinner ? theme.success : theme.text }]}>
//           Winner: {winnerName}
//         </Text>
//       )}

//       {state === "live" && isMyTurn && (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={onPressAction}
//           style={[styles.actionBtn, { backgroundColor: theme.primary }]}
//         >
//           <Text style={styles.actionBtnText}>Play now</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width: "100%",
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 12,
//     marginVertical: 6,
//   },
//   topRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 8,
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: "900",
//     flex: 1,
//   },
//   time: {
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   lottieWrap: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//     marginBottom: 8,
//   },
//   lottie: {
//     width: 120,
//     height: 120,
//   },
//   stateText: {
//     textAlign: "center",
//     fontSize: 15,
//     fontWeight: "900",
//   },
//   messageText: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   players: {
//     marginTop: 8,
//     fontSize: 12,
//     textAlign: "center",
//   },
//   score: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: "800",
//     textAlign: "center",
//   },
//   winner: {
//     marginTop: 8,
//     fontSize: 15,
//     fontWeight: "900",
//     textAlign: "center",
//   },
//   actionBtn: {
//     marginTop: 12,
//     borderRadius: 14,
//     paddingVertical: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   actionBtnText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "900",
//   },
// });

import LottieView from "lottie-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ThemeType = {
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  surface: string;
  surface2: string;
};

type CricketMessageItem = {
  id: string;
  type: "game";
  text?: string;
  time: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  game: {
    gameType?: string;
    title?: string;
    state?: string;
    turnUserId?: string;
    winnerUserId?: string;
    payload?: any;
  };
};

export default function CricketGameMessage({
  item,
  currentUserId,
  onJoin,
  onPlayNow,
  theme,
}: {
  item: CricketMessageItem;
  currentUserId: string;
  onJoin?: () => void;
  onPlayNow?: () => void;
  theme: ThemeType;
}) {
  const cricket = item.game || {};
  const payload = cricket.payload || {};
  const state = String(cricket.state || "").trim().toLowerCase();

  const gameId = String(payload?.gameId || "").trim();
  const playersRequired = Number(payload?.playersRequired || 0);

  const players = Array.isArray(payload?.players) ? payload.players : [];
  const joinedCount = players.length;

  const joinedIds = new Set(
    players.map((p: any) => String(p?.userId || "")).filter(Boolean)
  );

  const isJoined = joinedIds.has(String(currentUserId));
  const canJoin =
    state === "waiting" &&
    !!gameId &&
    !isJoined &&
    (playersRequired <= 0 || joinedCount < playersRequired);

  const isMyTurn =
    state === "live" &&
    String(cricket.turnUserId || "") === String(currentUserId);

  const amWinner =
    state === "finished" &&
    String(cricket.winnerUserId || "") === String(currentUserId);

  const winnerName = String(payload?.winnerUsername || "").trim();

  const scoreText = (() => {
    const innings = payload?.innings || {};
    const runs = Number(innings?.totalRuns || 0);
    const wickets = Number(innings?.wickets || 0);
    const overNumber = Number(innings?.overNumber || 0);
    const overBalls = Number(innings?.overBalls || 0);
    return `${runs}/${wickets} • ${overNumber}.${overBalls} ov`;
  })();

  const lottieSource = (() => {
    if (state === "waiting") {
      return require("@/assets/lottie/cricket/cricket-waiting.json");
    }
    if (state === "live" && isMyTurn) {
      return require("@/assets/lottie/cricket/cricket-my-turn.json");
    }
    if (state === "live" && !isMyTurn) {
      return require("@/assets/lottie/cricket/cricket-opponent-turn.json");
    }
    if (state === "finished" && amWinner) {
      return require("@/assets/lottie/cricket/cricket-win.json");
    }
    return require("@/assets/lottie/cricket/cricket-result.json");
  })();

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 12,
        marginVertical: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 15 }}>
          {cricket.title || "Cricket"}
        </Text>
        <Text style={{ color: theme.mutedText, fontSize: 11 }}>{item.time}</Text>
      </View>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <LottieView
          source={lottieSource}
          autoPlay
          loop={state !== "finished"}
          style={{ width: 120, height: 120 }}
        />
      </View>

      {!!item.text && (
        <Text
          style={{
            color: theme.text,
            textAlign: "center",
            fontSize: 14,
            fontWeight: "700",
            marginTop: 4,
          }}
        >
          {item.text}
        </Text>
      )}

      {state === "waiting" && (
        <Text
          style={{
            color: theme.mutedText,
            textAlign: "center",
            marginTop: 8,
            fontSize: 12,
          }}
        >
          Joined: {joinedCount}
          {playersRequired > 0 ? ` / ${playersRequired}` : ""}
        </Text>
      )}

      {state === "live" && (
        <Text
          style={{
            color: isMyTurn ? theme.primary : theme.text,
            textAlign: "center",
            marginTop: 8,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          {isMyTurn ? "Your turn" : "Opponent turn"}
        </Text>
      )}

      {state === "live" && (
        <Text
          style={{
            color: theme.text,
            textAlign: "center",
            marginTop: 6,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          Score: {scoreText}
        </Text>
      )}

      {state === "finished" && (
        <Text
          style={{
            color: amWinner ? theme.success : theme.text,
            textAlign: "center",
            marginTop: 8,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          {amWinner ? "You won" : `Winner: ${winnerName || "Unknown"}`}
        </Text>
      )}

      {canJoin && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onJoin}
          style={{
            marginTop: 12,
            borderRadius: 14,
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
            Join
          </Text>
        </TouchableOpacity>
      )}

      {state === "waiting" && isJoined && (
        <View
          style={{
            marginTop: 12,
            borderRadius: 14,
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.surface2,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>
            Joined
          </Text>
        </View>
      )}

      {isMyTurn && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPlayNow}
          style={{
            marginTop: 12,
            borderRadius: 14,
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
            Play now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}