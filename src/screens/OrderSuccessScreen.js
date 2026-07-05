import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, SPACING } from '../constants';

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order, autoSent, pdfUrl } = route.params ?? {};

  const [step, setStep] = useState(0);
  const heroScale = useRef(new Animated.Value(0.3)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  // Staggered reveal animation
  useEffect(() => {
    if (!order) return;
    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1400);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [heroScale, heroOpacity, order]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.noOrderWrap}>
          <Text style={styles.noOrderText}>No order data found.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <Text style={styles.noOrderLink}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const waConnected = autoSent?.waReady;
  const adminSent = autoSent?.admin;
  const custSent = autoSent?.customer;

  const statusSteps = [
    { icon: '✅', label: 'Order confirmed & saved', done: step >= 1 },
    { icon: '📄', label: 'Invoice PDF generated', done: step >= 2 },
    {
      icon: '📱',
      label: waConnected ? 'WhatsApp sent automatically' : 'WhatsApp links ready',
      done: step >= 3,
    },
  ];

  const openPdf = async () => {
    if (!pdfUrl) return;
    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch {
      Linking.openURL(pdfUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[COLORS.navyDark, COLORS.navy, '#2A5298']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative dots */}
      <View style={styles.dots} pointerEvents="none">
        {DOTS.map((d, i) => (
          <View key={i} style={[styles.dot, { left: d.x, top: d.y, backgroundColor: d.color }]} />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── CELEBRATION HEADER ── */}
        <View style={styles.celebrationWrap}>
          <Animated.View style={{ transform: [{ scale: heroScale }], opacity: heroOpacity }}>
            <View style={styles.celebrationBadge}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </View>
          </Animated.View>
          <Text style={styles.celebrationTitle}>Order Placed!</Text>
          <Text style={styles.celebrationSub}>
            Thank you for choosing Adiyogi International 🦅
          </Text>
          <Text style={styles.orderId}>
            Order{' '}
            <Text style={styles.orderIdBold}>{order.orderId}</Text>
          </Text>
        </View>

        {/* ── PROGRESS STEPS ── */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>⚡ Processing Automatically</Text>
          {statusSteps.map((s, i) => (
            <View key={i} style={[styles.progressStep, !s.done && styles.progressStepDim]}>
              <View style={[styles.progressIcon, s.done && styles.progressIconDone]}>
                <Text style={styles.progressIconText}>{s.done ? '✓' : s.icon}</Text>
              </View>
              <Text style={[styles.progressLabel, !s.done && styles.progressLabelDim]}>
                {s.label}
              </Text>
              {s.done && <Text style={styles.progressDone}>✓ Done</Text>}
            </View>
          ))}
        </View>

        {/* ── MAIN CARD ── */}
        <View style={styles.mainCard}>
          {/* PDF Banner */}
          {pdfUrl ? (
            <View style={styles.pdfBanner}>
              <View style={styles.pdfIcon}>
                <Text style={{ fontSize: 22 }}>📄</Text>
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfTitle}>Invoice PDF Ready</Text>
                <Text style={styles.pdfSub}>Tap to open or download</Text>
              </View>
              <TouchableOpacity style={styles.pdfBtn} onPress={openPdf}>
                <Ionicons name="download-outline" size={16} color={COLORS.champagneDark} />
                <Text style={styles.pdfBtnText}>Open PDF</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* WhatsApp status */}
          <View
            style={[
              styles.waCard,
              waConnected ? styles.waCardGreen : styles.waCardBlue,
            ]}
          >
            <View style={styles.waCardHeader}>
              <View style={[styles.waIcon, waConnected ? styles.waIconGreen : styles.waIconBlue]}>
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.waTitle, waConnected ? { color: '#166534' } : { color: '#1e40af' }]}>
                  {waConnected ? '✅ WhatsApp Sent Automatically' : '📱 WhatsApp Notifications'}
                </Text>
                <Text style={[styles.waSub, waConnected ? { color: '#15803d' } : { color: '#1d4ed8' }]}>
                  {waConnected
                    ? 'Order details & PDF sent to admin and your number'
                    : 'Connect WhatsApp in Admin Panel for automatic notifications'}
                </Text>
              </View>
            </View>
            {waConnected && (
              <View style={styles.waSentRow}>
                <View style={styles.waSentItem}>
                  <Text style={styles.waSentLabel}>Admin Notified</Text>
                  <Text style={[styles.waSentStatus, adminSent ? styles.sentGreen : styles.sentOrange]}>
                    {adminSent ? '✓ Sent' : '⚠ Failed'}
                  </Text>
                </View>
                <View style={styles.waSentItem}>
                  <Text style={styles.waSentLabel}>Your Copy</Text>
                  <Text style={[styles.waSentStatus, custSent ? styles.sentGreen : styles.sentOrange]}>
                    {custSent ? '✓ Sent' : '⚠ Failed'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Order summary */}
          <View style={styles.orderSummary}>
            <View style={styles.orderSummaryHeader}>
              <Text style={styles.orderIdLabel}>ORDER {order.orderId}</Text>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedBadgeText}>✓ Confirmed</Text>
              </View>
            </View>
            <View style={styles.orderGrid}>
              <View>
                <Text style={styles.orderGridLabel}>Customer</Text>
                <Text style={styles.orderGridValue}>{order.customer?.name}</Text>
              </View>
              <View>
                <Text style={styles.orderGridLabel}>WhatsApp</Text>
                <Text style={[styles.orderGridValue, { color: '#16a34a' }]}>
                  {order.customer?.whatsapp}
                </Text>
              </View>
              <View>
                <Text style={styles.orderGridLabel}>Payment</Text>
                <Text style={styles.orderGridValue}>{order.paymentMode}</Text>
              </View>
              <View>
                <Text style={styles.orderGridLabel}>Total</Text>
                <Text style={[styles.orderGridValue, { color: COLORS.navy, fontSize: 16 }]}>
                  ₹{order.total?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <Text style={styles.itemsTitle}>Items Ordered</Text>
          <View style={styles.items}>
            {order.items?.map((item, i) => (
              <View
                key={i}
                style={[styles.orderItem, i < (order.items.length - 1) && styles.orderItemBorder]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.orderItemMeta}>
                    {item.itemCode} · {item.quantity} PAC × ₹{item.price}
                  </Text>
                </View>
                <Text style={styles.orderItemTotal}>
                  ₹{formatCurrency(item.amount ?? item.price * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>₹{order.total?.toFixed(2)}</Text>
            </View>
          </View>

          {/* Continue shopping */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.continueBtnText}>🛍️ Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Decorative dot positions
const DOTS = [
  { x: '5%', y: '8%', color: COLORS.champagne },
  { x: '18%', y: '15%', color: '#fff' },
  { x: '30%', y: '5%', color: '#86efac' },
  { x: '60%', y: '12%', color: COLORS.champagne },
  { x: '75%', y: '6%', color: '#fff' },
  { x: '88%', y: '20%', color: '#86efac' },
  { x: '12%', y: '30%', color: '#6B9BD2' },
  { x: '92%', y: '35%', color: COLORS.champagne },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40, gap: 16 },

  noOrderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noOrderText: { color: COLORS.white, fontSize: 15 },
  noOrderLink: { color: COLORS.champagne, fontSize: 14, fontWeight: '600' },

  // Decorative dots
  dots: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dot: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4,
    opacity: 0.4,
  },

  // Celebration
  celebrationWrap: { alignItems: 'center', paddingTop: 12, gap: 8 },
  celebrationBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.champagne,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.champagne,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  celebrationEmoji: { fontSize: 48 },
  celebrationTitle: {
    fontFamily: FONTS.display,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
  },
  celebrationSub: { fontSize: 14, color: COLORS.champagne, textAlign: 'center' },
  orderId: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  orderIdBold: {
    fontFamily: FONTS.mono,
    fontWeight: 'bold',
    color: COLORS.champagne,
  },

  // Progress
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 10,
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressStepDim: { opacity: 0.3 },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressIconDone: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  progressIconText: { fontSize: 14 },
  progressLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.white },
  progressLabelDim: { color: 'rgba(255,255,255,0.5)' },
  progressDone: { fontSize: 11, fontWeight: 'bold', color: '#4ade80' },

  // Main card
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // PDF banner
  pdfBanner: {
    backgroundColor: COLORS.champagne,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  pdfIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfInfo: { flex: 1 },
  pdfTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
  pdfSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pdfBtnText: { fontSize: 12, fontWeight: 'bold', color: COLORS.champagneDark },

  // WhatsApp card
  waCard: {
    margin: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    gap: 12,
  },
  waCardGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  waCardBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  waCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  waIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  waIconGreen: { backgroundColor: '#22c55e' },
  waIconBlue: { backgroundColor: '#3b82f6' },
  waTitle: { fontSize: 13, fontWeight: 'bold', lineHeight: 18 },
  waSub: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  waSentRow: { flexDirection: 'row', gap: 10 },
  waSentItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  waSentLabel: { fontSize: 10, color: COLORS.gray400, marginBottom: 4 },
  waSentStatus: { fontSize: 13, fontWeight: 'bold' },
  sentGreen: { color: '#16a34a' },
  sentOrange: { color: '#ea580c' },

  // Order summary
  orderSummary: {
    marginHorizontal: 16,
    backgroundColor: COLORS.navyBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,58,107,0.12)',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.navyLight,
    textTransform: 'uppercase',
  },
  confirmedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confirmedBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#15803d' },
  orderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  orderGridLabel: { fontSize: 10, color: COLORS.gray400, marginBottom: 2 },
  orderGridValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },

  // Items list
  itemsTitle: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.navy,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  items: { paddingHorizontal: 16, marginBottom: 16 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 8,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  orderItemName: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
  orderItemMeta: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  orderItemTotal: { fontSize: 13, fontWeight: 'bold', color: COLORS.navy, flexShrink: 0 },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 2,
  },
  grandTotalLabel: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  grandTotalValue: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
  },

  // Continue button
  continueBtn: {
    margin: 16,
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
