// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import {
//     Image,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// export default function ProfileScreen() {
//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//       {/* ===== Cover ===== */}
//       <Image
//         source={{ uri: 'https://picsum.photos/800/500' }}
//         style={styles.cover}
//       />

//       {/* ===== Card ===== */}
//       <View style={styles.card}>
//         {/* Avatar */}
//         <Image
//           source={{ uri: 'https://picsum.photos/200' }}
//           style={styles.avatar}
//         />

//         {/* Name */}
//         <Text style={styles.name}>Melissa Peters</Text>

//         {/* Username / ID */}
//         <Text style={styles.username}>@melissa_peters · ID: 458921</Text>

//         {/* Bio */}
//         <Text style={styles.bio}>
//           Interior designer ✨  
//           أحب البساطة والتصميم العصري وأشارك أفكاري هنا.
//         </Text>

//         {/* Location */}
//         <View style={styles.location}>
//           <Ionicons name="location-outline" size={16} color="#6B7280" />
//           <Text style={styles.locationText}>Lagos, Nigeria</Text>
//         </View>

//         {/* Stats */}
//         <View style={styles.statsRow}>
//           <Stat value="122" label="Followers" />
//           <Stat value="67" label="Following" />
//           <Stat value="37K" label="Likes" />
//         </View>

//         {/* Actions */}
//         <View style={styles.actions}>
//           <TouchableOpacity style={styles.editBtn}>
//             <Text style={styles.editText}>Edit profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.addBtn}>
//             <Text style={styles.addText}>Add friends</Text>
//           </TouchableOpacity>
//         </View>

//         {/* ===== Extra Info ===== */}
//         <View style={styles.infoCard}>
//           <InfoRow icon="eye-outline" label="Profile views" value="1,248" />
//           <InfoRow icon="calendar-outline" label="Joined" value="March 2024" />
//           <InfoRow icon="gift-outline" label="Birthday" value="12 Aug 1998" />
//         </View>
//       </View>

//     </ScrollView>
//   );
// }

// /* ================= COMPONENTS ================= */

// function Stat({ value, label }: { value: string; label: string }) {
//   return (
//     <View style={styles.stat}>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// function InfoRow({
//   icon,
//   label,
//   value,
// }: {
//   icon: any;
//   label: string;
//   value: string;
// }) {
//   return (
//     <View style={styles.infoRow}>
//       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//         <Ionicons name={icon} size={18} color="#6B7280" />
//         <Text style={styles.infoLabel}>{label}</Text>
//       </View>
//       <Text style={styles.infoValue}>{value}</Text>
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F6FA',
//   },

//   cover: {
//     width: '100%',
//     height: 240,
//   },

//   card: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     marginTop: -40,
//     paddingTop: 60,
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//     alignItems: 'center',
//   },

//   avatar: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     position: 'absolute',
//     top: -55,
//     borderWidth: 5,
//     borderColor: '#FFF',
//   },

//   name: {
//     fontSize: 20,
//     fontWeight: '800',
//   },

//   username: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 2,
//   },

//   bio: {
//     marginTop: 10,
//     textAlign: 'center',
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//   },

//   location: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     gap: 4,
//   },

//   locationText: {
//     fontSize: 13,
//     color: '#6B7280',
//   },

//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: 22,
//     paddingHorizontal: 20,
//   },

//   stat: {
//     alignItems: 'center',
//   },

//   statValue: {
//     fontSize: 18,
//     fontWeight: '800',
//   },

//   statLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },

//   actions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 26,
//     width: '100%',
//   },

//   editBtn: {
//     flex: 1,
//     backgroundColor: '#EEF0F6',
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: 'center',
//   },

//   editText: {
//     fontWeight: '700',
//     color: '#374151',
//   },

//   addBtn: {
//     flex: 1,
//     backgroundColor: '#1E1B4B',
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: 'center',
//   },

//   addText: {
//     fontWeight: '700',
//     color: '#FFF',
//   },

//   infoCard: {
//     marginTop: 26,
//     width: '100%',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 18,
//     padding: 14,
//     gap: 12,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   infoLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//   },

