
// import LottieView from "lottie-react-native";
// import React from "react";
// import { Text, TouchableOpacity, View } from "react-native";

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
//   onJoin,
//   onPlayNow,
//   theme,
// }: {
//   item: CricketMessageItem;
//   currentUserId: string;
//   onJoin?: () => void;
//   onPlayNow?: () => void;
//   theme: ThemeType;
// }) {
//   const cricket = item.game || {};
//   const payload = cricket.payload || {};
//   const state = String(cricket.state || "").trim().toLowerCase();

//   const gameId = String(payload?.gameId || "").trim();
//   const playersRequired = Number(payload?.playersRequired || 0);

//   const players = Array.isArray(payload?.players) ? payload.players : [];
//   const joinedCount = players.length;

//   const joinedIds = new Set(
//     players.map((p: any) => String(p?.userId || "")).filter(Boolean)
//   );

//   const isJoined = joinedIds.has(String(currentUserId));
//   const canJoin =
//     state === "waiting" &&
//     !!gameId &&
//     !isJoined &&
//     (playersRequired <= 0 || joinedCount < playersRequired);

//   const isMyTurn =
//     state === "live" &&
//     String(cricket.turnUserId || "") === String(currentUserId);

//   const amWinner =
//     state === "finished" &&
//     String(cricket.winnerUserId || "") === String(currentUserId);

//   const winnerName = String(payload?.winnerUsername || "").trim();

//   const scoreText = (() => {
//     const innings = payload?.innings || {};
//     const runs = Number(innings?.totalRuns || 0);
//     const wickets = Number(innings?.wickets || 0);
//     const overNumber = Number(innings?.overNumber || 0);
//     const overBalls = Number(innings?.overBalls || 0);
//     return `${runs}/${wickets} • ${overNumber}.${overBalls} ov`;
//   })();

//   const lottieSource = (() => {
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
//     return require("@/assets/lottie/cricket/cricket-result.json");
//   })();

//   return (
//     <View
//       style={{
//         width: "100%",
//         borderWidth: 1,
//         borderColor: theme.border,
//         backgroundColor: theme.card,
//         borderRadius: 18,
//         padding: 12,
//         marginVertical: 6,
//       }}
//     >
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: 8,
//         }}
//       >
//         <Text style={{ color: theme.text, fontWeight: "900", fontSize: 15 }}>
//           {cricket.title || "Cricket"}
//         </Text>
//         <Text style={{ color: theme.mutedText, fontSize: 11 }}>{item.time}</Text>
//       </View>

//       <View style={{ alignItems: "center", justifyContent: "center" }}>
//         <LottieView
//           source={lottieSource}
//           autoPlay
//           loop={state !== "finished"}
//           style={{ width: 120, height: 120 }}
//         />
//       </View>

//       {!!item.text && (
//         <Text
//           style={{
//             color: theme.text,
//             textAlign: "center",
//             fontSize: 14,
//             fontWeight: "700",
//             marginTop: 4,
//           }}
//         >
//           {item.text}
//         </Text>
//       )}

//       {state === "waiting" && (
//         <Text
//           style={{
//             color: theme.mutedText,
//             textAlign: "center",
//             marginTop: 8,
//             fontSize: 12,
//           }}
//         >
//           Joined: {joinedCount}
//           {playersRequired > 0 ? ` / ${playersRequired}` : ""}
//         </Text>
//       )}

//       {state === "live" && (
//         <Text
//           style={{
//             color: isMyTurn ? theme.primary : theme.text,
//             textAlign: "center",
//             marginTop: 8,
//             fontSize: 14,
//             fontWeight: "900",
//           }}
//         >
//           {isMyTurn ? "Your turn" : "Opponent turn"}
//         </Text>
//       )}

//       {state === "live" && (
//         <Text
//           style={{
//             color: theme.text,
//             textAlign: "center",
//             marginTop: 6,
//             fontSize: 13,
//             fontWeight: "700",
//           }}
//         >
//           Score: {scoreText}
//         </Text>
//       )}

//       {state === "finished" && (
//         <Text
//           style={{
//             color: amWinner ? theme.success : theme.text,
//             textAlign: "center",
//             marginTop: 8,
//             fontSize: 14,
//             fontWeight: "900",
//           }}
//         >
//           {amWinner ? "You won" : `Winner: ${winnerName || "Unknown"}`}
//         </Text>
//       )}

