import { Colors } from "@/constants/theme";
import { RootState } from "@/redux/store";
import * as Linking from "expo-linking";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSelector } from "react-redux";

export default function ForceUpdateScreen() {
  const cs = useColorScheme();
  const theme = Colors[cs === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  const fu = useSelector((st: RootState) => st.app);

  const openStore = async () => {
    if (fu.storeUrl) await Linking.openURL(fu.storeUrl);
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>تحديث إلزامي</Text>
      <Text style={s.msg}>
        {fu.message || "يوجد تحديث إلزامي. يرجى التحديث للمتابعة."}
      </Text>

      {!!fu.minSupportedVersion && (
        <Text style={s.meta}>أقل نسخة مدعومة: {fu.minSupportedVersion}</Text>
      )}
      {!!fu.latestVersion && (
        <Text style={s.meta}>آخر نسخة: {fu.latestVersion}</Text>
      )}

      <TouchableOpacity style={s.btn} onPress={openStore} activeOpacity={0.9}>
        <Text style={s.btnText}>تحديث الآن</Text>
      </TouchableOpacity>

      <Text style={s.note}>لا يمكن استخدام التطبيق قبل التحديث.</Text>
    </View>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 22,
    },
    title: { fontSize: 26, fontWeight: "900", color: theme.text, marginBottom: 10 },
    msg: { fontSize: 14, color: theme.mutedText, textAlign: "center", marginBottom: 14 },
    meta: { fontSize: 12.5, color: theme.subtleText, marginTop: 4 },
    btn: {
      marginTop: 18,
      height: 52,
      paddingHorizontal: 18,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
      alignSelf: "stretch",
    },
    btnText: { color: theme.primaryText, fontSize: 16, fontWeight: "800" },
    note: { marginTop: 14, fontSize: 12, color: theme.subtleText },
  });
}