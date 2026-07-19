import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, ITEMS_PER_PAGE } from '../constants';
import { useCart } from '../context/CartContext';
import { cachedGet } from '../api/cachedApi';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { collectionId, collectionName } = route.params;
  const { cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (collectionId) params.collection = collectionId;
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await cachedGet('/products', params, { skipCache: !!debouncedSearch });
      setProducts(data.products ?? []);
      setTotalProducts(data.total ?? 0);
      setTotalPages(data.pages ?? 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, collectionId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <Text style={styles.breadcrumbLink}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}> › </Text>
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{collectionName}</Text>
        </View>

        {/* Title + count */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.sectionLabel}>{collectionName}</Text>
            <Text style={styles.sectionTitle}>
              Our Products{' '}
              {totalProducts > 0 && (
                <Text style={styles.productCount}>({totalProducts})</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Search */}
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
            <Text style={styles.emptyDesc}>Try a different search or go back to browse all collections.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.emptyBtnText}>Go Back</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.navyDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.25)',
  },
  headerLeft: {},
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: { width: 44, height: 44, borderRadius: 10 },
  headerBrand: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.champagne,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    marginTop: 2,
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

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.champagne,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.bodyText,
  },
  productCount: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.gray400,
    fontWeight: 'normal',
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: 16,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray700,
    paddingVertical: 0,
  },

  // Products grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { fontSize: 13, color: COLORS.gray400 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: SPACING.lg },
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
    marginBottom: 24,
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
});
