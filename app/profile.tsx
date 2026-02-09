import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ===== Cover ===== */}
      <Image
        source={{ uri: 'https://picsum.photos/800/500' }}
        style={styles.cover}
      />

      {/* ===== Card ===== */}
      <View style={styles.card}>
        {/* Avatar */}
        <Image
          source={{ uri: 'https://picsum.photos/200' }}
          style={styles.avatar}
        />

        {/* Name */}
        <Text style={styles.name}>Melissa Peters</Text>

        {/* Username / ID */}
        <Text style={styles.username}>@melissa_peters · ID: 458921</Text>

        {/* Bio */}
        <Text style={styles.bio}>
          Interior designer ✨  
          أحب البساطة والتصميم العصري وأشارك أفكاري هنا.
        </Text>

        {/* Location */}
        <View style={styles.location}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.locationText}>Lagos, Nigeria</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat value="122" label="Followers" />
          <Stat value="67" label="Following" />
          <Stat value="37K" label="Likes" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addText}>Add friends</Text>
          </TouchableOpacity>
        </View>

        {/* ===== Extra Info ===== */}
        <View style={styles.infoCard}>
          <InfoRow icon="eye-outline" label="Profile views" value="1,248" />
          <InfoRow icon="calendar-outline" label="Joined" value="March 2024" />
          <InfoRow icon="gift-outline" label="Birthday" value="12 Aug 1998" />
        </View>
      </View>

    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={18} color="#6B7280" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
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

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },

  locationText: {
    fontSize: 13,
    color: '#6B7280',
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
    gap: 12,
    marginTop: 26,
    width: '100%',
  },

  editBtn: {
    flex: 1,
    backgroundColor: '#EEF0F6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  editText: {
    fontWeight: '700',
    color: '#374151',
  },

  addBtn: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  addText: {
    fontWeight: '700',
    color: '#FFF',
  },

  infoCard: {
    marginTop: 26,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
