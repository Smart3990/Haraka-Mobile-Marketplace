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
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react-native';

const HARAKA_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA12bpNfB52rGIYXjAyHoWwuoJD9XE6hrcvhWNcsi3-CuFdpe3gbT57Xuy7LzKe0jDRSPTkZ0Vl9q0Rhj7jHFX_yXGx7ixvwLGJkXwAuyfpsuI2GvR4dfMqg5JcXoOytzZ3L_nJ46_E7UgIGmTNye4FA45uDAYP5nQwQICFiKboI-I1w3l1W5fALNzFBwtQjXPU6VFSjuPAhpF9Yf_8ve93o1KykxLn2W8MIe7vR8-FfHHahEcZNfXRKvcTv3bxYYDzpA';

const DEFAULT_KNOWN_EMAILS = [
  'user@gmail.com',
  'kwame.mensah@gmail.com',
  'kwame@example.com',
  'seller@haraka.gh',
  'artisan@haraka.gh',
  'admin@haraka.gh',
  'buyer@haraka.gh',
  'mensah.electronics@gmail.com',
];

type ResetStep = 'request' | 'link_sent' | 'reset_form' | 'completed';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<ResetStep>('request');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmitEmail = () => {
    setError('');
    setInfoMessage('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email is registered
    const isRegistered = DEFAULT_KNOWN_EMAILS.some(
      (reg) => reg.toLowerCase() === cleanEmail
    );

    if (!isRegistered) {
      setError("This email isn't registered with Haraka. Please check your spelling or sign up.");
      return;
    }

    setStep('link_sent');
    setInfoMessage(`A reset password link has been sent to ${cleanEmail}`);
  };

  const handleSavePassword = () => {
    setError('');
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep('completed');
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
        {/* TopBar with Centered Brand Logo (Back button removed per request) */}
        <View style={styles.topBar}>
          <Image
            source={{ uri: HARAKA_LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* STEP 1: Enter Email & Check Registration */}
        {step === 'request' && (
          <View>
            <View style={styles.headlineSection}>
              <Text style={styles.heading}>Forgot Password? 🔐</Text>
              <Text style={styles.subheading}>
                Enter your registered email address and we'll send you a link to reset your password.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                {error.includes("isn't registered") && (
                  <Pressable
                    style={styles.signUpLinkRow}
                    onPress={() => router.push('/(auth)/sign-up' as any)}
                  >
                    <Text style={styles.signUpLinkText}>Create a new Haraka account instead &rarr;</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            <View style={styles.form}>
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
                    onChangeText={(text: string) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoFocus
                  />
                </View>
              </View>

              <Pressable style={styles.submitBtn} onPress={handleSubmitEmail}>
                <Text style={styles.submitBtnText}>Send Reset Link</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 2: Link Dispatched - Open Reset Link */}
        {step === 'link_sent' && (
          <View style={styles.cardSection}>
            <View style={styles.headlineSection}>
              <Text style={styles.heading}>Reset Link Sent ✉️</Text>
              <Text style={styles.subheading}>
                We verified your account and dispatched a secure reset link to{' '}
                <Text style={styles.boldText}>{email}</Text>.
              </Text>
            </View>

            {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

            <Pressable
              style={styles.submitBtn}
              onPress={() => {
                setStep('reset_form');
                setError('');
              }}
            >
              <Text style={styles.submitBtnText}>Open Password Reset Page</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
            </Pressable>

            <Pressable
              style={styles.retryBtn}
              onPress={() => {
                setStep('request');
                setError('');
              }}
            >
              <Text style={styles.retryText}>Use a different email address</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 3: Browser Reset Form (Direct new password, No OTP) */}
        {step === 'reset_form' && (
          <View>
            <View style={styles.headlineSection}>
              <Text style={styles.heading}>New Password 🔑</Text>
              <Text style={styles.subheading}>
                Set a new password of at least 8 characters for {email}.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#9CA3AF" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoFocus
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? (
                      <EyeOff size={18} color="#6B7280" />
                    ) : (
                      <Eye size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#9CA3AF" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat your new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#6B7280" />
                    ) : (
                      <Eye size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.submitBtn} onPress={handleSavePassword}>
                <Text style={styles.submitBtnText}>Save New Password</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 4: Password Updated Confirmation */}
        {step === 'completed' && (
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <CheckCircle2 size={44} color="#1FA971" strokeWidth={2.3} />
            </View>
            <Text style={styles.successTitle}>Password Updated!</Text>
            <Text style={styles.successDesc}>
              Your password has been securely reset. You can now log in with your new credentials.
            </Text>

            <Pressable
              style={styles.submitBtn}
              onPress={() => router.replace('/(auth)/sign-in' as any)}
            >
              <Text style={styles.submitBtnText}>Log In Now</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
            </Pressable>
          </View>
        )}

        {/* Footer matching Sign Up */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in' as any)}>
            <Text style={styles.loginLink}>Log In</Text>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 28,
    paddingBottom: 16,
    marginBottom: 12,
  },
  logo: {
    height: 48,
    width: 140,
  },
  headlineSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
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
  errorBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
  signUpLinkRow: {
    marginTop: 4,
    paddingVertical: 2,
  },
  signUpLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1FA971',
    textAlign: 'center',
    marginBottom: 14,
  },
  cardSection: {
    gap: 12,
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
  submitBtn: {
    backgroundColor: '#1FA971',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1FA971',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  successCard: {
    backgroundColor: '#F0F2FD',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  successDesc: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
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
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF7A00',
  },
});
