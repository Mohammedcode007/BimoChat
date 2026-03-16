// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView,
//     Platform,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     useColorScheme,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// import { Colors } from "@/constants/theme";
// import {
//     changePassword,
//     clearChangePasswordError,
//     resetChangePasswordState,
// } from "@/redux/slices/changePasswordSlice";
// import { AppDispatch, RootState } from "@/redux/store";

// export default function ChangePasswordScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   const { loading, success, error } = useSelector(
//     (st: RootState) => st.changePassword
//   );

//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirm, setConfirm] = useState("");

//   const canSubmit =
//     currentPassword.trim().length > 0 &&
//     newPassword.trim().length >= 6 &&
//     newPassword === confirm &&
//     !loading;

//   const onSubmit = () => {
//     if (newPassword !== confirm) {
//       Alert.alert("خطأ", "تأكيد كلمة المرور غير مطابق");
//       return;
//     }
//     dispatch(changePassword({ currentPassword, newPassword }));
//   };

//   useEffect(() => {
//     if (error) {
//       Alert.alert("خطأ", error);
//       dispatch(clearChangePasswordError());
//     }
//   }, [error]);

//   useEffect(() => {
//     if (success) {
//       Alert.alert("تم", "تم تغيير كلمة المرور بنجاح");
//       dispatch(resetChangePasswordState());
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirm("");
//       router.back();
//     }
//   }, [success]);

//   return (
//     <SafeAreaView style={s.safe} edges={["top"]}>
//       <KeyboardAvoidingView
//         style={s.container}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         {/* Header */}
//         <View style={s.header}>
//           <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
//             <Ionicons name="chevron-back" size={22} color={theme.text} />
//           </TouchableOpacity>

//           <Text style={s.title}>تغيير كلمة المرور</Text>

//           <View style={{ width: 40 }} />
//         </View>

//         {/* Form */}
//         <View style={s.card}>
//           <Text style={s.label}>كلمة المرور الحالية</Text>
//           <TextInput
//             value={currentPassword}
//             onChangeText={setCurrentPassword}
//             secureTextEntry
//             placeholder="••••••••"
//             placeholderTextColor={theme.mutedText}
//             style={s.input}
//           />

//           <Text style={s.label}>كلمة المرور الجديدة</Text>
//           <TextInput
//             value={newPassword}
//             onChangeText={setNewPassword}
//             secureTextEntry
//             placeholder="على الأقل 6 أحرف"
//             placeholderTextColor={theme.mutedText}
//             style={s.input}
//           />

//           <Text style={s.label}>تأكيد كلمة المرور الجديدة</Text>
//           <TextInput
//             value={confirm}
//             onChangeText={setConfirm}
//             secureTextEntry
//             placeholder="••••••••"
//             placeholderTextColor={theme.mutedText}
//             style={s.input}
//           />

//           <TouchableOpacity
//             onPress={onSubmit}
//             disabled={!canSubmit}
//             activeOpacity={0.85}
//             style={[s.btn, { opacity: canSubmit ? 1 : 0.55 }]}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <>
//                 <Ionicons name="key-outline" size={18} color="#fff" />
//                 <Text style={s.btnText}>حفظ</Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>

//         <Text style={s.note}>
//           نصيحة: استخدم كلمة مرور قوية ولا تشاركها مع أي شخص.
//         </Text>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// function makeStyles(theme: any) {
//   return StyleSheet.create({
//     safe: { flex: 1, backgroundColor: theme.background },
//     container: { flex: 1, backgroundColor: theme.background, padding: 16 },

//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 12,
//     },
//     backBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     title: { fontSize: 18, fontWeight: "900", color: theme.text },

//     card: {
//       borderRadius: 18,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 12,
//     },
//     label: {
//       fontSize: 12.5,
//       fontWeight: "900",
//       color: theme.text,
//       marginTop: 10,
//       marginBottom: 8,
//       textAlign: "right",
//     },
//     input: {
//       borderWidth: 1,
//       borderColor: theme.separator,
//       backgroundColor: theme.cardAlt,
//       borderRadius: 14,
//       paddingHorizontal: 12,
//       paddingVertical: 12,
//       color: theme.text,
//       fontSize: 14,
//       fontWeight: "700",
//       textAlign: "right",
//     },
//     btn: {
//       marginTop: 14,
//       paddingVertical: 14,
//       borderRadius: 16,
//       backgroundColor: theme.tint,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 8,
//     },
//     btnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

//     note: {
//       marginTop: 12,
//       textAlign: "center",
//       color: theme.mutedText,
//       fontWeight: "800",
//       fontSize: 12,
//     },
//   });
// }
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  changePassword,
  clearChangePasswordError,
  resetChangePasswordState,
} from "@/redux/slices/changePasswordSlice";
import { AppDispatch, RootState } from "@/redux/store";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  const { loading, success, error } = useSelector(
    (st: RootState) => st.changePassword
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    newPassword === confirm &&
    !loading;

  const onSubmit = () => {
    if (newPassword !== confirm) {
      Alert.alert(
        t("common.error"),
        t("changePassword.alerts.confirmMismatch")
      );
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }));
  };

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearChangePasswordError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    if (success) {
      Alert.alert(
        t("common.success"),
        t("changePassword.alerts.success")
      );
      dispatch(resetChangePasswordState());
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      router.back();
    }
  }, [success, dispatch, router, t]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={s.title}>{t("changePassword.title")}</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.label}>{t("changePassword.currentPasswordLabel")}</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder={t("changePassword.currentPasswordPlaceholder")}
            placeholderTextColor={theme.mutedText}
            style={s.input}
          />

          <Text style={s.label}>{t("changePassword.newPasswordLabel")}</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder={t("changePassword.newPasswordPlaceholder")}
            placeholderTextColor={theme.mutedText}
            style={s.input}
          />

          <Text style={s.label}>{t("changePassword.confirmPasswordLabel")}</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder={t("changePassword.confirmPasswordPlaceholder")}
            placeholderTextColor={theme.mutedText}
            style={s.input}
          />

          <TouchableOpacity
            onPress={onSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
            style={[s.btn, { opacity: canSubmit ? 1 : 0.55 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="key-outline" size={18} color="#fff" />
                <Text style={s.btnText}>{t("common.save")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={s.note}>{t("changePassword.note")}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: { fontSize: 18, fontWeight: "900", color: theme.text },

    card: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },
    label: {
      fontSize: 12.5,
      fontWeight: "900",
      color: theme.text,
      marginTop: 10,
      marginBottom: 8,
      textAlign: "right",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.cardAlt,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "right",
    },
    btn: {
      marginTop: 14,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: theme.tint,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    btnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

    note: {
      marginTop: 12,
      textAlign: "center",
      color: theme.mutedText,
      fontWeight: "800",
      fontSize: 12,
    },
  });
}