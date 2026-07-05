import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, SPACING } from '../constants';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const { cart, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/products/${productId}`)
      .then((r) => { if (!cancelled) { setProduct(r.data); setSelectedImg(0); } })
      .catch(() => { if (!cancelled) navigation.goBack(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.champagne} />
      </SafeAreaView>
    );
  }

  if (!product) return null;

  const salesPrice = product.salesPrice ?? product.price ?? 0;
  const conversion = product.unitConversionRate ?? 10;
  const images = product.images ?? [];
  const cartItem = cart.find((i) => i.productId === product._id);
  const inCart = !!cartItem;

  const handleAddToCart = () => addToCart(product, 1);
  const handleBuyNow = () => {
    if (!inCart) addToCart(product, 1);
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CartTab')}
          style={styles.cartBtn}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.navy} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── BREADCRUMB ── */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <Text style={styles.breadcrumbLink}>Home</Text>
          </TouchableOpacity>
          {product.collections?.length > 0 && (
            <>
              <Text style={styles.breadcrumbSep}> › </Text>
              <Text style={styles.breadcrumbLink}>{product.collections[0].name}</Text>
            </>
          )}
          <Text style={styles.breadcrumbSep}> › </Text>
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{product.name}</Text>
        </View>

        {/* ── IMAGE GALLERY ── */}
        <View style={styles.gallerySection}>
          <TouchableOpacity
            style={styles.mainImageWrap}
            onPress={() => images.length > 0 && setZoomVisible(true)}
            activeOpacity={images.length > 0 ? 0.9 : 1}
          >
            {images.length > 0 ? (
              <Image
                source={{ uri: images[selectedImg] }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cube-outline" size={80} color={COLORS.gray200} />
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}

            {/* Watermark */}
            <View style={styles.watermarkWrap} pointerEvents="none">
              <Text style={styles.watermark}>7975198804</Text>
            </View>

            {images.length > 0 && (
              <View style={styles.zoomHint}>
                <Ionicons name="search" size={12} color="#fff" />
                <Text style={styles.zoomHintText}>Tap to zoom</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Thumbnail row */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnails}
              contentContainerStyle={styles.thumbnailsContent}
            >
              {images.map((img, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImg(i)}
                  style={[styles.thumb, selectedImg === i && styles.thumbActive]}
                >
                  <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── PRODUCT INFO ── */}
        <View style={styles.infoSection}>
          {/* Collection badges */}
          {product.collections?.length > 0 && (
            <View style={styles.badges}>
              {product.collections.map((c) => (
                <View key={c._id} style={styles.badge}>
                  <Text style={styles.badgeText}>{c.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Code + packing chips */}
          <View style={styles.chips}>
            {product.itemCode && (
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Item Code</Text>
                <Text style={styles.chipValue}>{product.itemCode}</Text>
              </View>
            )}
            {product.hsnCode && (
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>HSN Code</Text>
                <Text style={styles.chipValue}>{product.hsnCode}</Text>
              </View>
            )}
            {product.standardPacking && (
              <View style={[styles.chip, styles.chipGold]}>
                <Text style={[styles.chipLabel, { color: COLORS.champagneDark }]}>
                  Standard Packing
                </Text>
                <Text style={[styles.chipValue, { color: COLORS.champagneDark }]}>
                  {product.standardPacking}
                </Text>
              </View>
            )}
          </View>

          {/* Product name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price block */}
          <View style={styles.priceBlock}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{formatCurrency(salesPrice)}</Text>
            </View>
            {product.gstRate ? (
              <Text style={styles.gstNote}>
                <Text style={styles.gstDot}>● </Text>
                GST {product.gstRate}% included
              </Text>
            ) : null}
          </View>

          {/* Unit info */}
          <View style={styles.unitBlock}>
            <Text style={styles.unitBlockTitle}>📦 Unit Information</Text>
            <View style={styles.unitCards}>
              <View style={styles.unitCard}>
                <Text style={styles.unitCardLabel}>Base Unit</Text>
                <Text style={styles.unitCardValue}>PAC</Text>
                <Text style={styles.unitCardSub}>Packs</Text>
              </View>
              <View style={styles.unitCard}>
                <Text style={styles.unitCardLabel}>1 Pack Contains</Text>
                <Text style={[styles.unitCardValue, { color: COLORS.champagne }]}>
                  {conversion}
                </Text>
                <Text style={styles.unitCardSub}>NOS (Numbers)</Text>
              </View>
            </View>
          </View>

          {/* Add to cart / stepper */}
          <View style={styles.cartActions}>
            {inCart ? (
              <>
                <View style={styles.quantityStepper}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product._id, cartItem.quantity - 1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.qtyCenter}>
                    <Text style={styles.qtyCount}>{cartItem.quantity}</Text>
                    <Text style={styles.qtySub}>{cartItem.quantity * conversion} NOS</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product._id, cartItem.quantity + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal:</Text>
                  <Text style={styles.subtotalValue}>
                    ₹{formatCurrency(salesPrice * cartItem.quantity)}
                  </Text>
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                <Ionicons name="cart-outline" size={20} color={COLORS.blue} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
              <Ionicons name="flash-outline" size={20} color={COLORS.champagneDark} />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descBlock}>
              <Text style={styles.descTitle}>Product Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* ── ZOOM MODAL ── */}
      <Modal
        visible={zoomVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomVisible(false)}
      >
        <View style={styles.zoomOverlay}>
          <TouchableOpacity
            style={styles.zoomClose}
            onPress={() => setZoomVisible(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImg}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: width }}
                resizeMode="contain"
              />
            )}
            onMomentumScrollEnd={(e) => {
              setSelectedImg(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
          />
          {images.length > 1 && (
            <View style={styles.zoomDots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.zoomDot, i === selectedImg && styles.zoomDotActive]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { flex: 1, backgroundColor: COLORS.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    fontFamily: FONTS.display,
  },
  cartBtn: { position: 'relative', padding: 6 },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.champagne,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  breadcrumbLink: { fontSize: 12, color: COLORS.navy, fontWeight: '500' },
  breadcrumbSep: { fontSize: 12, color: COLORS.gray400 },
  breadcrumbCurrent: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '700',
    flex: 1,
  },

  // Gallery
  gallerySection: {
    backgroundColor: COLORS.gray50,
    paddingBottom: 12,
  },
  mainImageWrap: {
    width,
    height: width,
    backgroundColor: COLORS.white,
    position: 'relative',
    overflow: 'hidden',
  },
  mainImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noImageText: { fontSize: 13, color: COLORS.gray300 },
  watermarkWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: {
    transform: [{ rotate: '-35deg' }],
    fontSize: 40,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: 'rgba(15,32,64,0.12)',
    letterSpacing: 2,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  zoomHintText: { color: '#fff', fontSize: 10 },
  thumbnails: { marginTop: 10 },
  thumbnailsContent: { paddingHorizontal: 16, gap: 8 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  thumbActive: { borderColor: COLORS.champagne },
  thumbImage: { width: '100%', height: '100%' },

  // Info
  infoSection: {
    padding: SPACING.lg,
    gap: 16,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    backgroundColor: COLORS.navyBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 8,
    minWidth: 90,
  },
  chipGold: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#f0d890',
  },
  chipLabel: { fontSize: 10, color: COLORS.gray400, fontWeight: '600', marginBottom: 2 },
  chipValue: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gray700,
  },
  productName: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.navy,
    lineHeight: 32,
  },
  priceBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  price: {
    fontFamily: FONTS.display,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.navy,
  },
  gstNote: { fontSize: 12, color: COLORS.gray400, marginTop: 6 },
  gstDot: { color: COLORS.green },

  // Unit
  unitBlock: {
    backgroundColor: COLORS.navyBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(27,58,107,0.15)',
  },
  unitBlockTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 10,
  },
  unitCards: { flexDirection: 'row', gap: 10 },
  unitCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  unitCardLabel: { fontSize: 10, color: COLORS.gray400, marginBottom: 4 },
  unitCardValue: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  unitCardSub: { fontSize: 10, color: COLORS.gray400, marginTop: 2 },

  // Cart actions
  cartActions: { gap: 10 },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 14,
  },
  addToCartText: { fontSize: 15, fontWeight: 'bold', color: COLORS.blue },
  buyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.champagne,
    borderRadius: 16,
    paddingVertical: 14,
  },
  buyNowText: { fontSize: 15, fontWeight: 'bold', color: COLORS.champagneDark },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 16,
    overflow: 'hidden',
  },
  qtyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold', color: COLORS.blue },
  qtyCenter: { alignItems: 'center', paddingHorizontal: 16 },
  qtyCount: { fontSize: 22, fontWeight: 'bold', color: COLORS.blue },
  qtySub: { fontSize: 11, color: COLORS.gray400 },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.navyBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  subtotalLabel: { fontSize: 13, color: COLORS.gray600 },
  subtotalValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.navy },

  // Description
  descBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  descTitle: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
  },
  descText: { fontSize: 14, color: COLORS.gray600, lineHeight: 22 },

  // Zoom modal
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  zoomClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  zoomDots: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  zoomDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  zoomDotActive: { backgroundColor: COLORS.champagne },
});
