// import { useLanguage } from '@/context/LanguageContext';
// import i18n from '@/localization/i18n';
// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const LANGUAGES = [
//   { id: 'ar', name: 'العربية' },
//   { id: 'en', name: 'English' },
// ];

// export default function LanguageSettingsScreen() {
//   const { language, changeLanguage } = useLanguage();

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

//       <View style={styles.container}>
//         <Text style={styles.header}>{i18n.t("language")}</Text>

//         <View style={styles.card}>
//           {LANGUAGES.map(l => (
//             <TouchableOpacity
//               key={l.id}
//               style={styles.row}
//               onPress={() => changeLanguage(l.id)}
//             >
//               <Text>{l.name}</Text>
//               {language === l.id && (
//                 <Ionicons name="checkmark" size={20} color="#6D5DF6" />
//               )}
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>
//     </SafeAreaView>

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F7F7F7',
//     padding: 16,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: '900',
//     marginBottom: 16,
//   },
//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 18,
//     padding: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   left: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   appName: {
//     fontSize: 22,
//     fontWeight: '800',
//     marginTop: 10,
//   },
//   version: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 12,
//   },
//   desc: {
//     fontSize: 14,
//     color: '#374151',
//     textAlign: 'center',
//   },
//   text: {
//     fontSize: 14,
//     lineHeight: 22,
//     color: '#374151',
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F7F7F7',
//   },
// });

import { Colors } from "@/constants/theme";
import { useLanguage, type AppLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES: {
  id: AppLanguage;
  labelKey: string;
  nativeName: string;
}[] = [
  { id: "ar", labelKey: "languageSettings.languages.ar", nativeName: "العربية" },
  { id: "en", labelKey: "languageSettings.languages.en", nativeName: "English" },
];

export default function LanguageSettingsScreen() {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="language-outline" size={18} color={theme.tint} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("languageSettings.headerTitle")}</Text>
            <Text style={s.headerSub}>{t("languageSettings.headerSub")}</Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="globe-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>{language.toUpperCase()}</Text>
          </View>
        </View>

        <View style={s.card}>
          {LANGUAGES.map((item, index) => {
            const active = language === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                style={[s.row, index === LANGUAGES.length - 1 && s.rowLast]}
                onPress={() => changeLanguage(item.id)}
              >
                <View>
                  <Text style={s.rowTitle}>{t(item.labelKey)}</Text>
                  <Text style={s.rowSub}>{item.nativeName}</Text>
                </View>

                {active && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.tint} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: theme.background,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: theme.text },
    headerSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: theme.mutedText },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pillText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },
    card: {
      marginTop: 16,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 1 },
      }),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      textAlign: "right",
    },
    rowSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "right",
    },
  });
}