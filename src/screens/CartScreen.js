import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>
            Browse our products and add items to get started.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          My Cart{' '}
          <Text style={styles.headerCount}>({cartCount} items)</Text>
        </Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.red} />
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
            onRemove={() => removeFromCart(item.productId)}
          />
        )}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cartCount} items)</Text>
              <Text style={styles.summaryValue}>₹{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{formatCurrency(cartTotal)}</Text>
            </View>
          </View>
        }
      />

      {/* Checkout button */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutTotal}>
          <Text style={styles.checkoutTotalLabel}>Total</Text>
          <Text style={styles.checkoutTotalValue}>₹{formatCurrency(cartTotal)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.cartItem}>
      {/* Image */}
      <View style={styles.cartItemImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cartImg} resizeMode="cover" />
        ) : (
          <View style={styles.cartImgPlaceholder}>
            <Ionicons name="cube-outline" size={24} color={COLORS.gray300} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemCode}>{item.itemCode}</Text>
        <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{formatCurrency(item.price)} / PAC</Text>

        <View style={styles.cartItemFooter}>
          {/* Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={onDecrease}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepCount}>{item.quantity}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={onIncrease}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Line total */}
          <Text style={styles.lineTotal}>
            ₹{formatCurrency(item.price * item.quantity)}
          </Text>
        </View>
      </View>

      {/* Remove button */}
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Ionicons name="close-circle" size={20} color={COLORS.gray300} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.navyDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.5)',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  clearBtnText: { fontSize: 12, color: COLORS.red, fontWeight: '600' },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.bodyText,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  browseBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  // List
  list: { padding: SPACING.lg, gap: 12, paddingBottom: 120 },

  // Cart item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 12,
    ...SHADOWS.sm,
    gap: 10,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.gray50,
    flexShrink: 0,
  },
  cartImg: { width: '100%', height: '100%' },
  cartImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemInfo: { flex: 1, gap: 3 },
  cartItemCode: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.gray400,
    textTransform: 'uppercase',
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
    lineHeight: 18,
  },
  cartItemPrice: { fontSize: 12, color: COLORS.gray400 },
  cartItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.blue },
  stepCount: {
    width: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  removeBtn: { padding: 4 },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 4,
    ...SHADOWS.sm,
  },
  summaryTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.bodyText,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 13, color: COLORS.gray500 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 8,
  },
  totalLabel: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  totalValue: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.navy,
  },

  // Checkout bar
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutTotal: {},
  checkoutTotalLabel: { fontSize: 11, color: COLORS.gray400 },
  checkoutTotalValue: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.navy,
  },
  checkoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.champagne,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
