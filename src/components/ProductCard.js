import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px outer padding each side + 16px gap

export default function ProductCard({ product, onPress }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  const salesPrice = product.salesPrice ?? product.price ?? 0;
  const cartItem = cart.find((i) => i.productId === product._id);
  const inCart = !!cartItem;

  return (
    <View style={styles.card}>
      {/* Tappable area: image + info */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.tappable}>
        {/* Image */}
        <View style={styles.imageWrap}>
          {!imgError && product.images?.[0] ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={36} color={COLORS.gray300} />
            </View>
          )}

          {/* Watermark */}
          <View style={styles.watermarkWrap} pointerEvents="none">
            <Text style={styles.watermark}>7975198804</Text>
          </View>
        </View>

        {/* Item code & name */}
        <View style={styles.info}>
          <Text style={styles.itemCode} numberOfLines={1}>
            ITEM CODE : {product.itemCode}
          </Text>
          {product.standardPacking ? (
            <Text style={styles.packing} numberOfLines={1}>
              Standard Packing: {product.standardPacking}
            </Text>
          ) : null}
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Price + cart control */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>₹{formatCurrency(salesPrice)}</Text>
          <Text style={styles.perPac}>/PAC</Text>
        </View>

        {inCart ? (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(product._id, cartItem.quantity - 1)}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepCount}>{cartItem.quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(product._id, cartItem.quantity + 1)}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product, 1)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
    marginBottom: 12,
  },
  tappable: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.gray50,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: 'rgba(15,32,64,0.18)',
    letterSpacing: 1,
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  itemCode: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.mono,
    color: '#111',
    marginBottom: 2,
  },
  packing: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FONTS.mono,
    color: '#111',
    marginBottom: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: '#d4af37',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FONTS.display,
    color: COLORS.navy,
  },
  perPac: {
    fontSize: 9,
    color: COLORS.gray400,
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
  stepBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  stepCount: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue,
  },
});
