import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type ChoiceItem = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  title: string;
  value?: string;
  options: ChoiceItem[];
  onClose: () => void;
  onSelect: (value: string) => void;
};

export default function SettingsChoiceModal({
  visible,
  title,
  value,
  options,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {options.map((item) => {
            const active = item.value === value;

            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.85}
                style={styles.option}
                onPress={() => onSelect(item.value)}
              >
                <Text style={styles.optionText}>{item.label}</Text>

                {active && (
                  <Ionicons name="checkmark-circle" size={22} color="#111827" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    marginBottom: 10,
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
  option: {
    minHeight: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
});