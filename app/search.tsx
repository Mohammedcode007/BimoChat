import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['All', 'Users', 'Rooms', 'Tweets', 'Store'];

const MOCK_RESULTS = {
  users: [
    { id: '1', name: 'Ahmed Hassan', username: '@ahmed' },
    { id: '2', name: 'Sara Ali', username: '@sara' },
  ],
  rooms: [
    { id: '1', name: 'Tech Talk', members: 120 },
    { id: '2', name: 'Design Hub', members: 80 },
  ],
  tweets: [
    { id: '1', text: 'هذا أفضل تصميم رأيته اليوم 🔥' },
  ],
  store: [
    { id: '1', name: 'VIP Badge', price: '500 Coins' },
  ],
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const isSearching = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ===== Search Bar ===== */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          placeholder="Search users, rooms, tweets, store…"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>

      {/* ===== Tabs ===== */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== Content ===== */}
      {!isSearching ? (
        <Discover />
      ) : (
        <FlatList
          data={[1]} // dummy
          renderItem={null}
          ListHeaderComponent={
            <>
              {(activeTab === 'All' || activeTab === 'Users') && (
                <Section title="Users">
                  {MOCK_RESULTS.users.map((u) => (
                    <Row key={u.id} title={u.name} subtitle={u.username} />
                  ))}
                </Section>
              )}

              {(activeTab === 'All' || activeTab === 'Rooms') && (
                <Section title="Rooms">
                  {MOCK_RESULTS.rooms.map((r) => (
                    <Row
                      key={r.id}
                      title={r.name}
                      subtitle={`${r.members} members`}
                    />
                  ))}
                </Section>
              )}

              {(activeTab === 'All' || activeTab === 'Tweets') && (
                <Section title="Tweets">
                  {MOCK_RESULTS.tweets.map((t) => (
                    <Text key={t.id} style={styles.tweet}>
                      {t.text}
                    </Text>
                  ))}
                </Section>
              )}

              {(activeTab === 'All' || activeTab === 'Store') && (
                <Section title="Store">
                  {MOCK_RESULTS.store.map((s) => (
                    <Row
                      key={s.id}
                      title={s.name}
                      subtitle={s.price}
                    />
                  ))}
                </Section>
              )}
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ================= Components ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </View>
  );
}

function Discover() {
  return (
    <View style={styles.discover}>
      <Text style={styles.discoverTitle}>Discover</Text>

      <Text style={styles.discoverItem}>🔥 Trending Rooms</Text>
      <Text style={styles.discoverItem}>⭐ Suggested Users</Text>
      <Text style={styles.discoverItem}>🧵 Popular Tweets</Text>
      <Text style={styles.discoverItem}>🛍️ Featured Store Items</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    margin: 16,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0F172A',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },

  activeTab: {
    backgroundColor: '#2563EB',
  },

  tabText: {
    fontSize: 13,
    color: '#475569',
  },

  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0F172A',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  rowSub: {
    fontSize: 12,
    color: '#64748B',
  },

  tweet: {
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  discover: {
    padding: 20,
  },

  discoverTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  discoverItem: {
    fontSize: 14,
    paddingVertical: 8,
    color: '#475569',
  },
});
