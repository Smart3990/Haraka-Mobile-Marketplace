import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  User,
  ShieldCheck,
  Package,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Star,
  MapPin,
  Phone,
  Mail,
  Zap,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Lock,
  Share2,
  Camera,
  Eye,
  Pencil,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [isApproved] = useState(true);
  const [isVerified] = useState(true);

  // Masking helpers to obscure parts of sensitive information using *
  const maskPhone = (phone: string) => {
    const parts = phone.trim().split(' ');
    if (parts.length >= 4) return `${parts[0]} ${parts[1]} *** ${parts[3]}`;
    if (parts.length === 3) return `${parts[0]} *** ${parts[2]}`;
    return '+233 24 *** 1234';
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/notifications' as any)}
        >
          <Bell size={20} color="#0F172A" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card - Clean styling with ZERO text background color */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <User size={32} color="#0F172A" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>New User</Text>
              
              {/* Verified Status: Show ONLY "Verified" if verified AND approved */}
              {isApproved && isVerified && (
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={14} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* Clean Metadata Section: Contact & Location */}
          <View style={styles.metaContainer}>
            <View style={styles.metaColumn}>
              <View style={styles.metaItem}>
                <View style={styles.metaIconWrap}>
                  <MapPin size={12} color="#64748B" />
                </View>
                <Text style={styles.metaBoldText} numberOfLines={1}>Not provided</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={styles.metaIconWrap}>
                  <Mail size={12} color="#64748B" />
                </View>
                <Text style={styles.metaText} numberOfLines={1}>Not provided</Text>
              </View>
            </View>

            <View style={styles.metaColumn}>
              <View style={styles.metaItem}>
                <View style={styles.metaIconWrap}>
                  <Calendar size={12} color="#64748B" />
                </View>
                <Text style={styles.metaText} numberOfLines={1}>New member</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={styles.metaIconWrap}>
                  <Phone size={12} color="#64748B" />
                </View>
                <Text style={styles.metaText} numberOfLines={1}>Not provided</Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics Grid - Clean typography, zero text background colors */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Active Ads</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Deals Closed</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.ratingRow}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statNumber}>—</Text>
              </View>
              <Text style={styles.statLabel}>Rating (0)</Text>
            </View>
          </View>
        </View>

        {/* Listing Card with Pending Offer for Seller */}
        <View style={styles.offerCardSection}>
          <Text style={styles.sectionHeader}>Marketplace Offers & Listings</Text>
          <View style={[styles.listingCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 }}>
              No active listings or offers yet
            </Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 16 }}>
              Post your first item to start receiving offers from verified buyers across Ghana.
            </Text>
          </View>
        </View>

        {/* Section: Activity & Bookings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Activity & Trades</Text>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/messages' as any)}
          >
            <View style={styles.menuLeft}>
              <Package size={18} color="#0F172A" />
              <View>
                <Text style={styles.menuTitle}>My Active Listings</Text>
                <Text style={styles.menuSub}>12 ads live across Ghana</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/messages' as any)}
          >
            <View style={styles.menuLeft}>
              <Calendar size={18} color="#0F172A" />
              <View>
                <Text style={styles.menuTitle}>My Bookings & Visits</Text>
                <Text style={styles.menuSub}>3 active scheduled visits</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/saved' as any)}
          >
            <View style={styles.menuLeft}>
              <Heart size={18} color="#0F172A" />
              <View>
                <Text style={styles.menuTitle}>Saved Listings & Artisans</Text>
                <Text style={styles.menuSub}>View your bookmarked items</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/messages' as any)}
          >
            <View style={styles.menuLeft}>
              <MessageSquare size={18} color="#0F172A" />
              <View>
                <Text style={styles.menuTitle}>Messages & Offers</Text>
                <Text style={styles.menuSub}>Chat with buyers and sellers</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Section: Trust & Verification - Clean verification items, text only */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Trust & Verification</Text>

          <View style={styles.verificationRow}>
            <View style={styles.verificationLeft}>
              <CheckCircle2 size={16} color="#059669" />
              <View>
                <Text style={styles.verificationLabel}>Ghana National Card / ID</Text>
                <Text style={styles.verificationSub}>GHA-*******21-4 verified</Text>
              </View>
            </View>
            <Text style={styles.verificationStatus}>Verified</Text>
          </View>

          <View style={styles.verificationRow}>
            <View style={styles.verificationLeft}>
              <CheckCircle2 size={16} color="#059669" />
              <View>
                <Text style={styles.verificationLabel}>Ghana Phone Number (+233)</Text>
                <Text style={styles.verificationSub}>+233 24 *** 1234 active for MoMo</Text>
              </View>
            </View>
            <Text style={styles.verificationStatus}>Verified</Text>
          </View>

          <View style={styles.verificationRow}>
            <View style={styles.verificationLeft}>
              <Mail size={16} color="#94A3B8" />
              <View>
                <Text style={styles.verificationLabel}>Primary Email Address</Text>
                <Text style={styles.verificationSub}>ko***h@example.com</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Preferences & Alerts</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Bell size={18} color="#0F172A" />
              <Text style={styles.toggleLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
              thumbColor={pushEnabled ? '#EA580C' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Section: Safe Trading Guidelines (Displayed directly on page) */}
        <View style={styles.safeGuidelinesCard}>
          <View style={styles.safeGuidelinesHeader}>
            <ShieldCheck size={17} color="#C2410C" />
            <Text style={styles.safeGuidelinesTitle}>Safe Trading Guidelines</Text>
          </View>
          <View style={styles.safeGuidelinesList}>
            <View style={styles.safeGuidelineRow}>
              <CheckCircle2 size={14} color="#059669" />
              <Text style={styles.safeGuidelineText}>Meet in safe, busy public physical locations in person.</Text>
            </View>
            <View style={styles.safeGuidelineRow}>
              <CheckCircle2 size={14} color="#059669" />
              <Text style={styles.safeGuidelineText}>Inspect the item thoroughly before releasing cash or mobile money.</Text>
            </View>
            <View style={styles.safeGuidelineRow}>
              <HelpCircle size={14} color="#DC2626" />
              <Text style={styles.safeGuidelineText}>Never pay advance delivery or reservation fees without seeing the product in person.</Text>
            </View>
          </View>
        </View>

        {/* Section: Account Actions */}
        <View style={styles.menuSection}>
          <Pressable
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => router.push('/(auth)/welcome' as any)}
          >
            <View style={styles.menuLeft}>
              <LogOut size={18} color="#DC2626" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </View>
            <ChevronRight size={18} color="#DC2626" />
          </Pressable>
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
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  storeNameText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaColumn: {
    flex: 1,
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIconWrap: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaBoldText: {
    fontSize: 11.5,
    color: '#1E293B',
    fontWeight: '700',
    flex: 1,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  bioText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  promoBanner: {
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  promoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTextCol: {
    flex: 1,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  promoSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  promoButtonText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '800',
  },
  offerCardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  listingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  listingTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  listingImageWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
  },
  listingThumb: {
    width: '100%',
    height: '100%',
  },
  pendingBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF6A00',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  listingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  listingPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 2,
  },
  listingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaSameRowText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 10.5,
    color: '#CBD5E1',
  },
  offerHighlightText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9A3412',
  },
  listingActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  reviewOfferBtn: {
    flex: 1,
    backgroundColor: '#00E599',
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewOfferBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#064E3B',
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  verificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verificationLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  verificationSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  verificationStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  safeGuidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  safeGuidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  safeGuidelinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  safeGuidelinesList: {
    gap: 8,
  },
  safeGuidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  safeGuidelineText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    flex: 1,
  },
});