//   infoValue: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
// });
import {
  blockUser,
  toggleFollow
} from '@/redux/slices/followSlice';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest
} from '@/redux/slices/friendSlice';
import { getMyProfile } from '@/redux/slices/profileSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function ProfileScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useLocalSearchParams();

  const [localUserId, setLocalUserId] = React.useState<string | null>(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setLocalUserId(parsed._id);
      }
    };
    loadUserFromStorage();
  }, []);

  const { profile, loading } = useSelector(
    (state: RootState) => state.profile
  );

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const { followingMap } =
    useSelector((state: RootState) => state.follow);

  const { searchResults } =
    useSelector((state: RootState) => state.friends);

  useEffect(() => {
    if (userId) {
      dispatch(getMyProfile(userId as string));
    }
  }, [userId]);

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isOwnProfile = profile._id === localUserId;

  const isFollowing =
    followingMap[profile._id] ??
    profile.isFollowing ??
    false;

  const relationship =
    searchResults.find(u => u._id === profile._id)
      ?.relationshipStatus || "none";

  /* ================= ACTIONS ================= */

  const renderActions = () => {

    if (isOwnProfile) return null;

    return (
      <View style={styles.actions}>

        <TouchableOpacity
          style={[
            styles.followBtn,
            { backgroundColor: isFollowing ? '#374151' : '#1D9BF0' }
          ]}
          onPress={() => dispatch(toggleFollow(profile._id))}
        >
          <Text style={styles.whiteText}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>

        {relationship === "pending_sent" && (
          <TouchableOpacity
            style={styles.grayBtn}
            onPress={() =>
              dispatch(cancelFriendRequest(profile._id))
            }
          >
            <Text style={styles.grayText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {relationship === "pending_received" && (
          <>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() =>
                dispatch(acceptFriendRequest(profile._id))
              }
            >
              <Text style={styles.whiteText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.grayBtn}
              onPress={() =>
                dispatch(rejectFriendRequest(profile._id))
              }
            >
              <Text style={styles.grayText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {relationship === "accepted" && (
          <TouchableOpacity
            style={styles.friendBtn}
            onPress={() =>
              dispatch(removeFriend(profile._id))
            }
          >
            <Text style={styles.whiteText}>
              Remove
            </Text>
          </TouchableOpacity>
        )}

        {relationship === "none" && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              dispatch(sendFriendRequest(profile._id))
            }
          >
            <Text style={styles.whiteText}>
              Add Friend
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.blockBtn}
          onPress={() =>
            dispatch(blockUser(profile._id))
          }
        >
          <Text style={styles.whiteText}>Block</Text>
        </TouchableOpacity>

      </View>
    );
  };
const { width } = useWindowDimensions();

const decodeHtml = (html: string) => {
  if (!html) return '';

  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
};

  /* ================= UI ================= */

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Image
        source={{
          uri:
            profile.coverImage ||
            'https://picsum.photos/800/500'
        }}
        style={styles.cover}
      />

      <View style={styles.card}>

        <Image
          source={{
            uri:
              profile.avatar ||
              'https://picsum.photos/200'
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {profile.username}
        </Text>

        <Text style={styles.username}>
          @{profile.atUsername}
        </Text>

        {/* ================= BIO ================= */}
        {profile.bio && (
          <Text style={styles.bio}>
            {profile.bio}
          </Text>
        )}

        {/* ================= COUNTRY تحت البايو ================= */}
        {profile.country && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#6B7280"
            />
            <Text style={styles.locationText}>
              {profile.country}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Stat value={profile.followersCount || 0} label="Followers" />
          <Stat value={profile.followingCount || 0} label="Following" />
          <Stat value={profile.likesCount || 0} label="Likes" />
        </View>

        {renderActions()}

      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ value, label }: any) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cover: {
    width: '100%',
    height: 240,
  },

  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -40,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: 'absolute',
    top: -55,
    borderWidth: 5,
    borderColor: '#FFF',
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
  },

  username: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  bio: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  /* ⭐️ تصميم الدولة */
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  locationText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 22,
    paddingHorizontal: 20,
  },

  stat: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 26,
    width: '100%',
  },

  followBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  addBtn: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  friendBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: '#1D9BF0',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  grayBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  blockBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  whiteText: {
    color: '#FFF',
    fontWeight: '700',
  },

  grayText: {
    color: '#374151',
    fontWeight: '700',
  },

});
