
// import ProgressRing from '@/components/ProgressRing';
// import { createTweet } from '@/redux/slices/tweetSlice';
// import { AppDispatch } from '@/redux/store';
// import { uploadToCloudinary } from '@/services/upload.service';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { ResizeMode, Video } from 'expo-av';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import { useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch } from 'react-redux';

// const MAX_TWEET_LENGTH = 280;

// export default function CreateTweetScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();

//   const [content, setContent] = useState('');
//   const [localMedia, setLocalMedia] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   /* ================= DERIVED VALUES ================= */

//   const remainingChars = useMemo(() => {
//     return MAX_TWEET_LENGTH - content.length;
//   }, [content]);

//   const isOverLimit = remainingChars < 0;

//   const canPost = useMemo(() => {
//     return (!!content.trim() || localMedia.length > 0) && !loading && !isOverLimit;
//   }, [content, localMedia.length, loading, isOverLimit]);

//   /* ================= PICK MEDIA ================= */

//   const pickMedia = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All,
//         quality: 0.8,
//         allowsMultipleSelection: false,
//       });

//       if (!result.canceled && result.assets?.length > 0) {
//         setLocalMedia(prev => [...prev, result.assets[0].uri]);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick media');
//     }
//   };

//   const removeMedia = (indexToRemove: number) => {
//     setLocalMedia(prev => prev.filter((_, index) => index !== indexToRemove));
//   };

//   const isVideo = (url: string) => {
//     return /\.(mp4|mov|m4v|webm)$/i.test(url);
//   };

//   /* ================= CREATE ================= */

//   const handleCreate = async () => {
//     if (!content.trim() && localMedia.length === 0) return;

//     if (isOverLimit) {
//       Alert.alert(
//         'تنبيه',
//         `لقد تجاوزت الحد المسموح للحروف. الحد الأقصى هو ${MAX_TWEET_LENGTH} حرفًا.`
//       );
//       return;
//     }

//     try {
//       setLoading(true);
//       setProgress(0);

//       const total = localMedia.length;
//       let completed = 0;

//       let uploadedUrls: string[] = [];

//       if (total > 0) {
//         const uploadPromises = localMedia.map(async (uri) => {
//           const type = isVideo(uri) ? 'video' : 'image';
//           const url = await uploadToCloudinary(uri, type);

//           completed++;
//           setProgress((completed / total) * 100);

//           return url;
//         });

//         uploadedUrls = await Promise.all(uploadPromises);
//       }

//       await dispatch(
//         createTweet({
//           content: content.trim(),
//           media: uploadedUrls
//         })
//       );

//       setProgress(100);
//       router.back();
//     } catch (error) {
//       Alert.alert('Error', 'Upload failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* ===== Header ===== */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="close" size={26} color="#111" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.postBtn,
//             {
//               opacity: canPost ? 1 : 0.5
//             }
//           ]}
//           onPress={handleCreate}
//           disabled={!canPost}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFF" />
//           ) : (
//             <Text style={styles.postText}>Post</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* ===== Content ===== */}
//       <ScrollView
//         style={{ flex: 1 }}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         <TextInput
//           placeholder="What’s happening?"
//           multiline
//           style={styles.input}
//           value={content}
//           onChangeText={setContent}
//           maxLength={MAX_TWEET_LENGTH + 50}
//           textAlignVertical="top"
//           placeholderTextColor="#888"
//         />

//         {/* ===== Character Counter ===== */}
//         <View style={styles.counterRow}>
//           <Text
//             style={[
//               styles.counterText,
//               remainingChars <= 20 && !isOverLimit && styles.counterWarning,
//               isOverLimit && styles.counterError
//             ]}
//           >
//             {remainingChars}
//           </Text>
//           <Text style={styles.counterLabel}>
//             حرف متبقٍ من {MAX_TWEET_LENGTH}
//           </Text>
//         </View>

//         {localMedia.length > 0 && (
//           <View style={styles.mediaContainer}>
//             {localMedia.map((url, index) => (
//               <View key={`${url}-${index}`} style={styles.mediaWrapper}>
//                 {isVideo(url) ? (
//                   <Video
//                     source={{ uri: url }}
//                     style={styles.media}
//                     resizeMode={ResizeMode.CONTAIN}
//                     useNativeControls
//                   />
//                 ) : (
//                   <Image
//                     source={{ uri: url }}
//                     style={styles.media}
//                   />
//                 )}

//                 <TouchableOpacity
//                   style={styles.removeMediaBtn}
//                   onPress={() => removeMedia(index)}
//                 >
//                   <Ionicons name="close" size={18} color="#FFF" />
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       {/* ===== Bottom Bar ===== */}
//       <View style={styles.bottomBar}>
//         <TouchableOpacity onPress={pickMedia}>
//           <Ionicons
//             name="image-outline"
//             size={26}
//             color="#1D9BF0"
//           />
//         </TouchableOpacity>
//       </View>

//       {loading && (
//         <View style={styles.overlay}>
//           <ProgressRing progress={progress} />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 4,
//     paddingBottom: 8,
//   },

//   input: {
//     fontSize: 18,
//     marginTop: 20,
//     minHeight: 120,
//     color: '#111',
//   },

//   counterRow: {
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 10,
//     marginBottom: 6,
//   },

//   counterText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#666',
//   },

//   counterLabel: {
//     fontSize: 13,
//     color: '#888',
//   },

//   counterWarning: {
//     color: '#F59E0B',
//   },

//   counterError: {
//     color: '#DC2626',
//   },

