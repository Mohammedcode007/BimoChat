import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function TwitterInput({
  value,
  onChange,
  placeholder
}: Props) {

  const renderFormattedText = () => {
    const regex = /(@[\w_]+|#[\w_]+)/g;
    const parts = value.split(regex);

    return parts.map((part, index) => {

      if (/^@[\w_]+$/.test(part)) {
        return (
          <Text key={index} style={styles.mention}>
            {part}
          </Text>
        );
      }

      if (/^#[\w_]+$/.test(part)) {
        return (
          <Text key={index} style={styles.hashtag}>
            {part}
          </Text>
        );
      }

      return (
        <Text key={index} style={styles.normal}>
          {part}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>

      {/* Highlight Layer */}
      <Text style={styles.highlightText}>
        {value.length === 0
          ? <Text style={styles.placeholder}>{placeholder}</Text>
          : renderFormattedText()
        }
      </Text>

      {/* Invisible Real Input */}
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        style={styles.input}
        selectionColor="#1D9BF0"
        underlineColorAndroid="transparent"
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    minHeight: 150,
    position: "relative",
  },

  highlightText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#000",
  },

  input: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 18,
    lineHeight: 26,
    color: "transparent",
    backgroundColor: "transparent",
  },

  normal: {
    color: "#000",
  },

  mention: {
    color: "#1D9BF0",
    fontWeight: "600",
  },

  hashtag: {
    color: "#F59E0B",
    fontWeight: "600",
  },

  placeholder: {
    color: "#9CA3AF",
  }

});
