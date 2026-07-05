import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert, Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import AdminLayout from './AdminLayout';
import { COLORS, FONTS, SPACING } from '../constants';

export default function AdminCollectionsScreen() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCol, setEditCol] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '' });

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/collections');
      setCollections(Array.isArray(data) ? data : []);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  const openCreate = () => {
    setEditCol(null);
    setForm({ name: '', slug: '' });
    setShowForm(true);
  };

  const openEdit = (col) => {
    setEditCol(col);
    setForm({ name: col.name ?? '', slug: col.slug ?? '' });
    setShowForm(true);
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const setField = (key, value) => {
    setForm((p) => {
      const next = { ...p, [key]: value };
      if (key === 'name' && !editCol) {
        next.slug = autoSlug(value);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Collection name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim() || autoSlug(form.name) };
      if (editCol) {
        await api.put(`/collections/${editCol._id}`, payload);
        Alert.alert('Updated', 'Collection updated successfully.');
      } else {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('slug', form.slug.trim() || autoSlug(form.name));
        await api.post('/collections', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Created', 'Collection created successfully.');
      }
      setShowForm(false);
      setEditCol(null);
      fetchCollections();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to save collection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (col) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${col.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/collections/${col._id}`);
              Alert.alert('Deleted', 'Collection deleted.');
              fetchCollections();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message ?? 'Failed to delete.');
            }
          },
        },
      ],
    );
  };

  return (
    <AdminLayout title="Collections">
      <View style={styles.topBar}>
        <Text style={styles.count}>{collections.length} collections</Text>
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
          {collections.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>No collections yet</Text>
            </View>
          ) : (
            collections.map((col) => (
              <TouchableOpacity key={col._id} style={styles.colCard} onPress={() => openEdit(col)}>
                <View style={styles.colImageWrap}>
                  {col.image ? (
                    <Image source={{ uri: col.image }} style={styles.colImage} />
                  ) : (
                    <View style={styles.colImagePlaceholder}>
                      <Ionicons name="folder-outline" size={24} color={COLORS.gray300} />
                    </View>
                  )}
                </View>
                <View style={styles.colInfo}>
                  <Text style={styles.colName}>{col.name}</Text>
                  <Text style={styles.colSlug}>/{col.slug}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(col)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editCol ? 'Edit Collection' : 'New Collection'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={22} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <Field label="Collection Name *" value={form.name} onChangeText={(v) => setField('name', v)} />
            <Field
              label="Slug"
              value={form.slug}
              onChangeText={(v) => setField('slug', v)}
              hint="Auto-generated from name"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>{editCol ? 'Update Collection' : 'Create Collection'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

function Field({ label, value, onChangeText, hint }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.inputWrap}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={COLORS.gray400}
        />
      </View>
      {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
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
  input: { flex: 1, fontSize: 14, color: COLORS.gray700, paddingVertical: 0 },
  hint: { fontSize: 11, color: COLORS.gray400, marginTop: 4 },
});

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  count: { fontSize: 13, color: COLORS.gray500 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: SPACING.lg, gap: 10, paddingBottom: 40 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.gray400 },
  colCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  colImageWrap: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.gray100, overflow: 'hidden',
  },
  colImage: { width: '100%', height: '100%' },
  colImagePlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  colInfo: { flex: 1 },
  colName: { fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
  colSlug: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  deleteBtn: { padding: 6 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl,
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
