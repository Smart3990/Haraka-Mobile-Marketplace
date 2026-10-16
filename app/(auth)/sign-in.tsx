import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';

const HARAKA_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA12bpNfB52rGIYXjAyHoWwuoJD9XE6hrcvhWNcsi3-CuFdpe3gbT57Xuy7LzKe0jDRSPTkZ0Vl9q0Rhj7jHFX_yXGx7ixvwLGJkXwAuyfpsuI2GvR4dfMqg5JcXoOytzZ3L_nJ46_E7UgIGmTNye4FA45uDAYP5nQwQICFiKboI-I1w3l1W5fALNzFBwtQjXPU6VFSjuPAhpF9Yf_8ve93o1KykxLn2W8MIe7vR8-FfHHahEcZNfXRKvcTv3bxYYDzpA';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSignIn = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TopBar with Brand Logo */}
        <View style={styles.topBar}>
          <Image
            source={{ uri: HARAKA_LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* HeadlineSection */}
        <View style={styles.headlineSection}>
          <Text style={styles.heading}>Welcome back 👋</Text>
          <Text style={styles.subheading}>
            Sign in to continue exploring deals, managing your items, and connecting with buyers and sellers across Ghana.
          </Text>
        </View>

        {/* SignInForm */}
        <View style={styles.form}>
          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="kwame@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={[styles.input, !showPassword && password ? styles.passwordHidden : null]}
                placeholder="••••••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#6B7280" strokeWidth={2} />
                ) : (
                  <Eye size={18} color="#6B7280" strokeWidth={2} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable style={styles.submitBtn} onPress={handleSignIn}>
            <Text style={styles.submitBtnText}>Log In</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
          </Pressable>
        </View>

        {/* SocialDivider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtonsRow}>
          <Pressable style={styles.socialBtn} onPress={handleSignIn}>
            <Text style={styles.socialBtnText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialBtn} onPress={handleSignIn}>
            <Text style={styles.socialBtnText}>Apple</Text>
          </Pressable>
        </View>

        {/* Demo text button with NO background color */}
        <Pressable
          style={styles.demoBtn}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text style={styles.demoText}>Demo</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up' as any)}>
            <Text style={styles.signUpLink}>Sign Up Free</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
    maxWidth: 430,
    alignSelf: 'center',
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    marginBottom: 12,
  },
  logo: {
    height: 48,
    width: 140,
    marginBottom: 8,
  },
  headlineSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2FD',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  passwordHidden: {
    letterSpacing: 3,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1FA971',
    borderColor: '#1FA971',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  rememberText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
  submitBtn: {
    backgroundColor: '#1FA971',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#1FA971',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A00',
  },
  demoBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A00',
  },
});
