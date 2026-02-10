import Ionicons from '@expo/vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COINS = [
  { id: '1', amount: '100', price: '$0.99' },
  { id: '2', amount: '500', price: '$3.99', popular: true },
  { id: '3', amount: '1000', price: '$6.99' },
];
const BADGES = [
  {
    id: '1',
    title: 'Dragon',
    price: '500 Coins',
    lottie: require('../assets/lottie/Dragon.json'),
  },
  {
    id: '2',
    title: 'Zombie',
    price: '300 Coins',
    lottie: require('../assets/lottie/Zombie.json'),
  },
];

export default function StoreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store</Text>
        <Text style={styles.subtitle}>Upgrade your experience</Text>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* ===== Coins ===== */}
            <Section title="Coins" icon="logo-bitcoin">
              <View style={styles.row}>
                {COINS.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.coinCard,
                      item.popular && styles.popularCard,
                    ]}
                  >
                    {item.popular && (
                      <Text style={styles.popular}>Most Popular</Text>
                    )}
                    <Text style={styles.coinAmount}>{item.amount}</Text>
                    <Text style={styles.coinLabel}>Coins</Text>
                    <Text style={styles.coinPrice}>{item.price}</Text>

                    <TouchableOpacity style={styles.buyButton}>
                      <Text style={styles.buyText}>Buy</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </Section>

            {/* ===== Badges ===== */}
            <Section title="Badges" icon="ribbon">
              <Feature
                icon="shield-checkmark"
                title="VIP Badge"
                desc="Stand out with a special profile badge"
                price="$2.99"
              />
              <Feature
                icon="flame"
                title="Top Creator Badge"
                desc="Highlight your activity and popularity"
                price="$1.99"
              />
            </Section>
              {/* ===== Badges ===== */}
          <Section title="Badges" icon="ribbon">
              <View style={styles.badgeRow}>
                {BADGES.map((item) => (
                  <View key={item.id} style={styles.badgeCard}>
                    <LottieView
                      key={item.id}

                      source={item.lottie}
                      autoPlay
                      loop
                      style={{ width: 70, height: 70 }}
                    />
                    <Text style={styles.badgeTitle}>{item.title}</Text>
                    <Text style={styles.badgePrice}>{item.price}</Text>
                    <BuyButton />
                  </View>
                ))}
              </View>
            </Section>

            {/* ===== Verification ===== */}
            <Section title="Verification" icon="checkmark-circle">
              <Feature
                icon="checkmark-done"
                title="Account Verification"
                desc="Get verified and gain trust"
                price="$4.99"
                highlight
              />
            </Section>

            {/* ===== Premium ===== */}
            <Section title="Premium Features" icon="star">
              <Feature
                icon="color-palette"
                title="Profile Themes"
                desc="Customize your profile appearance"
                price="Free"
              />
              <Feature
                icon="megaphone"
                title="Boost Posts"
                desc="Increase visibility of your tweets"
                price="Coins"
              />
            </Section>
          </>
        }
        data={[]}
        renderItem={null}
      />
    </SafeAreaView>
  );
}

/* ================= Components ================= */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color="#2563EB" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Feature({
  icon,
  title,
  desc,
  price,
  highlight,
}: {
  icon: any;
  title: string;
  desc: string;
  price: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.feature, highlight && styles.highlight]}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>

      <View>
        <Text style={styles.price}>{price}</Text>
        <TouchableOpacity style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
function BuyButton({ small }: { small?: boolean }) {
  return (
    <TouchableOpacity style={[styles.buyBtn, small && styles.buySmall]}>
      <Text style={styles.buyText}>Buy</Text>
    </TouchableOpacity>
  );
}
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  coinCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },

  popularCard: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },

  popular: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 6,
  },

  coinAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
 badgeCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 6,
  },
    badgeTitle: { fontSize: 14, fontWeight: '700' },
  badgePrice: { fontSize: 12, color: '#64748B', marginBottom: 6 },

  buyButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  buyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  highlight: {
    borderWidth: 1,
    borderColor: '#22C55E',
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  price: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  smallBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 6,
  },

  smallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
    buyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },

  buySmall: { paddingHorizontal: 12, paddingVertical: 4 },
});
