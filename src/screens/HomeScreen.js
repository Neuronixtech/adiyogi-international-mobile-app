import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Linking,
  Dimensions, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import NewArrivalsCarousel from '../components/NewArrivalsCarousel';
import { COLORS, FONTS, SPACING, ITEMS_PER_PAGE } from '../constants';
import { useCart } from '../context/CartContext';
import { cachedGet, clearCachedPrefix } from '../api/cachedApi';

const { width } = Dimensions.get('window');
const PHONE_NUMBERS = ['7975198804', '8123458984', '8722812222'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { cartCount } = useCart();

  const [collections, setCollections] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState('all');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Load collections once
  useEffect(() => {
    cachedGet('/collections')
      .then((data) => setCollections(data))
      .catch(() => {});
  }, []);

  // Load new arrivals when collections are ready
  useEffect(() => {
    if (!collections.length) return;
    const col = collections.find((c) => c.slug === 'new-arrivals');
    if (!col) return;
    cachedGet('/products', { limit: 10, page: 1, collection: col._id })
      .then((data) => setNewArrivals(data.products?.filter((p) => p.images?.length > 0) ?? []))
      .catch(() => {});
  }, [collections]);

  // Load products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeCollection !== 'all') params.collection = activeCollection;
      const data = await cachedGet('/products', params, { skipCache: !!debouncedSearch });
      setProducts(data.products ?? []);
      setTotalProducts(data.total ?? 0);
      setTotalPages(data.pages ?? 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, activeCollection]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    clearCachedPrefix('/products');
    await fetchProducts();
    setRefreshing(false);
  };

  const handleCollectionFilter = (id) => {
    setActiveCollection(id);
    setCurrentPage(1);
  };

  const activeColName =
    activeCollection === 'all'
      ? 'All Products'
      : collections.find((c) => c._id === activeCollection)?.name ?? 'Products';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Sticky header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerRow}>
            <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <View>
              <Text style={styles.headerBrand}>Adiyogi International</Text>
              <Text style={styles.headerSub}>Bhoomi Agrotech · Vijaypur</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('CartTab')}
        >
          <Ionicons name="cart-outline" size={26} color={COLORS.champagne} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.champagne}
            colors={[COLORS.champagne]}
          />
        }
      >
        {/* ── HERO ── */}
        <LinearGradient
          colors={['#0F2040', '#1B3A6B', '#2A5298']}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Image source={require('../../assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />
            <Text style={styles.heroBadgeBrand}>Adiyogi International</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroBadgeSub}>Bhoomi Agrotech · Vijaypur</Text>
            <View style={styles.heroPhones}>
              {PHONE_NUMBERS.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => Linking.openURL(`tel:${num}`)}
                  style={styles.heroPhone}
                >
                  <Ionicons name="call-outline" size={12} color={COLORS.champagne} />
                  <Text style={styles.heroPhoneText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.heroHeadline}>
            Come Experience{'\n'}
            <Text style={styles.heroHeadlineGold}>The Quality</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Premium products, exceptional service. Explore our curated
            collections and experience the difference.
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity style={styles.ctaPrimary}>
              <Text style={styles.ctaPrimaryText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary}>
              <Text style={styles.ctaSecondaryText}>View Collections</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── NEW ARRIVALS ── */}
        {newArrivals.length > 0 && (
          <NewArrivalsCarousel
            items={newArrivals}
            onPressItem={(id) =>
              navigation.navigate('ProductDetail', { productId: id })
            }
          />
        )}

        {/* ── PRODUCTS ── */}
        <View style={[styles.section, { backgroundColor: COLORS.white }]}>
          {/* Section title + count */}
          <View style={styles.productsHeader}>
            <View>
              <Text style={styles.sectionLabel}>{activeColName}</Text>
              <Text style={styles.sectionTitle}>
                Our Products{' '}
                {totalProducts > 0 && (
                  <Text style={styles.productCount}>({totalProducts})</Text>
                )}
              </Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray400} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, codes..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>

          {/* Collection filter chips */}
          {collections.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContent}
            >
              {[{ _id: 'all', name: 'All Products' }, ...collections].map((col) => (
                <TouchableOpacity
                  key={col._id}
                  style={[
                    styles.chip,
                    activeCollection === col._id && styles.chipActive,
                  ]}
                  onPress={() => handleCollectionFilter(col._id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeCollection === col._id && styles.chipTextActive,
                    ]}
                  >
                    {col.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Products grid */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={COLORS.champagne} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onPress={() =>
                    navigation.navigate('ProductDetail', { productId: product._id })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyDesc}>
                Try a different search or browse all collections
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => { setSearch(''); setActiveCollection('all'); }}
              >
                <Text style={styles.emptyBtnText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? COLORS.gray300 : COLORS.navy} />
              </TouchableOpacity>

              {buildPageNumbers(currentPage, totalPages).map((page, i) =>
                page === '...' ? (
                  <Text key={`ellipsis-${i}`} style={styles.ellipsis}>…</Text>
                ) : (
                  <TouchableOpacity
                    key={page}
                    style={[styles.pageBtn, currentPage === page && styles.pageBtnActive]}
                    onPress={() => setCurrentPage(page)}
                  >
                    <Text
                      style={[
                        styles.pageBtnText,
                        currentPage === page && styles.pageBtnTextActive,
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                ),
              )}

              <TouchableOpacity
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? COLORS.gray300 : COLORS.navy} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── COLLECTIONS GRID ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Browse By</Text>
          <Text style={styles.sectionTitle}>Our Collections</Text>
          <View style={styles.collectionsGrid}>
            <CollectionTile
              name="All Products"
              active={activeCollection === 'all'}
              onPress={() => navigation.navigate('Products', { collectionId: null, collectionName: 'All Products' })}
            />
            {collections.map((col) => (
              <CollectionTile
                key={col._id}
                name={col.name}
                image={col.image}
                active={activeCollection === col._id}
                onPress={() => navigation.navigate('Products', { collectionId: col._id, collectionName: col.name })}
              />
            ))}
          </View>
        </View>

        {/* ── HOW TO ORDER ── */}
        <View style={[styles.section, { backgroundColor: COLORS.ivory }]}>
          <Text style={styles.sectionLabel}>Simple & Easy</Text>
          <Text style={styles.sectionTitle}>How to Place an Order</Text>
          <View style={styles.howToGrid}>
            {HOW_TO_STEPS.map((s) => (
              <View key={s.step} style={styles.howToCard}>
                <Text style={styles.howToIcon}>{s.icon}</Text>
                <Text style={styles.howToStep}>STEP {s.step}</Text>
                <Text style={styles.howToTitle}>{s.title}</Text>
                <Text style={styles.howToDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FOOTER ── */}
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.footer}>
          <View style={styles.footerGrid}>
            {/* Brand column */}
            <View style={styles.footerCol}>
              <Text style={styles.footerBrand}>Adiyogi International</Text>
              <Text style={styles.footerDesc}>
                Come Experience the Quality. Premium products with a commitment to
                excellence and customer satisfaction.
              </Text>
            </View>

            {/* Quick Links column */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Quick Links</Text>
              {[
                { label: 'Home' },
                { label: 'Products' },
                { label: 'Collections' },
                { label: 'How to Order' },
              ].map((link) => (
                <View key={link.label} style={styles.footerLink}>
                  <Text style={styles.footerLinkArrow}>›</Text>
                  <Text style={styles.footerLinkText}>{link.label}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminLogin')}
                style={[styles.footerLink, { marginTop: 8 }]}
              >
                <Ionicons name="shield-outline" size={14} color={COLORS.champagne} />
                <Text style={[styles.footerLinkText, { color: COLORS.champagne }]}>Admin Panel</Text>
              </TouchableOpacity>
            </View>

            {/* Contact column */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Contact</Text>
              <Text style={styles.footerContactBrand}>Adiyogi International</Text>
              <Text style={styles.footerContactLine}>📍 Bhoomi Agrotech, Vijaypur</Text>
              {PHONE_NUMBERS.map((num) => (
                <TouchableOpacity key={num} onPress={() => Linking.openURL(`tel:${num}`)}>
                  <Text style={styles.footerPhone}>📞 {num}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.footerContactLine}>📦 Premium quality industrial products</Text>
              <Text style={styles.footerNote}>
                WhatsApp orders processed within 24 hours. We'll confirm your order shortly after placement.
              </Text>
            </View>
          </View>

          {/* Neuronix credit */}
          <Text style={styles.footerCredit}>
            Designed and Developed by Neuronix Technology, Vijayapura.
          </Text>
          {/* Gold divider */}
          <View style={styles.footerDivider} />
          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} Adiyogi International. All rights reserved.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Collection tile ──────────────────────────────────────────────────────────
// 16px padding each side + 2 gaps of 8px between 3 tiles = 48px total
const TILE_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 2) / 3;

function CollectionTile({ name, image, active, onPress }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const gradients = [
    ['#1B3A6B', '#0F2040'], ['#475569', '#1e293b'],
    ['#312e81', '#1B3A6B'], ['#134e4a', '#0F2040'],
  ];
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const [g1, g2] = gradients[hash % gradients.length];

  return (
    <TouchableOpacity
      style={[styles.tile, active && styles.tileActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.tileImage} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[g1, g2]} style={styles.tileGradient}>
          <Text style={styles.tileInitials}>{initials}</Text>
        </LinearGradient>
      )}
      <View style={styles.tileOverlay}>
        <Text style={styles.tileName} numberOfLines={2}>{name}</Text>
      </View>
      {active && (
        <View style={styles.tileCheck}>
          <Ionicons name="checkmark" size={10} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const HOW_TO_STEPS = [
  { step: '01', icon: '🔍', title: 'Browse & Select', desc: 'Explore collections, search for products, and pick what you need.' },
  { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Choose your quantities and add products to your cart.' },
  { step: '03', icon: '📱', title: 'Order via WhatsApp', desc: "Fill your details and we'll send an invoice straight to WhatsApp." },
];

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },

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
  headerLeft: {},
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 36, height: 36, borderRadius: 8 },
  headerBrand: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.champagne,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  cartBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.champagne,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Hero
  hero: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  heroBadge: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.4)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  heroBadgeBrand: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.champagne,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.4)',
    marginVertical: 8,
  },
  heroBadgeSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroPhones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  heroPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroPhoneText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.champagne,
  },
  heroHeadline: {
    fontFamily: FONTS.display,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 12,
  },
  heroHeadlineGold: { color: COLORS.champagne },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.champagne,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaPrimaryText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.white },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.champagne,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 16,
  },

  // Collections grid
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  tileActive: {
    borderWidth: 3,
    borderColor: COLORS.champagne,
  },
  tileImage: { width: '100%', height: '100%' },
  tileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileInitials: {
    fontSize: 28,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    fontFamily: FONTS.display,
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
  },
  tileName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 14,
  },
  tileCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.champagne,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // How to order
  howToGrid: { gap: 12 },
  howToCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  howToIcon: { fontSize: 36, marginBottom: 8 },
  howToStep: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.champagne,
    letterSpacing: 1,
    marginBottom: 4,
  },
  howToTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 6,
    textAlign: 'center',
  },
  howToDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Products
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCount: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.gray400,
    fontWeight: 'normal',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray700,
    paddingVertical: 0,
  },
  chipsScroll: { marginBottom: 16 },
  chipsContent: { gap: 8, paddingRight: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  chipActive: { backgroundColor: COLORS.navy },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  chipTextActive: { color: COLORS.white },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { fontSize: 13, color: COLORS.gray400 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray500,
    marginBottom: 6,
  },
  emptyDesc: { fontSize: 13, color: COLORS.gray400, textAlign: 'center', marginBottom: 20 },
  emptyBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Pagination
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  pageBtnTextActive: { color: COLORS.white },
  ellipsis: { fontSize: 13, color: COLORS.gray400, paddingHorizontal: 4 },

  // Footer
  footer: {
    padding: SPACING.xl,
    paddingBottom: 32,
  },
  footerGrid: { gap: 28, marginBottom: 20 },
  footerCol: { gap: 8 },
  footerBrand: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.champagne,
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
    maxWidth: 280,
  },
  footerColTitle: {
    fontFamily: FONTS.display,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.champagne,
    marginBottom: 4,
  },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLinkArrow: { color: COLORS.champagne, fontSize: 14 },
  footerLinkText: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  footerContactBrand: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  footerContactLine: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 20 },
  footerPhone: { fontSize: 12, color: COLORS.champagne, fontFamily: FONTS.mono, lineHeight: 22 },
  footerNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 16,
    marginTop: 4,
    maxWidth: 260,
  },
  footerCredit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.champagne,
    opacity: 0.3,
    marginBottom: 12,
  },
  footerCopy: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
});
