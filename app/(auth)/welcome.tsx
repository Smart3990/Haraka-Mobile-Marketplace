import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const WELCOME_HERO_IMAGE = '/welcome_hero_trans.png';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top spacing */}
      <View style={styles.topSpacer} />

      {/* Center Content: Hero Image & Headings */}
      <View style={styles.centerSection}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: WELCOME_HERO_IMAGE }}
            style={styles.heroImage}
            contentFit="contain"
          />
        </View>

        <Text style={styles.welcomeTitle}>Welcome to Haraka!</Text>
        <Text style={styles.welcomeSubtitle}>Buy and sell items locally in a flash!</Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        <Pressable
          style={styles.signUpBtn}
          onPress={() => router.push('/(auth)/sign-up' as any)}
        >
          <Text style={styles.signUpBtnText}>Sign Up</Text>
        </Pressable>

        <Pressable
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/sign-in' as any)}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  topSpacer: {
    height: 8,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    maxWidth: 270,
    maxHeight: '46%',
    aspectRatio: 4 / 3,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSection: {
    gap: 12,
    width: '100%',
    paddingBottom: 8,
  },
  signUpBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1FA971',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1FA971',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  signUpBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
});
