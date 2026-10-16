import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  Zap,
  ShieldCheck,
  Tag,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react-native';

export default function PostTabScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post Free Ad</Text>
        <Text style={styles.headerSubtitle}>
          List items in 60 seconds with zero commission
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main CTA Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Camera size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.cardTitle}>Sell Anything on Haraka</Text>
          <Text style={styles.cardDesc}>
            From electronics, cars, apartments to handyman services. Snap photos and connect directly with ready buyers.
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push('/post-ad/step1' as any)}
          >
            <Zap size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Start Listing (Step 1 of 3)</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* 3 Simple Steps */}
        <Text style={styles.sectionHeader}>How Selling on Haraka Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Snap Photos & Describe</Text>
              <Text style={styles.stepSub}>
                Upload up to 8 real photos, select your category and write clear specs.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Set Price & Location</Text>
              <Text style={styles.stepSub}>
                Choose USD or local currency, toggle negotiable, and set neighborhood pickup.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Publish & Chat with Buyers</Text>
              <Text style={styles.stepSub}>
                Your ad goes live instantly. Receive direct calls and chat inquiries.
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits Grid */}
        <Text style={styles.sectionHeader}>Why Sellers Love Haraka</Text>
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitCard}>
            <Tag size={20} color="#EA580C" />
            <Text style={styles.benefitTitle}>100% Free</Text>
            <Text style={styles.benefitSub}>No hidden transaction cuts or fees.</Text>
          </View>

          <View style={styles.benefitCard}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.benefitTitle}>Huge Reach</Text>
            <Text style={styles.benefitSub}>Reach ready customers on Haraka app today.</Text>
          </View>

          <View style={styles.benefitCard}>
            <MessageCircle size={20} color="#3B82F6" />
            <Text style={styles.benefitTitle}>Direct Chat</Text>
            <Text style={styles.benefitSub}>Negotiate directly with buyers.</Text>
          </View>

          <View style={styles.benefitCard}>
            <ShieldCheck size={20} color="#8B5CF6" />
            <Text style={styles.benefitTitle}>Verified Badge</Text>
            <Text style={styles.benefitSub}>Boost trust with phone & ID verification.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 16,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 2,
  },
  benefitSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
  },
});