//       {canJoin && (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={onJoin}
//           style={{
//             marginTop: 12,
//             borderRadius: 14,
//             paddingVertical: 10,
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: theme.primary,
//           }}
//         >
//           <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
//             Join
//           </Text>
//         </TouchableOpacity>
//       )}

//       {state === "waiting" && isJoined && (
//         <View
//           style={{
//             marginTop: 12,
//             borderRadius: 14,
//             paddingVertical: 10,
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: theme.surface2,
//             borderWidth: 1,
//             borderColor: theme.border,
//           }}
//         >
//           <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>
//             Joined
//           </Text>
//         </View>
//       )}

//       {isMyTurn && (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={onPlayNow}
//           style={{
//             marginTop: 12,
//             borderRadius: 14,
//             paddingVertical: 10,
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: theme.primary,
//           }}
//         >
//           <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
//             Play now
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }
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
    gameId?: string;
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
  onChooseNumber,
  theme,
}: {
  item: CricketMessageItem;
  currentUserId: string;
  onJoin?: () => void;
  onChooseNumber?: (n: number) => void;
  theme: ThemeType;
}) {
  const cricket = item.game || {};
  const payload = cricket.payload || {};
  const state = String(cricket.state || "").trim().toLowerCase();

  const gameId = String(cricket.gameId || payload?.gameId || "").trim();
  const playersRequired = Number(payload?.playersRequired || 0);
  const mode = String(payload?.mode || "").trim().toLowerCase();
  const currentInningsNumber = Number(payload?.currentInningsNumber || 1);

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

  const currentTurnUserId = String(
    cricket.turnUserId ||
      payload?.currentTurnUserId ||
      payload?.innings?.strikerUserId ||
      ""
  );

  const winnerUserId = String(
    cricket.winnerUserId || payload?.winnerUserId || ""
  );

  const isMyTurn =
    state === "live" && currentTurnUserId === String(currentUserId);

  const amWinner =
    state === "finished" && winnerUserId === String(currentUserId);

  const winnerName = String(
    payload?.winnerUsername || payload?.scoreboard?.bestPlayerUsername || ""
  ).trim();

  const innings =
    payload?.innings ||
    payload?.scoreboard?.innings2 ||
    payload?.scoreboard?.innings1 ||
    {};

  const scoreText = (() => {
    const runs = Number(innings?.totalRuns || 0);
    const wickets = Number(innings?.wickets || 0);
    const overNumber = Number(innings?.overNumber || 0);
    const overBalls = Number(innings?.overBalls || 0);
    return `${runs}/${wickets} • ${overNumber}.${overBalls} ov`;
  })();

  const modeLabel = (() => {
    if (mode === "solo") return "Solo vs Server";
    if (mode === "ffa") return "Free For All";
    if (mode === "team") return "Team Match";
    return "Cricket";
  })();

  const lastBall = Array.isArray(innings?.timeline) && innings.timeline.length
    ? innings.timeline[innings.timeline.length - 1]
    : null;

  const myChoice = Number(lastBall?.batterChoice || 0);
  const oppChoice = Number(lastBall?.bowlerChoice || 0);

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
        <Text style={{ color: theme.mutedText, fontSize: 11 }}>
          {item.time}
        </Text>
      </View>

      <Text
        style={{
          color: theme.mutedText,
          textAlign: "center",
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        {modeLabel} • Innings {currentInningsNumber}
      </Text>

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

      {(state === "live" || state === "innings_break") && (
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

      {lastBall && myChoice > 0 && oppChoice > 0 && (
        <Text
          style={{
            color: theme.mutedText,
            textAlign: "center",
            marginTop: 6,
            fontSize: 12,
          }}
        >
          Last ball: You/Player {myChoice} • Opponent {oppChoice}
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

      {state === "live" && isMyTurn && (
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              color: theme.text,
              textAlign: "center",
              fontSize: 13,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Choose a number
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <TouchableOpacity
                key={n}
                activeOpacity={0.85}
                onPress={() => onChooseNumber?.(n)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.primary,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}