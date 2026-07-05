import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, SPACING } from '../constants';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cart, cartTotal, clearCart } = useCart();
  const scrollRef = useRef(null);

  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', email: '',
    address: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name is required (min 2 characters)';
    }
    if (!form.whatsapp.match(/^\d{10}$/)) {
      errs.whatsapp = 'Enter a valid 10-digit WhatsApp number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    return errs;
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items before placing an order.');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Show first error
      Alert.alert('Validation Error', Object.values(errs)[0]);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        customer: { ...form },
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMode: 'Credit',
      });
      clearCart();
      navigation.replace('OrderSuccess', {
        order: data.order,
        autoSent: data.autoSent,
        pdfUrl: data.pdfUrl,
      });
    } catch (err) {
      Alert.alert(
        'Order Failed',
        err.response?.data?.message ?? 'Failed to place order. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── SECTION 1: Customer Info ── */}
          <FormSection title="Dealer Information" step="1">
            <Field
              label="Full Name *"
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              error={errors.name}
              placeholder="John Doe"
              autoCapitalize="words"
            />
            <Field
              label="Dealer Code (optional)"
              value={form.phone}
              onChangeText={(v) => setField('phone', v)}
              placeholder="e.g. D-1234"
              keyboardType="default"
            />
            <Field
              label="WhatsApp Number *"
              hint="Invoice PDF will be sent here automatically"
              value={form.whatsapp}
              onChangeText={(v) => setField('whatsapp', v.replace(/\D/g, '').slice(0, 10))}
              error={errors.whatsapp}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              icon="logo-whatsapp"
              iconColor="#25D366"
            />
            <Field
              label="Email (optional)"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              error={errors.email}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormSection>

          {/* ── ORDER SUMMARY ── */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryItems}>
              {cart.map((item) => (
                <View key={item.productId} style={styles.summaryItem}>
                  <View style={styles.summaryItemImg}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.summaryImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="cube-outline" size={18} color={COLORS.gray300} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.summaryItemQty}>
                      {item.quantity} PAC × ₹{formatCurrency(item.price)}
                    </Text>
                  </View>
                  <Text style={styles.summaryItemTotal}>
                    ₹{formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{formatCurrency(cartTotal)}</Text>
            </View>
          </View>

          {/* ── PLACE ORDER ── */}
          <TouchableOpacity
            style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
            )}
            <Text style={styles.placeOrderText}>
              {loading ? 'Placing Order...' : 'Place Order via WhatsApp'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.placeOrderHint}>
            Invoice PDF auto-sent to your WhatsApp number
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────
function FormSection({ title, step, children }) {
  return (
    <View style={styles.formSection}>
      <View style={styles.formSectionHeader}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepNumber}>{step}</Text>
        </View>
        <Text style={styles.formSectionTitle}>{title}</Text>
      </View>
      <View style={styles.formFields}>{children}</View>
    </View>
  );
}

function Field({
  label, hint, value, onChangeText, error, placeholder,
  keyboardType, autoCapitalize, maxLength, multiline,
  numberOfLines, icon, iconColor,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError, multiline && styles.inputMulti]}>
        <TextInput
          style={[styles.input, multiline && styles.inputTextMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray300}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {icon && (
          <Ionicons name={icon} size={18} color={iconColor ?? COLORS.gray400} style={styles.fieldIcon} />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.navyDark,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },

  scrollContent: { padding: SPACING.lg, gap: 16, paddingBottom: 40 },

  // Form section
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.navyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  formSectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  formFields: { gap: 14 },

  // Field
  fieldWrap: {},
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 46,
  },
  inputMulti: { height: undefined, alignItems: 'flex-start', paddingVertical: 10 },
  inputError: { borderColor: COLORS.red },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray700,
    paddingVertical: 0,
  },
  inputTextMulti: { minHeight: 70 },
  fieldIcon: { marginLeft: 8 },
  errorText: { fontSize: 11, color: COLORS.red, marginTop: 4 },
  hintText: { fontSize: 11, color: COLORS.green, marginTop: 4 },

  // Order summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  summaryItems: { gap: 10 },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryItemImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  summaryImg: { width: '100%', height: '100%' },
  summaryItemName: { fontSize: 12, fontWeight: '600', color: COLORS.gray700 },
  summaryItemQty: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  summaryItemTotal: { fontSize: 12, fontWeight: '700', color: COLORS.navy },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 10,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  totalValue: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.navy,
  },

  // Place order
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.champagne,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: COLORS.champagne,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnDisabled: { opacity: 0.6 },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  placeOrderHint: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
  },

});
