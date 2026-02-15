

import { Ionicons } from '@expo/vector-icons';
import { Audio, ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
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

type Reaction = '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';

type Message = {
    id: string;
    type: 'text' | 'image' | 'gif' | 'sticker' | 'pdf' | 'audio' | 'video';
    text?: string;
    uri?: string;
    sender: 'me' | 'other';
    time: string;
    replyTo?: Message;
    reaction?: Reaction;
    unsent?: boolean;
};

/* ================= CONSTANTS ================= */

const COLORS = {
    me: '#6D5DF6',
    other: '#F2F2F2',
    bg: '#FFFFFF',
    time: '#9CA3AF',
};

const REACTIONS: Reaction[] = ['👍', '❤️', '😂', '😮', '😢', '😡'];

/* ================= COMPONENT ================= */

export default function ChatScreen() {
    const flatListRef = useRef<any>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

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
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [showActions, setShowActions] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [isRecordingPaused, setIsRecordingPaused] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const recordTimer = useRef<number | null>(null);

    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(1);
    const [activeAudio, setActiveAudio] = useState<Message | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    /* ================= HELPERS ================= */
    const togglePlay = async (uri: string, id: string) => {
        if (recording) return;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
        });

        // ▶️ نفس الصوت شغّال → Pause
        if (playingId === id && sound) {
            await sound.pauseAsync();
            setPlayingId(null);
            return;
        }

        // ▶️ نفس الصوت متوقّف مؤقتًا → Resume
        if (activeAudio?.id === id && sound) {
            await sound.playAsync();
            setPlayingId(id);
            return;
        }

        // ▶️ صوت جديد → أوقف القديم وأنشئ جديد
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }

        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setPlayingId(id);
        setActiveAudio({ id, uri } as Message);

        newSound.setOnPlaybackStatusUpdate(status => {
            if (!status.isLoaded) return;

            setPlaybackProgress(status.positionMillis);
            setPlaybackDuration(status.durationMillis || 1);

            if (status.didJustFinish) {
                setPlayingId(null);
                setActiveAudio(null);
                setPlaybackProgress(0);
            }
        });

        await newSound.playAsync();
    };



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
                replyTo: replyTo ?? undefined,
            },
            ...prev,
        ]);

        setText('');
        setReplyTo(null);
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
        try {
            if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                setPlayingId(null);
            }

            if (recording) return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const result = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            const newRecording = result.recording;

            setRecording(newRecording);
            setIsRecordingPaused(false);
            setRecordDuration(0);

            recordTimer.current = setInterval(() => {
                setRecordDuration(prev => prev + 1);
            }, 1000);
        } catch (e) {
            console.log('Recording error:', e);
        }
    };

    const pauseRecording = async () => {
        if (!recording) return;
        await recording.pauseAsync();
        setIsRecordingPaused(true);
    };

    const resumeRecording = async () => {
        if (!recording) return;
        await recording.startAsync();
        setIsRecordingPaused(false);
    };
    const sendVideo = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1,
        });

        if (!res.canceled) {
            setMessages(prev => [
                {
                    id: Date.now().toString(),
                    type: 'video',
                    uri: res.assets[0].uri,
                    sender: 'me',
                    time: 'Now',
                },
                ...prev,
            ]);
            scrollToBottom();
        }
    };


    const stopRecording = async () => {
        if (!recording) return;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (recordTimer.current !== null) {
            clearInterval(recordTimer.current);
            recordTimer.current = null;
        }

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
        setIsRecordingPaused(false);
        setRecordDuration(0);

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
    };
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: playbackDuration
                ? playbackProgress / playbackDuration
                : 0,
            duration: 120,
            useNativeDriver: false,
        }).start();
    }, [playbackProgress, playbackDuration]);


    const addReaction = (id: string, reaction: Reaction) => {
        setMessages(prev =>
            prev.map(m => (m.id === id ? { ...m, reaction } : m))
        );
        setShowActions(false);
    };

    const unsendMessage = (id: string) => {
        setMessages(prev =>
            prev.map(m => (m.id === id ? { ...m, unsent: true } : m))
        );
        setShowActions(false);
    };
    useEffect(() => {
        if (recording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.4,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [recording]);

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const seekBy = async (offset: number) => {
        if (!sound) return;
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) return;

        let newPos = status.positionMillis + offset;
        newPos = Math.max(0, Math.min(newPos, status.durationMillis || 0));
        await sound.setPositionAsync(newPos);
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
                {activeAudio && (
                    <View style={styles.globalAudioPlayer}>

                        {/* Left: Audio Icon */}
                        <View style={styles.audioIcon}>
                            <Ionicons name="musical-notes" size={18} color="#FFF" />
                        </View>

                        {/* Center: Controls + Progress */}
                        <View style={styles.audioCenter}>

                            {/* Controls */}
                            <View style={styles.audioControls}>
                                <TouchableOpacity onPress={() => seekBy(-10000)}>
                                    <Ionicons name="play-back" size={22} color="#374151" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.playBtn}
                                    onPress={() => togglePlay(activeAudio.uri!, activeAudio.id)}
                                >
                                    <Ionicons
                                        name={playingId ? 'pause' : 'play'}
                                        size={26}
                                        color="#FFF"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => seekBy(10000)}>
                                    <Ionicons name="play-forward" size={22} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            {/* Progress */}
                            <View style={styles.progressSection}>
                                <Text style={styles.timeText}>
                                    {formatTime(playbackProgress)}
                                </Text>

                                <View style={styles.globalProgressBg}>
                                    <Animated.View
                                        style={[
                                            styles.globalProgressFill,
                                            {
                                                width: progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.timeText}>
                                    {formatTime(playbackDuration)}
                                </Text>
                            </View>
                        </View>

                        {/* Close */}
                        <TouchableOpacity onPress={() => setActiveAudio(null)}>
                            <Ionicons name="close" size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                )}



                {/* ================= CHAT ================= */}
                <KeyboardAwareFlatList
                    ref={flatListRef}
                    data={messages}
                    inverted
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onLongPress={() => {
                                setSelectedMessage(item);
                                setShowActions(true);
                            }}
                            style={[
                                styles.bubble,
                                item.sender === 'me' ? styles.me : styles.other,
                            ]}
                        >
                            {item.unsent ? (
                                <Text style={styles.unsent}>Message was unsent</Text>
                            ) : (
                                <>
                                    {item.replyTo && (
                                        <View style={styles.replyBox}>
                                            <Text style={styles.replyName}>
                                                {item.replyTo.sender === 'me' ? 'You' : 'George'}
                                            </Text>
                                            <Text numberOfLines={1} style={styles.replyText}>
                                                {item.replyTo.text || 'Media message'}
                                            </Text>
                                        </View>
                                    )}

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
                                    {item.type === 'video' && (
                                        <View style={styles.videoWrapper}>
                                            <Video
                                                source={{ uri: item.uri }}
                                                style={styles.video}
                                                useNativeControls
                                                resizeMode={ResizeMode.CONTAIN}
                                                isLooping={false}
                                            />
                                        </View>
                                    )}

                                    {(item.type === 'image' ||
                                        item.type === 'gif' ||
                                        item.type === 'sticker') && (
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => setPreviewImage(item.uri!)}
                                            >
                                                <Image source={{ uri: item.uri }} style={styles.media} />
                                            </TouchableOpacity>
                                        )}


                                    {item.type === 'pdf' && (
                                        <View style={styles.pdfRow}>
                                            <Ionicons name="document-text-outline" size={22} />
                                            <Text numberOfLines={1}>{item.text}</Text>
                                        </View>
                                    )}

                                    {item.type === 'audio' && (
                                        <TouchableOpacity
                                            style={styles.audioRow}
                                            activeOpacity={0.8}
                                            onPress={() => togglePlay(item.uri!, item.id)}
                                        >
                                            {/* Play / Pause */}
                                            <Ionicons
                                                name={playingId === item.id ? 'pause' : 'play'}
                                                size={22}
                                                color={item.sender === 'me' ? '#FFF' : '#000'}
                                            />

                                            {/* Progress Bar */}
                                            <View style={styles.audioProgressWrapper}>
                                                <View style={styles.audioProgressBg}>
                                                    <Animated.View
                                                        style={[
                                                            styles.audioProgressFill,
                                                            {
                                                                width:
                                                                    playingId === item.id
                                                                        ? progressAnim.interpolate({
                                                                            inputRange: [0, 1],
                                                                            outputRange: ['0%', '100%'],
                                                                        })
                                                                        : '0%',

                                                                backgroundColor:
                                                                    item.sender === 'me' ? '#FFF' : '#6D5DF6',
                                                            },
                                                        ]}
                                                    />
                                                </View>

                                                <Text
                                                    style={[
                                                        styles.audioLabel,
                                                        { color: item.sender === 'me' ? '#FFF' : '#000' },
                                                    ]}
                                                >
                                                    Voice message
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}



                                    {item.reaction && (
                                        <View style={styles.reaction}>
                                            <Text>{item.reaction}</Text>
                                        </View>
                                    )}

                                    <Text style={styles.time}>{item.time}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                />

                {/* ================= REPLY PREVIEW ================= */}
                {replyTo && (
                    <View style={styles.replyPreview}>
                        <Text numberOfLines={1}>
                            Replying to: {replyTo.text || 'Media'}
                        </Text>
                        <TouchableOpacity onPress={() => setReplyTo(null)}>
                            <Ionicons name="close" size={18} />
                        </TouchableOpacity>
                    </View>
                )}

                {recording && (
                    <View style={styles.recordInfo}>
                        <Text style={{ color: '#EF4444' }}>
                            ● Recording {Math.floor(recordDuration / 60)}:
                            {(recordDuration % 60).toString().padStart(2, '0')}
                        </Text>

                        <TouchableOpacity
                            onPress={isRecordingPaused ? resumeRecording : pauseRecording}
                        >
                            <Ionicons
                                name={isRecordingPaused ? 'play' : 'pause'}
                                size={20}
                                color="#EF4444"
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ================= INPUT ================= */}
                <View style={styles.inputBar}>
                    <TouchableOpacity onPress={() => sendImage('image')}>
                        <Ionicons name="image-outline" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={sendPDF}>
                        <Ionicons name="document-outline" size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={sendVideo}>
                        <Ionicons name="videocam-outline" size={24} />
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
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                onPressIn={startRecording}
                                onPressOut={stopRecording}
                            >
                                <Ionicons
                                    name="mic"
                                    size={26}
                                    color={recording ? '#EF4444' : '#000'}
                                />
                            </TouchableOpacity>
                        </Animated.View>

                    )}
                </View>

                {/* ================= ACTIONS MODAL ================= */}
                <Modal transparent visible={showActions} animationType="fade">
                    <View style={styles.actionsOverlay}>
                        <View style={styles.actionsBox}>
                            <View style={styles.reactionsRow}>
                                {REACTIONS.map(r => (
                                    <TouchableOpacity
                                        key={r}
                                        onPress={() =>
                                            selectedMessage && addReaction(selectedMessage.id, r)
                                        }
                                    >
                                        <Text style={{ fontSize: 22 }}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    setReplyTo(selectedMessage);
                                    setShowActions(false);
                                }}
                            >
                                <Text style={styles.action}>Reply</Text>
                            </TouchableOpacity>

                            {selectedMessage?.sender === 'me' && (
                                <TouchableOpacity
                                    onPress={() => unsendMessage(selectedMessage.id)}
                                >
                                    <Text style={[styles.action, { color: 'red' }]}>
                                        Unsend
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={() => setShowActions(false)}>
                                <Text style={styles.cancel}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {/* ================= IMAGE PREVIEW MODAL ================= */}
                <Modal
                    visible={!!previewImage}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setPreviewImage(null)}
                >
                    <View style={styles.imagePreviewOverlay}>
                        <TouchableOpacity
                            style={styles.imagePreviewClose}
                            onPress={() => setPreviewImage(null)}
                        >
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: previewImage! }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

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
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerRight: { flexDirection: 'row', gap: 16 },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    name: { fontSize: 16, fontWeight: '600' },
    online: { fontSize: 12, color: '#22C55E' },

    bubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    me: { alignSelf: 'flex-end', backgroundColor: COLORS.me },
    other: { alignSelf: 'flex-start', backgroundColor: COLORS.other },
    audioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    text: { fontSize: 15 },
    time: { fontSize: 11, color: COLORS.time, marginTop: 4 },

    media: { width: 180, height: 180, borderRadius: 12 },

    pdfRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderTopWidth: 0.5,
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        maxHeight: 120,
    },

    replyBox: {
        borderLeftWidth: 3,
        borderColor: '#A5B4FC',
        paddingLeft: 8,
        marginBottom: 6,
    },
    replyName: { fontSize: 12, fontWeight: '600' },
    replyText: { fontSize: 12, color: '#fff' },


    audioProgressWrapper: {
        flex: 1,
    },

    audioProgressBg: {
        height: 3,
        width: '100%',   // ⭐ مهم جدًا
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
        marginBottom: 6,
    },
    videoWrapper: {
        width: 220,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },

    video: {
        width: '100%',
        height: '100%',
    },


    audioProgressFill: {
        height: '100%',
        borderRadius: 2,
    },

    audioLabel: {
        fontSize: 12,
        opacity: 0.9,
    },

    reaction: {
        position: 'absolute',
        bottom: -8,
        right: 8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 6,
    },

    replyPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: '#EEF2FF',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366F1',
    },
    recordInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },

    actionsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsBox: {
        backgroundColor: '#FFF',
        width: '80%',
        borderRadius: 16,
        padding: 16,
    },
    reactionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    action: { fontSize: 16, paddingVertical: 10 },
    cancel: { textAlign: 'center', marginTop: 8, color: '#6B7280' },

    unsent: {
        fontStyle: 'italic',
        color: '#fff',
    },




    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },


    globalAudioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 0.5,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },

    audioIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#6D5DF6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    audioCenter: {
        flex: 1,
    },

    audioControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        marginBottom: 6,
    },

    playBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6D5DF6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    globalProgressBg: {
        flex: 1,
        height: 3,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },

    globalProgressFill: {
        height: '100%',
        backgroundColor: '#6D5DF6',
    },

    timeText: {
        fontSize: 11,
        color: '#6B7280',
        width: 40,
        textAlign: 'center',
    },
    imagePreviewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fullImage: {
        width: '100%',
        height: '100%',
    },

    imagePreviewClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },


});
