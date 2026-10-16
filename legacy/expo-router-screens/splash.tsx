import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const HARAKA_LOGO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAlPoI2sgJT9wRJX7VurGMk86ppfPRa3Uxhr16UVZ-f-uJAkjisNaduCBQQ6BqPpKcitzm4lOGnI3d_-1uEYHn3aAGsHmbSiifD0sDxGinSkJpK1YmigO4B3Spvu0OWc3Tal69GDv-QJZvA7rfMN7ouTJfBecH9z32cvieS71MvxQIm-dgNd33EHFFT3WPRMJiHAiZ5FLhxs-V0Lv32HX5FWrK4rGyaj5VHS58PgiHkPKhEN1EHV9KK0l2qScmk89Ma-Q';

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding' as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleTapToContinue = () => {
    router.replace('/onboarding' as any);
  };

  return (
    <Pressable style={styles.container} onPress={handleTapToContinue}>
      {/* Subtle Ambient Glow Rings */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      <View style={styles.glowBottomRight} pointerEvents="none" />

      {/* Top Anchor */}
      <View style={styles.topAnchor} />

      {/* Center Branded Content */}
      <View style={styles.centerContainer}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleTapToContinue}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image
              source={{ uri: HARAKA_LOGO_URI }}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Bottom Brand Status & Tactile Loader */}
      <View style={styles.bottomContainer}>
        <ActivityIndicator size="small" color="#ff7a00" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -96,
    left: -96,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 108, 69, 0.08)',
  },
  topAnchor: {
    width: '100%',
    height: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  logo: {
    width: 220,
    height: 112,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 8,
    zIndex: 10,
  },
  taglineWrapper: {
    paddingTop: 4,
  },
  taglineText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
