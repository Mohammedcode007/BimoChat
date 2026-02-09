

import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ================= TYPES ================= */

type Message = {
    id: string;
    type: 'text' | 'image' | 'gif' | 'sticker' | 'pdf' | 'audio';
    text?: string;
    uri?: string;
    sender: 'me' | 'other';
    time: string;
};

/* ================= COLORS ================= */

const COLORS = {
    me: '#6D5DF6',
    other: '#F2F2F2',
    bg: '#FFFFFF',
    time: '#9CA3AF',
};

/* ================= COMPONENT ================= */

export default function ChatScreen() {
    const flatListRef = useRef<any>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'text',
            text: 'Yes, it’s available.',
            sender: 'other',
            time: '4:56 pm',
        },
    ]);

    const [text, setText] = useState('');
    const [recording, setRecording] = useState<Audio.Recording | null>(null);

    /* ================= HELPERS ================= */

    const scrollToBottom = () => {
        flatListRef.current?.scrollToPosition(0, 0, true);
    };

    const sendText = () => {
        if (!text.trim()) return;

        setMessages(prev => [
            {
                id: Date.now().toString(),
                type: 'text',
                text,
                sender: 'me',
                time: 'Now',
            },
            ...prev,
        ]);

        setText('');
        scrollToBottom();
    };

    const sendImage = async (type: 'image' | 'gif' | 'sticker') => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!res.canceled) {
            setMessages(prev => [
                {
                    id: Date.now().toString(),
                    type,
                    uri: res.assets[0].uri,
                    sender: 'me',
                    time: 'Now',
                },
                ...prev,
            ]);
            scrollToBottom();
        }
    };

    const sendPDF = async () => {
        const res = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (res.assets) {
            setMessages(prev => [
                {
                    id: Date.now().toString(),
                    type: 'pdf',
                    uri: res.assets[0].uri,
                    text: res.assets[0].name,
                    sender: 'me',
                    time: 'Now',
                },
                ...prev,
            ]);
            scrollToBottom();
        }
    };

    const startRecording = async () => {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
    };

    const stopRecording = async () => {
        if (!recording) return;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        setMessages(prev => [
            {
                id: Date.now().toString(),
                type: 'audio',
                uri: uri!,
                sender: 'me',
                time: 'Now',
            },
            ...prev,
        ]);

        setRecording(null);
        scrollToBottom();
    };

    /* ================= RENDER ================= */

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
                {/* ================= HEADER ================= */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="arrow-back" size={22} />
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.name}>George Alan</Text>
                            <Text style={styles.online}>Online</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Ionicons name="call-outline" size={22} />
                        <Ionicons name="videocam-outline" size={22} />
                        <Ionicons name="ellipsis-vertical" size={20} />
                    </View>
                </View>


                {/* ================= CHAT ================= */}
                <KeyboardAwareFlatList
                    ref={flatListRef}
                    data={messages}
                    inverted
                    keyExtractor={item => item.id}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.bubble,
                                item.sender === 'me' ? styles.me : styles.other,
                            ]}
                        >
                            {item.type === 'text' && (
                                <Text
                                    style={[
                                        styles.text,
                                        item.sender === 'me' && { color: '#FFF' },
                                    ]}
                                >
                                    {item.text}
                                </Text>
                            )}

                            {(item.type === 'image' ||
                                item.type === 'gif' ||
                                item.type === 'sticker') && (
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.media}
                                    />
                                )}

                            {item.type === 'pdf' && (
                                <View style={styles.pdfRow}>
                                    <Ionicons name="document-text-outline" size={22} />
                                    <Text numberOfLines={1}>{item.text}</Text>
                                </View>
                            )}

                            {item.type === 'audio' && (
                                <Ionicons name="play-circle-outline" size={36} />
                            )}

                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                    )}
                />

                {/* ================= SCROLL BUTTON ================= */}
                <TouchableOpacity style={styles.scrollBtn} onPress={scrollToBottom}>
                    <Ionicons name="chevron-down" size={26} color="#FFF" />
                </TouchableOpacity>

                {/* ================= INPUT ================= */}
                <View style={styles.inputBar}>
                    <TouchableOpacity onPress={() => sendImage('image')}>
                        <Ionicons name="image-outline" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => sendImage('gif')}>
                        <Ionicons name="happy-outline" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={sendPDF}>
                        <Ionicons name="document-outline" size={24} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Type a message"
                        value={text}
                        onChangeText={setText}
                        multiline
                    />

                    {text ? (
                        <TouchableOpacity onPress={sendText}>
                            <Ionicons name="send" size={22} color={COLORS.me} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPressIn={startRecording}
                            onPressOut={stopRecording}
                        >
                            <Ionicons name="mic-outline" size={22} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },
    name: { fontSize: 16, fontWeight: '600' },

    bubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    me: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.me,
    },
    other: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.other,
    },
    text: { fontSize: 15 },
    time: { fontSize: 11, color: COLORS.time, marginTop: 4 },

    media: {
        width: 180,
        height: 180,
        borderRadius: 12,
    },

    pdfRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderTopWidth: 0.5,
        borderColor: '#E5E7EB',
    },
      headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
      avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  online: { fontSize: 12, color: '#22C55E' },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        maxHeight: 120,
    },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
    scrollBtn: {
        position: 'absolute',
        left: 16,
        bottom: 90,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.me,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
