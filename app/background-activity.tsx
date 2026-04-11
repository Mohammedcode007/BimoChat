// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React from "react";
// import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// import { handleBackgroundReminderMaybeLater, handleBackgroundReminderOpenedSettings } from "@/components/backgroundReminder";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";


// export default function BackgroundActivityScreen() {
//   const router = useRouter();
//   const { colorScheme } = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"];

//   const openSettings = async () => {
//     try {
//       await handleBackgroundReminderOpenedSettings();
//       await Linking.openSettings();
//     } catch (error) {
//     }
//   };

//   const onMaybeLater = async () => {
//     try {
//       await handleBackgroundReminderMaybeLater();
//       router.back();
//     } catch (error) {
//       router.back();
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <View style={[styles.card, { backgroundColor: theme.card ?? theme.background }]}>
//         <View
//           style={[
//             styles.iconWrap,
//             {
//               backgroundColor:
//                 colorScheme === "dark"
//                   ? "rgba(255,255,255,0.08)"
//                   : "rgba(0,0,0,0.06)",
//             },
//           ]}
//         >
//           <Ionicons
//             name="battery-charging-outline"
//             size={34}
//             color={theme.tint}
//           />
//         </View>

//         <Text style={[styles.title, { color: theme.text }]}>
//           Keep Bimo Running in the Background
//         </Text>

//         <Text style={[styles.description, { color: theme.mutedText ?? theme.text }]}>
//           Some phones restrict background activity to save battery. This may delay
//           notifications, messages, and real-time updates. Allowing background activity
//           can help Bimo deliver a smoother chat experience.
//         </Text>

//         <View style={styles.points}>
//           <Text style={[styles.point, { color: theme.text }]}>
//             • Receive notifications more reliably
//           </Text>
//           <Text style={[styles.point, { color: theme.text }]}>
//             • Improve message delivery speed
//           </Text>
//           <Text style={[styles.point, { color: theme.text }]}>
//             • Help real-time chats stay updated
//           </Text>
//         </View>

//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.primaryButton, { backgroundColor: theme.tint }]}
//           onPress={openSettings}
//         >
//           <Text style={styles.primaryButtonText}>Open Settings</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           activeOpacity={0.8}
//           style={[
//             styles.secondaryButton,
//             {
//               borderColor:
//                 colorScheme === "dark"
//                   ? "rgba(255,255,255,0.12)"
//                   : "rgba(0,0,0,0.10)",
//             },
//           ]}
//           onPress={onMaybeLater}
//         >
//           <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
//             Maybe Later
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//   },
//   card: {
//     borderRadius: 24,
//     padding: 24,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     shadowOffset: { width: 0, height: 8 },
//     elevation: 6,
//   },
//   iconWrap: {
//     width: 68,
//     height: 68,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "center",
//     marginBottom: 18,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     textAlign: "center",
//     marginBottom: 14,
//   },
//   description: {
//     fontSize: 15,
//     lineHeight: 24,
//     textAlign: "center",
//     marginBottom: 18,
//   },
//   points: {
//     marginBottom: 22,
//   },
//   point: {
//     fontSize: 15,
//     lineHeight: 24,
//     marginBottom: 6,
//   },
//   primaryButton: {
//     height: 52,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   primaryButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "800",
//   },
//   secondaryButton: {
//     height: 52,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//   },
//   secondaryButtonText: {
//     fontSize: 15,
//     fontWeight: "700",
//   },
// });
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  handleBackgroundReminderMaybeLater,
  handleBackgroundReminderOpenedSettings,
} from "@/components/backgroundReminder";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function BackgroundActivityScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const openBatterySettingsDirectly = async () => {
    try {
      await handleBackgroundReminderOpenedSettings();

      // iPhone: لا يوجد مسار مباشر مثل أندرويد، لذا نفتح إعدادات التطبيق فقط
      if (Platform.OS !== "android") {
        await Linking.openSettings();
        return;
      }

      const packageName = Application.applicationId;
      if (!packageName) {
        await Linking.openSettings();
        return;
      }

      try {
        // 1) طلب إضافة التطبيق مباشرة إلى قائمة تجاهل تحسين البطارية
        await IntentLauncher.startActivityAsync(
          "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
          {
            data: `package:${packageName}`,
          }
        );
        return;
      } catch {}

      try {
        // 2) فتح شاشة Battery Optimization العامة
        await IntentLauncher.startActivityAsync(
          "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"
        );
        return;
      } catch {}

      try {
        // 3) فتح شاشة تفاصيل التطبيق مباشرة
        await IntentLauncher.startActivityAsync(
          "android.settings.APPLICATION_DETAILS_SETTINGS",
          {
            data: `package:${packageName}`,
          }
        );
        return;
      } catch {}

      // 4) fallback أخير
      await Linking.openSettings();
    } catch {
      await Linking.openSettings();
    }
  };

  const onMaybeLater = async () => {
    try {
      await handleBackgroundReminderMaybeLater();
      router.back();
    } catch {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card ?? theme.background }]}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
            },
          ]}
        >
          <Ionicons
            name="battery-charging-outline"
            size={34}
            color={theme.tint}
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Keep Bimo Running in the Background
        </Text>

        <Text style={[styles.description, { color: theme.mutedText ?? theme.text }]}>
          Enable battery/background permission for better notifications,
          faster messages, and more stable real-time chat.
        </Text>

        <View style={styles.points}>
          <Text style={[styles.point, { color: theme.text }]}>
            • Receive notifications more reliably
          </Text>
          <Text style={[styles.point, { color: theme.text }]}>
            • Improve message delivery speed
          </Text>
          <Text style={[styles.point, { color: theme.text }]}>
            • Help real-time chats stay updated
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={openBatterySettingsDirectly}
        >
          <Text style={styles.primaryButtonText}>Enable Background Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.secondaryButton,
            {
              borderColor:
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.10)",
            },
          ]}
          onPress={onMaybeLater}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            Maybe Later
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 18,
  },
  points: {
    marginBottom: 22,
  },
  point: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 6,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});