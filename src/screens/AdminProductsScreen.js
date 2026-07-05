import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert, Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import AdminLayout from './AdminLayout';
import { COLORS, FONTS, SPACING, ITEMS_PER_PAGE, BASE_UNITS, GST_RATES } from '../constants';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', itemCode: '', hsnCode: '', description: '',
    salesPrice: '', gstRate: '18', unitConversionRate: '10', baseUnit: 'PAC',
    standardPacking: '', stock: '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/products', { params });
      setProducts(data.products ?? []);
      setTotalPages(data.pages ?? 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchProducts();
    setRefreshing(false);
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({
      name: '', itemCode: '', hsnCode: '', description: '',
      salesPrice: '', gstRate: '18', unitConversionRate: '10', baseUnit: 'PAC',
      standardPacking: '', stock: '',
    });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name ?? '',
      itemCode: product.itemCode ?? '',
      hsnCode: product.hsnCode ?? '',
      description: product.description ?? '',
      salesPrice: String(product.salesPrice ?? product.price ?? ''),
      gstRate: String(product.gstRate ?? '18'),
      unitConversionRate: String(product.unitConversionRate ?? '10'),
      baseUnit: product.baseUnit ?? 'PAC',
      standardPacking: product.standardPacking ?? '',
      stock: String(product.stock ?? ''),
    });
    setShowForm(true);
  };

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name.trim());
    if (form.itemCode.trim()) fd.append('itemCode', form.itemCode.trim());
    if (form.hsnCode.trim()) fd.append('hsnCode', form.hsnCode.trim());
    if (form.description.trim()) fd.append('description', form.description.trim());
    fd.append('salesPrice', String(parseFloat(form.salesPrice)));
    fd.append('gstRate', String(parseInt(form.gstRate, 10)));
    fd.append('unitConversionRate', String(parseInt(form.unitConversionRate, 10)));
    fd.append('baseUnit', form.baseUnit);
    if (form.standardPacking.trim()) fd.append('standardPacking', form.standardPacking.trim());
    fd.append('stock', String(parseInt(form.stock || '0', 10)));
    return fd;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.salesPrice) {
      Alert.alert('Validation', 'Product name and price are required.');
      return;
    }
    setSaving(true);
    try {
      const fd = buildFormData();

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Updated', 'Product updated successfully.');
      } else {
        await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Created', 'Product created successfully.');
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/products/${product._id}`);
              Alert.alert('Deleted', 'Product has been deactivated.');
              fetchProducts();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message ?? 'Failed to delete.');
            }
          },
        },
      ],
    );
  };

  return (
    <AdminLayout title="Products">
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.gray400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.champagne} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.champagne} />}
        >
          {products.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cube-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : (
            products.map((product) => (
              <TouchableOpacity key={product._id} style={styles.productCard} onPress={() => openEdit(product)}>
                <View style={styles.productImageWrap}>
                  {product.images?.length > 0 ? (
                    <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                  ) : (
                    <Ionicons name="cube-outline" size={24} color={COLORS.gray300} />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productCode}>{product.itemCode}</Text>
                  <Text style={styles.productPrice}>₹{product.salesPrice ?? product.price}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(product)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Ionicons name="chevron-back" size={18} color={page === 1 ? COLORS.gray300 : COLORS.navy} />
              </TouchableOpacity>
              <Text style={styles.pageText}>{page} / {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <Ionicons name="chevron-forward" size={18} color={page === totalPages ? COLORS.gray300 : COLORS.navy} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editProduct ? 'Edit Product' : 'New Product'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={22} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <Field label="Product Name *" value={form.name} onChangeText={(v) => setField('name', v)} />
            <Field label="Item Code" value={form.itemCode} onChangeText={(v) => setField('itemCode', v)} />
            <Field label="HSN Code" value={form.hsnCode} onChangeText={(v) => setField('hsnCode', v)} />
            <Field label="Sales Price *" value={form.salesPrice} onChangeText={(v) => setField('salesPrice', v)} keyboardType="decimal-pad" />
            <Field label="Standard Packing" value={form.standardPacking} onChangeText={(v) => setField('standardPacking', v)} />
            <Field label="Stock" value={form.stock} onChangeText={(v) => setField('stock', v)} keyboardType="number-pad" />
            <Field label="Description" value={form.description} onChangeText={(v) => setField('description', v)} multiline />

            <PickerRow
              label="GST Rate"
              options={GST_RATES.map((r) => ({ label: `${r}%`, value: String(r) }))}
              selected={form.gstRate}
              onSelect={(v) => setField('gstRate', v)}
            />
            <PickerRow
              label="Base Unit"
              options={BASE_UNITS.map((u) => ({ label: u, value: u }))}
              selected={form.baseUnit}
              onSelect={(v) => setField('baseUnit', v)}
            />
            <Field
              label="Unit Conversion Rate (1 PAC = ? NOS)"
              value={form.unitConversionRate}
              onChangeText={(v) => setField('unitConversionRate', v)}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>{editProduct ? 'Update Product' : 'Create Product'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </AdminLayout>
  );
}

function Field({ label, value, onChangeText, keyboardType, multiline }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputWrap, multiline && fieldStyles.inputMulti]}>
        <TextInput
          style={[fieldStyles.input, multiline && fieldStyles.inputTextMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={COLORS.gray400}
          keyboardType={keyboardType ?? 'default'}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

function PickerRow({ label, options, selected, onSelect }) {
  return (
    <View style={pickerStyles.wrap}>
      <Text style={pickerStyles.label}>{label}</Text>
      <View style={pickerStyles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[pickerStyles.option, selected === opt.value && pickerStyles.optionActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[pickerStyles.optionText, selected === opt.value && pickerStyles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.gray600, marginBottom: 6 },
  inputWrap: {
    borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12,
    paddingHorizontal: 12, height: 44, backgroundColor: COLORS.white,
  },
  inputMulti: { height: undefined, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14, color: COLORS.gray700, paddingVertical: 0 },
  inputTextMulti: { minHeight: 80 },
});

const pickerStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.gray600, marginBottom: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.white,
  },
  optionActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  optionText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  optionTextActive: { color: COLORS.white },
});

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 12,
    height: 40, borderWidth: 1, borderColor: COLORS.gray200,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.gray700, paddingVertical: 0, marginLeft: 6 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: SPACING.lg, gap: 10, paddingBottom: 40 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.gray400 },
  productCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  productImageWrap: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
  productCode: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.navy, marginTop: 2 },
  deleteBtn: { padding: 6 },
  pagination: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12,
  },
  pageBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: COLORS.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: FONTS.display, fontSize: 18, fontWeight: 'bold', color: COLORS.navy },
  saveBtn: {
    backgroundColor: COLORS.champagne, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});
