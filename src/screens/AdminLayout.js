import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants';
import { setAdminToken } from '../api/client';

const NAV_ITEMS = [
  { name: 'AdminDashboard', label: 'Dashboard', icon: 'grid-outline' },
  { name: 'AdminOrders', label: 'Orders', icon: 'receipt-outline' },
  { name: 'AdminProducts', label: 'Products', icon: 'cube-outline' },
  { name: 'AdminCollections', label: 'Collections', icon: 'folder-outline' },
];

export default function AdminLayout({ children, title }) {
  const navigation = useNavigation();
  const route = useRoute();

  const handleLogout = () => {
    setAdminToken(null);
    navigation.replace('AdminLogin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>Adiyogi Admin</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.champagne} />
        </TouchableOpacity>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = route.name === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => navigation.navigate(item.name)}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={active ? COLORS.white : COLORS.gray400}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.navyDark, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: {},
  brand: {
    fontFamily: FONTS.display, fontSize: 11, fontWeight: '700',
    color: COLORS.champagne, letterSpacing: 1, textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONTS.display, fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 1,
  },
  logoutBtn: { padding: 6 },
  nav: {
    flexDirection: 'row', backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, gap: 4,
  },
  navItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: 'transparent',
  },
  navItemActive: { backgroundColor: COLORS.champagne },
  navLabel: { fontSize: 11, fontWeight: '600', color: COLORS.gray400 },
  navLabelActive: { color: COLORS.white },
  content: { flex: 1 },
});
