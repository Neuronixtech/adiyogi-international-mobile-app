import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api, { setAdminToken } from '../api/client';
import { COLORS, FONTS, SPACING, STORAGE_KEYS } from '../constants';

export default function AdminLoginScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState(null); // null | 'login' | 'setup'
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (token) {
        setAdminToken(token);
        navigation.replace('AdminDashboard');
        return;
      }
      await api.get('/admin/setup');
      setMode('login');
    } catch {
      setMode('setup');
    } finally {
      setChecking(false);
    }
  };

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Validation', 'Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', {
        email: form.email.trim(),
        password: form.password,
      });
      setAdminToken(data.token);
      navigation.replace('AdminDashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Validation', 'Name, email, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/admin/setup', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      setAdminToken(data.token);
      navigation.replace('AdminDashboard');
    } catch (err) {
      Alert.alert('Setup Failed', err.response?.data?.message ?? 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.champagne} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[COLORS.navyDark, COLORS.navy, '#2A5298']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.champagne} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.champagne} />
            </View>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>
              {mode === 'setup'
                ? 'Create your admin account to get started'
                : 'Sign in to manage your store'}
            </Text>
          </View>

          <View style={styles.card}>
            {mode === 'setup' && (
              <>
                <Text style={styles.cardTitle}>First-Time Setup</Text>
                <Text style={styles.cardHint}>
                  No admin account found. Create one to begin.
                </Text>
                <Input
                  label="Full Name *"
                  value={form.name}
                  onChangeText={(v) => setField('name', v)}
                  placeholder="Admin Name"
                  autoCapitalize="words"
                />
                <Input
                  label="Email *"
                  value={form.email}
                  onChangeText={(v) => setField('email', v)}
                  placeholder="admin@adiyogi.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChangeText={(v) => setField('phone', v.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                />
                <Input
                  label="Password *"
                  value={form.password}
                  onChangeText={(v) => setField('password', v)}
                  placeholder="Min 6 characters"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword((s) => !s)}
                />
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleSetup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Create Admin Account</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {mode === 'login' && (
              <>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Input
                  label="Email"
                  value={form.email}
                  onChangeText={(v) => setField('email', v)}
                  placeholder="admin@adiyogi.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Password"
                  value={form.password}
                  onChangeText={(v) => setField('password', v)}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword((s) => !s)}
                />
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({
  label, value, onChangeText, placeholder, keyboardType,
  autoCapitalize, secureTextEntry, rightIcon, onRightIconPress,
}) {
  return (
    <View style={inputStyles.wrap}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={inputStyles.inputWrap}>
        <TextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.gray600, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: COLORS.white,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.gray700, paddingVertical: 0 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.navyDark, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40, flexGrow: 1 },
  backBtn: { padding: 4, marginBottom: 8, alignSelf: 'flex-start' },
  header: { alignItems: 'center', marginBottom: 28, marginTop: 12 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: 'rgba(201,168,76,0.4)',
  },
  title: {
    fontFamily: FONTS.display, fontSize: 28, fontWeight: '900',
    color: COLORS.champagne, marginBottom: 6,
  },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  cardTitle: {
    fontFamily: FONTS.display, fontSize: 18, fontWeight: 'bold',
    color: COLORS.navy, marginBottom: 4,
  },
  cardHint: { fontSize: 12, color: COLORS.gray400, marginBottom: 16 },
  submitBtn: {
    backgroundColor: COLORS.champagne, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});