//   mediaContainer: {
//     marginTop: 15,
//   },

//   mediaWrapper: {
//     position: 'relative',
//     marginTop: 10,
//   },

//   media: {
//     width: '100%',
//     height: 250,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//   },

//   removeMediaBtn: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: 'rgba(0,0,0,0.65)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   postBtn: {
//     backgroundColor: '#1D9BF0',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },

//   postText: {
//     color: '#FFF',
//     fontWeight: '600',
//   },

//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },

//   bottomBar: {
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//   }
// });

import ProgressRing from "@/components/ProgressRing";
import { createTweet } from "@/redux/slices/tweetSlice";
import { AppDispatch } from "@/redux/store";
import { uploadToCloudinary } from "@/services/upload.service";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const MAX_TWEET_LENGTH = 280;

export default function CreateTweetScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [localMedia, setLocalMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const remainingChars = useMemo(() => {
    return MAX_TWEET_LENGTH - content.length;
  }, [content]);

  const canPost = useMemo(() => {
    return (!!content.trim() || localMedia.length > 0) && !loading;
  }, [content, localMedia.length, loading]);

  const progressPercent = useMemo(() => {
    return Math.min((content.length / MAX_TWEET_LENGTH) * 100, 100);
  }, [content.length]);

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setLocalMedia((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media");
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setLocalMedia((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const isVideo = (url: string) => {
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };

  const handleContentChange = (text: string) => {
    // حماية إضافية بجانب maxLength
    if (text.length <= MAX_TWEET_LENGTH) {
      setContent(text);
    }
  };

  const handleCreate = async () => {
    if (!content.trim() && localMedia.length === 0) return;

    try {
      setLoading(true);
      setProgress(0);

      const total = localMedia.length;
      let completed = 0;
      let uploadedUrls: string[] = [];

      if (total > 0) {
        const uploadPromises = localMedia.map(async (uri) => {
          const type = isVideo(uri) ? "video" : "image";
          const url = await uploadToCloudinary(uri, type);

          completed++;
          setProgress((completed / total) * 100);

          return url;
        });

        uploadedUrls = await Promise.all(uploadPromises);
      }

      await dispatch(
        createTweet({
          content: content.trim(),
          media: uploadedUrls,
        })
      );

      setProgress(100);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>إنشاء منشور</Text>

        <TouchableOpacity
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
          onPress={handleCreate}
          disabled={!canPost}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.postText}>نشر</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Composer Card */}
        <View style={styles.composerCard}>
          <View style={styles.composerTop}>
            <View style={styles.avatarMock}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>

            <View style={styles.inputArea}>
              <TextInput
                placeholder="ماذا يحدث الآن؟"
                multiline
                style={styles.input}
                value={content}
                onChangeText={handleContentChange}
                maxLength={MAX_TWEET_LENGTH}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
                selectionColor="#2563EB"
              />

              <View style={styles.counterRow}>
                <View style={styles.counterLeft}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPercent}%` },
                        content.length >= 240 && styles.progressFillWarning,
                      ]}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.counterBadge,
                    content.length >= 240 && styles.counterBadgeWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.counterText,
                      content.length >= 240 && styles.counterTextWarning,
                    ]}
                  >
                    {remainingChars}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {localMedia.length > 0 && (
            <View style={styles.mediaContainer}>
              {localMedia.map((url, index) => (
                <View key={`${url}-${index}`} style={styles.mediaWrapper}>
                  {isVideo(url) ? (
                    <Video
                      source={{ uri: url }}
                      style={styles.media}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls
                    />
                  ) : (
                    <Image source={{ uri: url }} style={styles.media} />
                  )}

                  <LinearGradient
                    colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.05)"]}
                    style={styles.mediaOverlay}
                  />

                  <TouchableOpacity
                    style={styles.removeMediaBtn}
                    onPress={() => removeMedia(index)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={pickMedia}
              activeOpacity={0.85}
            >
              <Ionicons name="image-outline" size={20} color="#2563EB" />
              <Text style={styles.actionText}>إضافة صورة أو فيديو</Text>
            </TouchableOpacity>

            <View style={styles.limitInfo}>
              <Ionicons name="create-outline" size={16} color="#6B7280" />
              <Text style={styles.limitInfoText}>الحد الأقصى 280 حرفًا</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loadingCard}>
            <ProgressRing progress={progress} />
            <Text style={styles.loadingText}>جاري رفع المنشور...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
  },

  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  postBtn: {
    minWidth: 84,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#2563EB",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  postBtnDisabled: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0,
    elevation: 0,
  },

  postText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  composerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginTop: 8,
  },

  composerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  avatarMock: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  inputArea: {
    flex: 1,
  },

  input: {
    fontSize: 18,
    minHeight: 150,
    color: "#111827",
    paddingTop: 6,
    lineHeight: 28,
  },

  counterRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  counterLeft: {
    flex: 1,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  progressFillWarning: {
    backgroundColor: "#F59E0B",
  },

  counterBadge: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  counterBadgeWarning: {
    backgroundColor: "#FFF7ED",
  },

  counterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  counterTextWarning: {
    color: "#D97706",
  },

  mediaContainer: {
    marginTop: 16,
    gap: 12,
  },

  mediaWrapper: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },

  media: {
    width: "100%",
    height: 260,
    backgroundColor: "#E5E7EB",
  },

  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  removeMediaBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(17,24,39,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  actionsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  actionText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  limitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  limitInfoText: {
    fontSize: 13,
    color: "#6B7280",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 210,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
});