import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CommentsScreen() {
  const [comments, setComments] = useState<string[]>([]);
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text>{item}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Write a comment..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => {
          if (text.trim()) {
            setComments((p) => [...p, text]);
            setText('');
          }
        }}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  comment: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
  },
});
