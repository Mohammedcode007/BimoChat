// import ProgressRing from '@/components/ProgressRing';
// import { createTweet } from '@/redux/slices/tweetSlice';
// import { AppDispatch } from '@/redux/store';
// import { uploadToCloudinary } from '@/services/upload.service';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { ResizeMode, Video } from 'expo-av';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Image,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch } from 'react-redux';


// export default function CreateTweetScreen() {

//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();

//   const [content, setContent] = useState('');
//   const [localMedia, setLocalMedia] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= PICK MEDIA ================= */

//   const pickMedia = async () => {

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       quality: 0.8,
//       allowsMultipleSelection: false,
//     });

//     if (!result.canceled) {
//       setLocalMedia(prev => [...prev, result.assets[0].uri]);
//     }
//   };

//   const isVideo = (url: string) => {
//     return /\.(mp4|mov|m4v|webm)$/i.test(url);
//   };

//   /* ================= CREATE ================= */

// const [progress, setProgress] = useState(0);

// const handleCreate = async () => {

//   if (!content.trim() && localMedia.length === 0) return;

//   try {

//     setLoading(true);
//     setProgress(0);

//     const total = localMedia.length;
//     let completed = 0;

//     const uploadPromises = localMedia.map(async (uri) => {

//       const type = isVideo(uri) ? "video" : "image";

//       const url = await uploadToCloudinary(uri, type);

//       completed++;
//       setProgress((completed / total) * 100);

//       return url;
//     });

//     const uploadedUrls = await Promise.all(uploadPromises);

//     await dispatch(
//       createTweet({
//         content,
//         media: uploadedUrls
//       })
//     );

//     setProgress(100);
//     router.back();

//   } catch (error) {
//     Alert.alert("Error", "Upload failed");
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <SafeAreaView style={styles.container}>

//       {/* ===== Header ===== */}

//       <View style={styles.header}>

//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="close" size={26} />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.postBtn,
//             {
//               opacity:
//                 !content.trim() && localMedia.length === 0
//                   ? 0.5
//                   : 1
//             }
//           ]}
//           onPress={handleCreate}
//           disabled={
//             (!content.trim() && localMedia.length === 0) || loading
//           }
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFF" />
//           ) : (
//             <Text style={styles.postText}>
//               Post
//             </Text>
//           )}
//         </TouchableOpacity>

//       </View>

//       {/* ===== Content ===== */}

//       <ScrollView style={{ flex: 1 }}>

//         <TextInput
//           placeholder="What’s happening?"
//           multiline
//           style={styles.input}
//           value={content}
//           onChangeText={setContent}
//         />

//         {localMedia.length > 0 && (
//           <View style={{ marginTop: 15 }}>
//             {localMedia.map((url, index) =>
//               isVideo(url) ? (
//                 <Video
//                   key={index}
//                   source={{ uri: url }}
//                   style={styles.media}
//                   resizeMode={ResizeMode.CONTAIN}
//                   useNativeControls
//                 />
//               ) : (
//                 <Image
//                   key={index}
//                   source={{ uri: url }}
//                   style={styles.media}
//                 />
//               )
//             )}
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
// {loading && (
//   <View style={styles.overlay}>
//     <ProgressRing progress={progress} />
//   </View>
// )}

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
//   },

//   input: {
//     fontSize: 18,
//     marginTop: 20,
//     minHeight: 120,
//   },

//   media: {
//     width: '100%',
//     height: 250,
//     borderRadius: 12,
//     marginTop: 10,
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
// overlay: {
//   position: "absolute",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: "rgba(255,255,255,0.8)",
//   alignItems: "center",
//   justifyContent: "center"
// },

//   bottomBar: {
//     paddingVertical: 12,
//   }

// });
import ProgressRing from '@/components/ProgressRing';
import { createTweet } from '@/redux/slices/tweetSlice';
import { AppDispatch } from '@/redux/store';
import { uploadToCloudinary } from '@/services/upload.service';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const MAX_TWEET_LENGTH = 280;

export default function CreateTweetScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [localMedia, setLocalMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ================= DERIVED VALUES ================= */

  const remainingChars = useMemo(() => {
    return MAX_TWEET_LENGTH - content.length;
  }, [content]);

  const isOverLimit = remainingChars < 0;

  const canPost = useMemo(() => {
    return (!!content.trim() || localMedia.length > 0) && !loading && !isOverLimit;
  }, [content, localMedia.length, loading, isOverLimit]);

  /* ================= PICK MEDIA ================= */

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setLocalMedia(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setLocalMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const isVideo = (url: string) => {
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!content.trim() && localMedia.length === 0) return;

    if (isOverLimit) {
      Alert.alert(
        'تنبيه',
        `لقد تجاوزت الحد المسموح للحروف. الحد الأقصى هو ${MAX_TWEET_LENGTH} حرفًا.`
      );
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      const total = localMedia.length;
      let completed = 0;

      let uploadedUrls: string[] = [];

      if (total > 0) {
        const uploadPromises = localMedia.map(async (uri) => {
          const type = isVideo(uri) ? 'video' : 'image';
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
          media: uploadedUrls
        })
      );

      setProgress(100);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postBtn,
            {
              opacity: canPost ? 1 : 0.5
            }
          ]}
          onPress={handleCreate}
          disabled={!canPost}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.postText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ===== Content ===== */}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <TextInput
          placeholder="What’s happening?"
          multiline
          style={styles.input}
          value={content}
          onChangeText={setContent}
          maxLength={MAX_TWEET_LENGTH + 50}
          textAlignVertical="top"
          placeholderTextColor="#888"
        />

        {/* ===== Character Counter ===== */}
        <View style={styles.counterRow}>
          <Text
            style={[
              styles.counterText,
              remainingChars <= 20 && !isOverLimit && styles.counterWarning,
              isOverLimit && styles.counterError
            ]}
          >
            {remainingChars}
          </Text>
          <Text style={styles.counterLabel}>
            حرف متبقٍ من {MAX_TWEET_LENGTH}
          </Text>
        </View>

        {localMedia.length > 0 && (
          <View style={styles.mediaContainer}>
            {localMedia.map((url, index) => (
              <View key={`${url}-${index}`} style={styles.mediaWrapper}>
                {isVideo(url) ? (
                  <Video
                    source={{ uri: url }}
                    style={styles.media}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                  />
                ) : (
                  <Image
                    source={{ uri: url }}
                    style={styles.media}
                  />
                )}

                <TouchableOpacity
                  style={styles.removeMediaBtn}
                  onPress={() => removeMedia(index)}
                >
                  <Ionicons name="close" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===== Bottom Bar ===== */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={pickMedia}>
          <Ionicons
            name="image-outline"
            size={26}
            color="#1D9BF0"
          />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ProgressRing progress={progress} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },

  input: {
    fontSize: 18,
    marginTop: 20,
    minHeight: 120,
    color: '#111',
  },

  counterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },

  counterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },

  counterLabel: {
    fontSize: 13,
    color: '#888',
  },

  counterWarning: {
    color: '#F59E0B',
  },

  counterError: {
    color: '#DC2626',
  },

  mediaContainer: {
    marginTop: 15,
  },

  mediaWrapper: {
    position: 'relative',
    marginTop: 10,
  },

  media: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },

  removeMediaBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  postBtn: {
    backgroundColor: '#1D9BF0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  postText: {
    color: '#FFF',
    fontWeight: '600',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  bottomBar: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  }
});