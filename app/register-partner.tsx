import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Cog,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';

export default function RegisterPartnerScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar with Back button to see previous page */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backBtn}
            onPress={handleBack}
            hitSlop={10}
            accessibilityLabel="Back to Previous Page"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Partner Registration</Text>
            <Text style={styles.headerSubtitle}>Become a verified partner on Haraka</Text>
          </View>
        </View>
        <Pressable onPress={handleBack} hitSlop={10}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>HARAKA PARTNER NETWORK</Text>
          </View>
          <Text style={styles.heroTitle}>
            Grow Your Business Across Ghana with Zero Upfront Cost
          </Text>
          <Text style={styles.heroDesc}>
            Join thousands of trusted sellers and skilled artisans connecting directly with verified Ghanaian buyers and homeowners daily.
          </Text>
        </View>

        {/* Track Selection Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECT YOUR PARTNER TRACK</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the profile that matches what you offer to clients
          </Text>
        </View>

        {/* Option 1: Marketplace Seller / Merchant */}
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [styles.trackCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/register-seller' as any)}
        >
          <View style={styles.trackCardInner}>
            <View style={styles.sellerIconContainer}>
              <Store size={24} color="#FF6A00" strokeWidth={2.3} />
            </View>
            <View style={styles.trackInfo}>
              <View style={styles.trackTitleRow}>
                <Text style={styles.trackTitle}>Commercial Seller / Merchant</Text>
                <ArrowRight size={17} color="#64748B" strokeWidth={2.2} />
              </View>
              <Text style={styles.trackDesc}>
                Sell mobile phones, electronics, vehicles, fashion, home appliances &amp; consumer goods.
              </Text>
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Verified Badge</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Direct Buyer Chat</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Safe Trade Hubs</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Option 2: Skilled Trade Artisan / Handyman */}
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [styles.trackCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/register-artisan' as any)}
        >
          <View style={styles.trackCardInner}>
            <View style={styles.artisanIconContainer}>
              <Cog size={24} color="#000000" strokeWidth={2.3} />
            </View>
            <View style={styles.trackInfo}>
              <View style={styles.trackTitleRow}>
                <Text style={styles.trackTitle}>Trade Artisan &amp; Technician</Text>
                <ArrowRight size={17} color="#64748B" strokeWidth={2.2} />
              </View>
              <Text style={styles.trackDesc}>
                Offer carpentry, electrical, plumbing, masonry, AC repairs, painting &amp; vehicle mechanics.
              </Text>
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Booking Schedule</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Fixed Diagnostic Fee</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✓ Voice Intro</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Protection & Guarantees */}
        <View style={styles.guaranteeCard}>
          <Text style={styles.guaranteeTitle}>PARTNER PROTECTION &amp; GUARANTEES</Text>

          <View style={styles.guaranteeRow}>
            <CheckCircle2 size={16} color="#059669" strokeWidth={2.4} style={styles.bulletIcon} />
            <View style={styles.guaranteeTextWrap}>
              <Text style={styles.guaranteeStrong}>0% Platform Commission</Text>
              <Text style={styles.guaranteeDesc}>
                Keep 100% of client payments directly via Cash or Mobile Money (MTN, Telecel, AT).
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <ShieldCheck size={16} color="#059669" strokeWidth={2.4} style={styles.bulletIcon} />
            <View style={styles.guaranteeTextWrap}>
              <Text style={styles.guaranteeStrong}>Ghana Card Verification</Text>
              <Text style={styles.guaranteeDesc}>
                Encrypted national identity verification protects verified merchants from fraudsters.
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeRow}>
            <Zap size={16} color="#059669" strokeWidth={2.4} style={styles.bulletIcon} />
            <View style={styles.guaranteeTextWrap}>
              <Text style={styles.guaranteeStrong}>Direct Local Customers</Text>
              <Text style={styles.guaranteeDesc}>
                Appear prominently in your district and town feeds across all 16 regions of Ghana.
              </Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 106, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF8A3D',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  trackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  trackCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  sellerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artisanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  guaranteeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletIcon: {
    marginTop: 2,
  },
  guaranteeTextWrap: {
    flex: 1,
  },
  guaranteeStrong: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  guaranteeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 16,
  },
});
