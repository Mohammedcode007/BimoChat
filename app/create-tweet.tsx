import ProgressRing from '@/components/ProgressRing';
import { createTweet } from '@/redux/slices/tweetSlice';
import { AppDispatch } from '@/redux/store';
import { uploadToCloudinary } from '@/services/upload.service';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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


export default function CreateTweetScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [localMedia, setLocalMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= PICK MEDIA ================= */

  const pickMedia = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setLocalMedia(prev => [...prev, result.assets[0].uri]);
    }
  };

  const isVideo = (url: string) => {
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };

  /* ================= CREATE ================= */

const [progress, setProgress] = useState(0);

const handleCreate = async () => {

  if (!content.trim() && localMedia.length === 0) return;

  try {

    setLoading(true);
    setProgress(0);

    const total = localMedia.length;
    let completed = 0;

    const uploadPromises = localMedia.map(async (uri) => {

      const type = isVideo(uri) ? "video" : "image";

      const url = await uploadToCloudinary(uri, type);

      completed++;
      setProgress((completed / total) * 100);

      return url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    await dispatch(
      createTweet({
        content,
        media: uploadedUrls
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
    <SafeAreaView style={styles.container}>

      {/* ===== Header ===== */}

      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postBtn,
            {
              opacity:
                !content.trim() && localMedia.length === 0
                  ? 0.5
                  : 1
            }
          ]}
          onPress={handleCreate}
          disabled={
            (!content.trim() && localMedia.length === 0) || loading
          }
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.postText}>
              Post
            </Text>
          )}
        </TouchableOpacity>

      </View>

      {/* ===== Content ===== */}

      <ScrollView style={{ flex: 1 }}>

        <TextInput
          placeholder="What’s happening?"
          multiline
          style={styles.input}
          value={content}
          onChangeText={setContent}
        />

        {localMedia.length > 0 && (
          <View style={{ marginTop: 15 }}>
            {localMedia.map((url, index) =>
              isVideo(url) ? (
                <Video
                  key={index}
                  source={{ uri: url }}
                  style={styles.media}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                />
              ) : (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.media}
                />
              )
            )}
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
  },

  input: {
    fontSize: 18,
    marginTop: 20,
    minHeight: 120,
  },

  media: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 10,
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
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255,255,255,0.8)",
  alignItems: "center",
  justifyContent: "center"
},

  bottomBar: {
    paddingVertical: 12,
  }

});
