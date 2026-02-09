import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','😭','😡','👍','🙏','🔥',
  '❤️','💔','🎉','😅','😉','🤍','👏','🤔','😴','🥳'
];

type Props = {
  onSelect: (emoji: string) => void;
};

export default function EmojiPicker({ onSelect }: Props) {
  return (
    <FlatList
      data={EMOJIS}
      keyExtractor={(item, index) => index.toString()}
      numColumns={8}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item)} style={styles.item}>
          <Text style={styles.emoji}>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    width: '12.5%',
    alignItems: 'center',
    marginVertical: 8,
  },
  emoji: {
    fontSize: 26, // ثابت وآمن
  },
});
