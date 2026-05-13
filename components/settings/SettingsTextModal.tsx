import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  title: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  loading?: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function SettingsTextModal({
  visible,
  title,
  value,
  placeholder,
  multiline,
  secureTextEntry,
  keyboardType = "default",
  loading,
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) {
      setText(value || "");
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder || title}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            style={[styles.input, multiline && styles.textarea]}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={loading}
              activeOpacity={0.85}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              activeOpacity={0.85}
              onPress={() => onSave(text.trim())}
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#FFF",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },
  textarea: {
    minHeight: 110,
    paddingTop: 12,
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#374151",
  },
  saveText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
  },
});