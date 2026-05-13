import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  value?: string;
  loading?: boolean;
  onClose: () => void;
  onSave: (date: Date) => void;
};

export default function BirthdatePickerModal({
  visible,
  value,
  loading,
  onClose,
  onSave,
}: Props) {
  const [date, setDate] = useState<Date>(parseDate(value));
  const openedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setDate(parseDate(value));
    }
  }, [visible, value]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!visible) {
      openedRef.current = false;
      return;
    }

    if (openedRef.current) return;
    openedRef.current = true;

    DateTimePickerAndroid.open({
      value: parseDate(value),
      mode: "date",
      display: "calendar",
      maximumDate: new Date(),
      onChange: (event, selectedDate) => {
        openedRef.current = false;

        if (event.type === "dismissed") {
          onClose();
          return;
        }

        if (selectedDate) {
          onSave(selectedDate);
        }

        onClose();
      },
    });
  }, [visible, value, onClose, onSave]);

  if (Platform.OS === "android") {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Birthdate</Text>

            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateBox}>
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
            />
          </View>

          <Text style={styles.previewText}>Selected: {formatDateDisplay(date)}</Text>

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
              onPress={() => onSave(date)}
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
      </View>
    </Modal>
  );
}

function parseDate(value?: string) {
  if (!value) return new Date(2000, 0, 1);

  const raw = String(value);

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return new Date(2000, 0, 1);
}

function formatDateDisplay(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
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
    marginBottom: 12,
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
  dateBox: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    textAlign: "center",
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