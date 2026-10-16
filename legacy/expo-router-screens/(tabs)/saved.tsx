import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle,
  Star,
  ShoppingBag,
  Heart,
  Search,
  AlertCircle,
} from 'lucide-react-native';
import {
  INITIAL_LISTINGS,
  Listing,
  ARTISANS_DIRECTORY,
  FEATURED_ARTISANS,
  ArtisanItem,
} from '../../src/lib/listingData';

export default function SavedScreen() {
  const router = useRouter();

  // Filter tab: 'all' | 'artisans' | 'ads'
  const [activeTab, setActiveTab] = useState<'all' | 'artisans' | 'ads'>('all');

  // Bookmarked artisans
  const [bookmarkedArtisans, setBookmarkedArtisans] = useState<ArtisanItem[]>([]);

  // Saved listings
  const [savedListings, setSavedListings] = useState<Listing[]>([]);

  const removeListing = (id: string) => {
    setSavedListings((prev) => prev.filter((item) => item.id !== id));
  };

  const removeArtisan = (id: string) => {
    setBookmarkedArtisans((prev) => prev.filter((art) => art.id !== id));
  };

  const totalCount = bookmarkedArtisans.length + savedListings.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Saved & Bookmarked</Text>
          {/* Clean text without background pill per user request */}
          <Text style={styles.headerCountText}>{totalCount} Saved</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Your saved items and trusted Ghanaian artisans
        </Text>

        {/* Segmented Filter Bar */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
              All ({totalCount})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === 'artisans' && styles.tabBtnActive]}
            onPress={() => setActiveTab('artisans')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'artisans' && styles.tabBtnTextActive]}>
              Artisans ({bookmarkedArtisans.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === 'ads' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ads')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'ads' && styles.tabBtnTextActive]}>
              Saved Ads ({savedListings.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick shortcut to My Bookings */}
        <Pressable
          style={styles.bookingsCard}
          onPress={() => router.push('/chat/conv-1' as any)}
        >
          <View style={styles.bookingsCardLeft}>
            <Calendar size={18} color="#EA580C" />
            <View>
              <Text style={styles.bookingsCardTitle}>My Scheduled Bookings</Text>
              <Text style={styles.bookingsCardSub}>2 active artisan appointments</Text>
            </View>
          </View>
          <Text style={styles.bookingsCardAction}>View →</Text>
        </Pressable>

        {/* 1. Bookmarked Artisans Section */}
        {(activeTab === 'all' || activeTab === 'artisans') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Bookmarked Artisans ({bookmarkedArtisans.length})
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/categories' as any)}>
                <Text style={styles.sectionActionText}>Find Artisans</Text>
              </Pressable>
            </View>

            {bookmarkedArtisans.length > 0 ? (
              <View style={styles.cardsList}>
                {bookmarkedArtisans.map((art) => (
                  <View key={art.id} style={styles.artisanCard}>
                    <Pressable
                      style={styles.artisanMain}
                      onPress={() => router.push(`/book-service/${art.id}` as any)}
                    >
                      <View style={styles.avatarWrapper}>
                        <Image source={{ uri: art.avatar }} style={styles.artisanAvatar} contentFit="cover" />
                        <View style={styles.avatarCheckBadge}>
                          <CheckCircle size={13} color="#059669" />
                        </View>
                      </View>

                      <View style={styles.artisanInfo}>
                        <View style={styles.artisanHeaderRow}>
                          <Text style={styles.artisanName}>{art.name}</Text>
                          <Pressable style={styles.unbookmarkBtn} onPress={() => removeArtisan(art.id)}>
                            <Bookmark size={16} color="#EA580C" fill="#EA580C" />
                          </Pressable>
                        </View>

                        <Text style={styles.artisanRole}>{art.role}</Text>

                        {/* Stats - clean text, no background color */}
                        <View style={styles.statsRow}>
                          <View style={styles.ratingRow}>
                            <Star size={11} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.ratingText}>{art.rating}</Text>
                          </View>
                          <Text style={styles.dotSeparator}>•</Text>
                          <View style={styles.locationRow}>
                            <MapPin size={11} color="#64748B" />
                            <Text style={styles.locationText}>{art.location}</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>

                    {/* Action Buttons */}
                    <View style={styles.artisanActionsRow}>
                      <Pressable
                        style={styles.bookServiceBtn}
                        onPress={() => router.push(`/book-service/${art.id}` as any)}
                      >
                        <Calendar size={13} color="#FFFFFF" />
                        <Text style={styles.bookServiceBtnText}>Book Service</Text>
                      </Pressable>

                      <Pressable
                        style={styles.chatDirectBtn}
                        onPress={() => router.push('/chat/conv-1' as any)}
                      >
                        <MessageCircle size={13} color="#334155" />
                        <Text style={styles.chatDirectBtnText}>Chat Direct</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Bookmark size={24} color="#94A3B8" />
                <Text style={styles.emptyCardTitle}>No bookmarked artisans yet</Text>
                <Text style={styles.emptyCardSub}>
                  Bookmark top rated carpenters, electricians and tailors for quick access
                </Text>
                <Pressable
                  style={styles.exploreMiniBtn}
                  onPress={() => router.push('/(tabs)/categories' as any)}
                >
                  <Text style={styles.exploreMiniBtnText}>Explore Verified Artisans</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* 2. Saved Goods & Ads Section */}
        {(activeTab === 'all' || activeTab === 'ads') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Saved Ads & Goods ({savedListings.length})
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/index' as any)}>
                <Text style={styles.sectionActionText}>Browse Ads</Text>
              </Pressable>
            </View>

            {savedListings.length > 0 ? (
              <View style={styles.cardsList}>
                {savedListings.map((item) => {
                  if (item.isSold || item.status === 'Sold') {
                    return (
                      <View key={item.id} style={styles.soldAdCard}>
                        <Pressable
                          style={styles.soldAdTopRow}
                          onPress={() => router.push(`/listing/${item.id}` as any)}
                        >
                          <View style={styles.soldThumbWrapper}>
                            <Image source={{ uri: item.images[0] }} style={styles.adThumb} contentFit="cover" />
                            <View style={styles.soldOutBadge}>
                              <Text style={styles.soldOutBadgeText}>SOLD OUT</Text>
                            </View>
                          </View>

                          <View style={styles.soldAdInfo}>
                            <View style={styles.soldPriceRow}>
                              <Text style={styles.soldPriceText}>
                                {item.currency || 'GH₵'}{item.price.toLocaleString()}
                              </Text>
                              <Pressable onPress={() => removeListing(item.id)} style={styles.soldHeartBtn}>
                                <Heart size={16} color="#EA580C" fill="#EA580C" />
                              </Pressable>
                            </View>

                            <Text style={styles.adTitle} numberOfLines={1}>
                              {item.title}
                            </Text>

                            <View style={styles.adLocationRow}>
                              <MapPin size={11} color="#64748B" />
                              <Text style={styles.adLocationText} numberOfLines={1}>
                                {item.location.neighborhood}, {item.location.city}
                              </Text>
                            </View>

                            <View style={styles.soldNoticeRow}>
                              <AlertCircle size={11} color="#EF4444" />
                              <Text style={styles.soldNoticeText} numberOfLines={1}>
                                {item.soldNotice || 'Listing closed by seller yesterday'}
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        <View style={styles.soldActionsRow}>
                          <Pressable
                            style={styles.findSimilarBtn}
                            onPress={() => router.push('/(tabs)/categories' as any)}
                          >
                            <Search size={13} color="#C2410C" />
                            <Text style={styles.findSimilarBtnText}>Find Similar Deals</Text>
                          </Pressable>

                          <Pressable
                            style={styles.soldTrashBtn}
                            onPress={() => removeListing(item.id)}
                          >
                            <Trash2 size={15} color="#64748B" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <Pressable
                      key={item.id}
                      style={styles.adCard}
                      onPress={() => router.push(`/listing/${item.id}` as any)}
                    >
                      <View style={styles.adThumbWrapper}>
                        <Image source={{ uri: item.images[0] }} style={styles.adThumb} contentFit="cover" />
                        {item.condition ? (
                          <View style={styles.adConditionBadge}>
                            <Text style={styles.adConditionText}>{item.condition}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.adInfo}>
                        <View style={styles.adPriceRow}>
                          <Text style={styles.adPriceText}>
                            {item.currency || 'GH₵'} {item.price.toLocaleString()}
                          </Text>
                          <Pressable style={styles.removeAdBtn} onPress={() => removeListing(item.id)}>
                            <Trash2 size={14} color="#94A3B8" />
                          </Pressable>
                        </View>

                        <Text style={styles.adTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        <View style={styles.adLocationRow}>
                          <MapPin size={11} color="#64748B" />
                          <Text style={styles.adLocationText} numberOfLines={1}>
                            {item.location.neighborhood}, {item.location.city}
                          </Text>
                        </View>

                        <View style={styles.adActionsRow}>
                          <Pressable
                            style={styles.adChatBtn}
                            onPress={() => router.push('/chat/conv-1' as any)}
                          >
                            <Text style={styles.adChatBtnText}>Chat</Text>
                          </Pressable>

                          <Pressable
                            style={styles.adCallBtn}
                            onPress={() => router.push(`/listing/${item.id}` as any)}
                          >
                            <Text style={styles.adCallBtnText}>Call</Text>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <ShoppingBag size={24} color="#94A3B8" />
                <Text style={styles.emptyCardTitle}>No saved ads yet</Text>
                <Text style={styles.emptyCardSub}>
                  Tap the heart icon on any ad to bookmark it here
                </Text>
                <Pressable
                  style={styles.exploreMiniBtn}
                  onPress={() => router.push('/(tabs)/index' as any)}
                >
                  <Text style={styles.exploreMiniBtnText}>Explore Marketplace</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {totalCount === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Bookmark size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>
              Save marketplace listings and bookmark local Ghanaian artisans to access them anytime.
            </Text>
            <Pressable
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/index' as any)}
            >
              <ShoppingBag size={16} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>Explore Marketplace</Text>
            </Pressable>
          </View>
        )}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    gap: 20,
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0F172A',
  },
  sectionActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  cardsList: {
    gap: 10,
  },
  artisanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  artisanMain: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  artisanAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    padding: 1,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artisanName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  unbookmarkBtn: {
    padding: 2,
  },
  artisanRole: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
  },
  artisanActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  bookServiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookServiceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatDirectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  chatDirectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  emptyCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  emptyCardSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  exploreMiniBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  exploreMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  adThumbWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  adThumb: {
    width: '100%',
    height: '100%',
  },
  adConditionBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  adConditionText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  adPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  removeAdBtn: {
    padding: 2,
  },
  adTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  adLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  adLocationText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  adActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  adChatBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  adChatBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  adCallBtn: {
    flex: 1,
    backgroundColor: '#EA580C',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  adCallBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  soldAdCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  soldAdTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  soldThumbWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutBadge: {
    position: 'absolute',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soldOutBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  soldAdInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  soldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soldPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5C4D44',
    textDecorationLine: 'line-through',
  },
  soldHeartBtn: {
    padding: 2,
  },
  soldNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  soldNoticeText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  soldActionsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  findSimilarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2F6',
    paddingVertical: 7,
    borderRadius: 10,
  },
  findSimilarBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  soldTrashBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingsCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookingsCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookingsCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  bookingsCardAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
});
