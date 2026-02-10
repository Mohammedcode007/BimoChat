import { Ionicons } from '@expo/vector-icons';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TWEET = {
  user: 'Fantasy Design',
  username: '@fantasy',
  time: '2h',
  text:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
  image: 'https://picsum.photos/600/350',
  likes: 190,
  comments: 22,
  shares: 18,
};

const COMMENTS = [
  {
    id: '1',
    user: 'Ahmed',
    text: 'تصميم رائع جدًا 👌',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: '2',
    user: 'Mohamed',
    text: 'فكرة جميلة 🔥',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: '3',
    user: 'Ali',
    text: 'محتوى ممتاز',
    avatar: 'https://i.pravatar.cc/150?img=21',
  },
  {
    id: '4',
    user: 'Sara',
    text: 'استمر 👏',
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
];


export default function InteractionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* ===== Tweet ===== */}
            <View style={styles.tweet}>
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{TWEET.user}</Text>
                  <Text style={styles.username}>
                    {TWEET.username} · {TWEET.time}
                  </Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={18} />
              </View>

              {/* Text */}
              <Text style={styles.text}>{TWEET.text}</Text>

              {/* Image */}
              <Image source={{ uri: TWEET.image }} style={styles.image} />

              {/* Actions */}
              <View style={styles.actions}>
                <Action icon="chatbubble-outline" count={TWEET.comments} />
                <Action icon="heart-outline" count={TWEET.likes} />
                <Action icon="share-social-outline" count={TWEET.shares} />
              </View>
            </View>

            {/* Comments title */}
            <Text style={styles.commentsTitle}>التعليقات</Text>
          </>
        }
        data={COMMENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
  <View style={styles.comment}>
    <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />

    <View style={styles.commentContent}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.user}</Text>
      </View>

      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  </View>
)}

        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ===== Action Component ===== */
function Action({
  icon,
  count,
}: {
  icon: any;
  count: number;
}) {
  return (
    <TouchableOpacity style={styles.action}>
      <Ionicons name={icon} size={18} color="#475569" />
      <Text style={styles.actionText}>{count}</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },

  tweet: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  username: {
    fontSize: 13,
    color: '#64748B',
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
    marginBottom: 10,
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 12,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#475569',
  },

  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 14,
    color: '#0F172A',
  },




  commentBubble: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
  },




  comment: {
  flexDirection: 'row',
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},

commentAvatar: {
  width: 34,
  height: 34,
  borderRadius: 17,
  marginRight: 10,
},

commentContent: {
  flex: 1,
},

commentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},

commentUser: {
  fontSize: 14,
  fontWeight: '600',
  color: '#0F172A',
},

commentText: {
  fontSize: 14,
  color: '#334155',
  lineHeight: 20,
},

});
