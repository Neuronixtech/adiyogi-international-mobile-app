import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../constants';
import { formatCurrency } from '../utils/formatters';

const { width: SCREEN_W } = Dimensions.get('window');

export default function NewArrivalsCarousel({ items, onPressItem }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Auto-advance every 4 s
  useEffect(() => {
    if (items.length < 2) return;
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % items.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const goTo = (index) => {
    clearInterval(timerRef.current);
    indexRef.current = index;
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
  };

  if (!items.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.label}>JUST IN</Text>
        <Text style={styles.title}>New Arrivals</Text>
        <Text style={styles.subtitle}>Latest additions to our catalogue</Text>
      </View>

      <View style={styles.carouselWrap}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            indexRef.current = idx;
            setActiveIndex(idx);
          }}
        >
          {items.map((product, i) => (
            <CarouselSlide
              key={product._id}
              product={product}
              onPress={() => onPressItem(product._id)}
            />
          ))}
        </ScrollView>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.arrow, styles.arrowLeft]}
              onPress={() => goTo((activeIndex - 1 + items.length) % items.length)}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrow, styles.arrowRight]}
              onPress={() => goTo((activeIndex + 1) % items.length)}
            >
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Dot indicators */}
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
          <Text style={styles.counter}>
            {activeIndex + 1}/{items.length}
          </Text>
        </View>
      )}
    </View>
  );
}

function CarouselSlide({ product, onPress }) {
  const salesPrice = product.salesPrice ?? product.price ?? 0;

  return (
    <TouchableOpacity
      style={styles.slide}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {product.images?.[0] ? (
        <Image
          source={{ uri: product.images[0] }}
          style={styles.slideImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.slideImagePlaceholder}>
          <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.3)" />
        </View>
      )}

      <View style={styles.slideContent}>
        <Text style={styles.slideCode}>{product.itemCode}</Text>
        <Text style={styles.slideName} numberOfLines={1}>{product.name}</Text>
        <View style={styles.slidePriceRow}>
          <Text style={styles.slidePrice}>₹{formatCurrency(salesPrice)}</Text>
          <Text style={styles.slidePerPac}>/PAC</Text>
          <View style={styles.slideViewBtn}>
            <Text style={styles.slideViewBtnText}>View Details</Text>
            <Ionicons name="arrow-forward" size={12} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#0F2040',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  label: {
    color: COLORS.champagne,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  carouselWrap: {
    position: 'relative',
  },
  slide: {
    width: SCREEN_W,
    backgroundColor: '#1a3560',
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: 260,
  },
  slideImagePlaceholder: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a3560',
  },
  slideContent: {
    padding: 16,
    backgroundColor: '#1a3560',
  },
  slideCode: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.champagne,
    marginBottom: 2,
  },
  slideName: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
  },
  slidePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slidePrice: {
    fontFamily: FONTS.display,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.champagne,
  },
  slidePerPac: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  slideViewBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.champagne,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  slideViewBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 12 },
  arrowRight: { right: 12 },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.champagne,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  counter: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 6,
  },
});
