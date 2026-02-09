import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ===== Header ===== */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Bimo</Text>
          <Text style={styles.tagline}>Chat • Rooms • Tweets • Friends</Text>
        </View>
 
      </View>

      {/* ===== Stories ===== */}
      <View style={styles.storiesRow}>
        <Story label="أنت" />
        <Story label="Ahmed" />
        <Story label="Mona" />
        <Story label="Khaled" />
        <Story label="Sara" />
      </View>

      {/* ===== Hero Banner ===== */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>مرحبًا بك في Bimo 👋</Text>
        <Text style={styles.heroDesc}>
          منصة متكاملة للتواصل، الغرف، والمحتوى
        </Text>
        <TouchableOpacity style={styles.heroBtn}>
          <Text style={styles.heroBtnText}>ابدأ المحادثة الآن</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Quick Actions ===== */}
      <Section title="الوصول السريع">
        <Grid>
          <Quick icon="chatbubble-ellipses-outline" text="محادثة جديدة" />
          <Quick icon="people-outline" text="غرف دردشة" />
          <Quick icon="newspaper-outline" text="تويتات" />
          <Quick icon="person-add-outline" text="إضافة صديق" />
        </Grid>
      </Section>

      {/* ===== Active Chats ===== */}
      <Section title="محادثاتك">
        <ChatItem name="Ahmed" msg="فينك؟" />
        <ChatItem name="Mona" msg="شوفتي التحديث؟" />
        <ChatItem name="Khaled" msg="تعالى روم النقاش" />
      </Section>

      {/* ===== Live Rooms ===== */}
      <Section title="غرف نشطة الآن 🔥">
        <Room name="دردشة عامة" users="120 مستخدم" />
        <Room name="تعارف" users="78 مستخدم" />
        <Room name="نقاشات حرة" users="54 مستخدم" />
      </Section>

      {/* ===== Tweets Feed ===== */}
      <Section title="آخر التويتات">
        <Tweet user="Ahmed" text="Bimo هيغير مفهوم الشات 🔥" />
        <Tweet user="Sara" text="أخيرًا تطبيق يجمع كل شيء" />
        <Tweet user="Mona" text="الغرف هنا ممتعة جدًا 👌" />
      </Section>

      {/* ===== Discover ===== */}
      <Section title="اكتشف">
        <Discover text="غرف جديدة تناسبك" />
        <Discover text="أصدقاء قد تعرفهم" />
        <Discover text="تويتات رائجة اليوم" />
      </Section>

      {/* ===== Store / Monetization ===== */}
      <Section title="المتجر">
        <StoreItem title="غرف مميزة" desc="محتوى حصري" />
        <StoreItem title="حساب موثّق" desc="شارات ومزايا" />
        <StoreItem title="إزالة الإعلانات" desc="تجربة أفضل" />
      </Section>

      {/* ===== Activity ===== */}
      <Section title="نشاطك">
        <Activity text="Ahmed علّق على تويتك" />
        <Activity text="انضممت لغرفة دردشة" />
        <Activity text="Mona أضافتك كصديق" />
      </Section>

      {/* ===== Footer ===== */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bimo © 2026</Text>
      </View>

    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Grid = ({ children }: any) => (
  <View style={styles.grid}>{children}</View>
);

const Quick = ({ icon, text }: any) => (
  <TouchableOpacity style={styles.quick}>
    <Ionicons name={icon} size={24} color="#1D9BF0" />
    <Text style={styles.quickText}>{text}</Text>
  </TouchableOpacity>
);

const Story = ({ label }: any) => (
  <View style={styles.story}>
    <View style={styles.storyCircle} />
    <Text style={styles.storyText}>{label}</Text>
  </View>
);

const ChatItem = ({ name, msg }: any) => (
  <View style={styles.rowCard}>
    <Ionicons name="chatbubble-outline" size={20} />
    <Text style={styles.rowText}>{name} • {msg}</Text>
  </View>
);

const Room = ({ name, users }: any) => (
  <View style={styles.rowCard}>
    <Ionicons name="radio-outline" size={20} />
    <Text style={styles.rowText}>{name} – {users}</Text>
  </View>
);

const Tweet = ({ user, text }: any) => (
  <View style={styles.tweet}>
    <Text style={{ fontWeight: '700' }}>{user}</Text>
    <Text>{text}</Text>
  </View>
);

const Discover = ({ text }: any) => (
  <View style={styles.discover}>
    <Ionicons name="compass-outline" size={20} />
    <Text style={styles.rowText}>{text}</Text>
  </View>
);

const StoreItem = ({ title, desc }: any) => (
  <View style={styles.store}>
    <Ionicons name="cart-outline" size={22} />
    <View>
      <Text style={{ fontWeight: '700' }}>{title}</Text>
      <Text style={styles.muted}>{desc}</Text>
    </View>
  </View>
);

const Activity = ({ text }: any) => (
  <View style={styles.activity}>
    <Ionicons name="flash-outline" size={18} />
    <Text style={styles.rowText}>{text}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  logo: { fontSize: 26, fontWeight: '900' },
  tagline: { fontSize: 12, color: '#6B7280' },

  storiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },

  story: { alignItems: 'center' },
  storyCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
  },
  storyText: { fontSize: 11, marginTop: 4 },

  hero: {
    margin: 16,
    padding: 18,
    backgroundColor: '#1D9BF0',
    borderRadius: 22,
  },

  heroTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  heroDesc: { color: '#E5E7EB', marginTop: 6 },

  heroBtn: {
    marginTop: 14,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  heroBtnText: { color: '#1D9BF0', fontWeight: '700' },

  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  quick: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },

  quickText: { marginTop: 6, fontWeight: '600' },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },

  rowText: { fontSize: 13 },

  tweet: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },

  discover: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },

  store: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },

  activity: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  muted: { fontSize: 12, color: '#6B7280' },

  footer: { alignItems: 'center', paddingVertical: 30 },
  footerText: { fontSize: 12, color: '#9CA3AF' },
});
