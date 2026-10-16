import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShieldCheck, Zap, Lock, ArrowRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'slide-1',
    title: 'Find Verified Deals Nearby',
    subtitle: 'Browse thousands of smartphones, vehicles, fashion, and home goods across Accra, Kumasi, and all other regions at true direct prices.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    icon: ShieldCheck,
    tag: 'Verified Deals',
  },
  {
    id: 'slide-2',
    title: 'Snap, Record & Sell in 60s',
    subtitle: 'Turn unused phones, laptops, and furniture into instant cash. Snap a photo, record an audio description, and reach buyers immediately.',
    image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80',
    icon: Zap,
    tag: 'Instant Cash',
  },
  {
    id: 'slide-3',
    title: 'Safe Meetups & Audio description',
    subtitle: 'Trade securely with verified members. Meet up at designated safe physical locations and communicate freely via in-app chat',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    icon: ShieldCheck,
    tag: 'Safe Meetups',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/welcome' as any);
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/welcome' as any);
  };

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View />

        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>
            {currentSlide === SLIDES.length - 1 ? 'Done' : 'Skip'}
          </Text>
        </Pressable>
      </View>

      {/* Slide Image */}
      <View style={styles.imageCard}>
        <Image source={{ uri: slide.image }} style={styles.slideImage} contentFit="cover" />
        <View style={styles.tagBadge}>
          <IconComponent size={14} color="#EA580C" />
          <Text style={styles.tagText}>{slide.tag}</Text>
        </View>
      </View>

      {/* Slide Info */}
      <View style={styles.infoContainer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentSlide === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSlide === SLIDES.length - 1 ? 'Get Started with Haraka 🎉' : 'Next'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  topHeader: {
    paddingTop: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  imageCard: {
    marginHorizontal: 20,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#EA580C',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 28,
  },
  buttonsRow: {
    width: '100%',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 15,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
