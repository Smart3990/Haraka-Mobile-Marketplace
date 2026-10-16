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
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react-native';

const HARAKA_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDoPE2RqEF3lPn4bn3qwFjAfX0lyyP8yQEcMc8X102aRoieO4UM005k02tlvrH-7TTPF9w6mhkiydO0NjOd7tdp0an-aD7NKpGnyqplmDLVGy_Zv_VWaUm67umobN5LTlHl9NqGFmHprDOdHRM5nGwNWofBnIC55BSXOtOemBxb2DKPz5zPcPObIMp-G7NUb4FXkEAyMqI_zfz_SGH1nE_VO0Qgi3XitAAO6dUbtRPCD0sUEQoQ3RF6FEpEZaJg6ATJcA';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSignUp = () => {
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
        {/* NavigationHeader */}
        <View style={styles.header}>
          <Image
            source={{ uri: HARAKA_LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* HeroHeadline */}
        <View style={styles.headlineSection}>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>
            Join Ghana's marketplace community to buy, sell, and discover verified local deals in a flash.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#64748B" strokeWidth={1.8} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Kwame Mensah"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748B" strokeWidth={1.8} />
              <TextInput
                style={styles.input}
                placeholder="kwame.mensah@gmail.com"
                placeholderTextColor="#94A3B8"
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
              <Lock size={18} color="#64748B" strokeWidth={1.8} />
              <TextInput
                style={[styles.input, !showPassword && password ? styles.passwordHidden : null]}
                placeholder="••••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#64748B" strokeWidth={1.8} />
                ) : (
                  <Eye size={18} color="#64748B" strokeWidth={1.8} />
                )}
              </Pressable>
            </View>

            {/* Helper Rule */}
            <View style={styles.helperRow}>
              <CheckCircle2 size={15} color="#1FA971" strokeWidth={2} />
              <Text style={styles.helperText}>
                At least 8 characters with numbers & symbols
              </Text>
            </View>
          </View>

          {/* Agreement Terms Checkbox */}
          <Pressable
            style={styles.termsRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to Haraka's{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>

          {/* Primary CTA: Create Account */}
          <Pressable style={styles.submitBtn} onPress={handleSignUp}>
            <Text style={styles.submitBtnText}>Create Account</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Social Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Auth Buttons */}
        <View style={styles.socialButtonsRow}>
          <Pressable style={styles.socialBtn} onPress={handleSignUp}>
            <Text style={styles.socialBtnText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialBtn} onPress={handleSignUp}>
            <Text style={styles.socialBtnText}>Apple</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in' as any)}>
            <Text style={styles.logInLink}>Log In</Text>
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
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  logo: {
    height: 48,
    width: 140,
    marginBottom: 8,
  },
  headlineSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  passwordHidden: {
    letterSpacing: 3,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 4,
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
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#006B44',
    borderColor: '#006B44',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  termsLink: {
    color: '#006B44',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#006B44',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#006B44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
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
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  logInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A00',
  },
});
