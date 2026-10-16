import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Search,
  MapPin,
  Bell,
  Heart,
  CheckCircle,
  User,
  SlidersHorizontal,
  Car,
  CarFront,
  Home,
  Smartphone,
  Laptop,
  Shirt,
  Armchair,
  Sofa,
  TrendingUp,
  ArrowRight,
  Check,
  X,
} from 'lucide-react-native';
import { CATEGORIES, INITIAL_LISTINGS, Listing } from '../../src/lib/listingData';

const GHANA_16_REGIONS = [
  { id: 'all', name: 'All Regions in Ghana' },
  { id: 'Greater Accra', name: 'Greater Accra' },
  { id: 'Ashanti', name: 'Ashanti' },
  { id: 'Western', name: 'Western' },
  { id: 'Western North', name: 'Western North' },
  { id: 'Central', name: 'Central' },
  { id: 'Eastern', name: 'Eastern' },
  { id: 'Volta', name: 'Volta' },
  { id: 'Oti', name: 'Oti' },
  { id: 'Northern', name: 'Northern' },
  { id: 'Savannah', name: 'Savannah' },
  { id: 'North East', name: 'North East' },
  { id: 'Upper East', name: 'Upper East' },
  { id: 'Upper West', name: 'Upper West' },
  { id: 'Bono', name: 'Bono' },
  { id: 'Bono East', name: 'Bono East' },
  { id: 'Ahafo', name: 'Ahafo' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'budget' | 'new'>('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'vehicles':
        return <CarFront size={22} color="#1E293B" strokeWidth={2} />;
      case 'property':
        return <Home size={22} color="#1E293B" strokeWidth={2} />;
      case 'phones':
        return <Smartphone size={22} color="#1E293B" strokeWidth={2} />;
      case 'electronics':
        return <Laptop size={22} color="#1E293B" strokeWidth={2} />;
      case 'fashion':
        return <Shirt size={22} color="#1E293B" strokeWidth={2} />;
      case 'furniture':
        return <Sofa size={22} color="#1E293B" strokeWidth={2} />;
      default:
        return <Car size={22} color="#1E293B" strokeWidth={2} />;
    }
  };

  const filteredListings = INITIAL_LISTINGS.filter((item) => {
    // Filter based on location (Accra auto-detected, or everywhere / other region)
    if (selectedRegion !== 'all' && item.location.city.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      // Subcategory and synonym matches (e.g. cars -> vehicles)
      const isCarSearch = ['car', 'cars', 'auto', 'vehicle', 'vehicles', 'toyota', 'bmw', 'sedan', 'suv', 'motorcycle'].some(k => q.includes(k) || k.includes(q));
      const isPhoneSearch = ['phone', 'phones', 'iphone', 'apple', 'samsung', 'tablet', 'ipad', 'smartwatch'].some(k => q.includes(k) || k.includes(q));
      const isLaptopSearch = ['laptop', 'laptops', 'macbook', 'computer', 'pc', 'tv', 'camera', 'gaming', 'ps5'].some(k => q.includes(k) || k.includes(q));
      const isPropertySearch = ['house', 'houses', 'rent', 'apartment', 'apartments', 'land', 'plot', 'flat'].some(k => q.includes(k) || k.includes(q));
      const isFashionSearch = ['shoe', 'shoes', 'clothing', 'clothes', 'shirt', 'dress', 'watch', 'bag'].some(k => q.includes(k) || k.includes(q));
      const isFurnitureSearch = ['sofa', 'couch', 'bed', 'mattress', 'chair', 'table', 'furniture'].some(k => q.includes(k) || k.includes(q));

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.subcategory?.toLowerCase().includes(q) ||
        item.location.city.toLowerCase().includes(q) ||
        (isCarSearch && item.category === 'vehicles') ||
        (isPhoneSearch && item.category === 'phones') ||
        (isLaptopSearch && item.category === 'electronics') ||
        (isPropertySearch && item.category === 'property') ||
        (isFashionSearch && item.category === 'fashion') ||
        (isFurnitureSearch && item.category === 'furniture');

      if (!matchesSearch) return false;
    }

    if (activeFilter === 'verified') return item.isVerifiedDeal;
    if (activeFilter === 'budget') return item.price <= 5000;
    if (activeFilter === 'new') return item.condition === 'Brand New' || item.condition === 'Like New';

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Header matching exact screenshot */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Logo badge with Haraka text & auto-detected location moved close to logo */}
          <View style={styles.brandRow}>
            <Image
              source={{ uri: '/logo_haraka.png' }}
              style={styles.brandLogoImg}
              contentFit="contain"
            />
            {/* Location indicator beside logo (static indicator, not clickable, no dropdown icon) */}
            <View style={styles.locationSelector}>
              <MapPin size={15} color="#059669" />
              <Text style={styles.locationText}>
                {selectedRegion === 'all' ? 'Accra' : selectedRegion}
              </Text>
            </View>
          </View>

          {/* Right Icons: Notification Bell & Profile Avatar (no background) */}
          <View style={styles.headerActions}>
            <Pressable
              style={styles.bellBtn}
              onPress={() => router.push('/notifications' as any)}
            >
              <Bell size={22} color="#0F172A" />
            </Pressable>

            {/* Profile Avatar shows user profile instead */}
            <Pressable
              style={styles.profileAvatar}
              onPress={() => router.push('/(tabs)/profile' as any)}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }}
                style={styles.profileAvatarImg}
                contentFit="cover"
              />
            </Pressable>
          </View>
        </View>

        {/* Search Bar & Filter Button in the same row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder={selectedRegion === 'all' ? 'Search everywhere in Ghana' : `Search in ${selectedRegion} & all Ghana`}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* Filter button: JUST an icon, with soft circular background matching image 2 */}
          <Pressable
            style={styles.filterBtn}
            onPress={() => setShowRegionModal(true)}
            accessibilityLabel="Filter by Region"
          >
            <SlidersHorizontal size={18} color="#1E293B" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
      >
        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => router.push('/(tabs)/categories' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {/* 6 Category Icons in horizontal layout */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.catItem}
                onPress={() => router.push({ pathname: '/(tabs)/categories', params: { selected: cat.slug } } as any)}
              >
                <View style={styles.catIconSquare}>
                  {getCategoryIcon(cat.slug)}
                </View>
                <Text style={styles.catLabel}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Role-Specific Callout Banner with 3D Marketplace image */}
        <View style={styles.artisanBanner}>
          <Image
            source={{ uri: '/welcome_hero_trans.png' }}
            style={styles.artisanBgImage}
            contentFit="contain"
          />
          <View style={styles.artisanContent}>
            <Text style={styles.artisanTitle}>Grow Your Store & Post Ads</Text>
            <Text style={styles.artisanDesc}>
              Reach thousands of buyers in Accra with zero commission. Post your deals now!
            </Text>

            <Pressable
              style={styles.registerTodayBtn}
              onPress={() => router.push('/post-ad/step1' as any)}
            >
              <Text style={styles.registerTodayText}>Post an Ad Now</Text>
              <ArrowRight size={14} color="#EA580C" />
            </Pressable>
          </View>
        </View>

        {/* Quick Filter Pills matching screenshot */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          <Pressable
            style={[styles.pill, activeFilter === 'all' && styles.pillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.pillText, activeFilter === 'all' && styles.pillTextActive]}>
              All
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeFilter === 'verified' && styles.pillActive]}
            onPress={() => setActiveFilter('verified')}
          >
            <CheckCircle size={14} color={activeFilter === 'verified' ? '#FFFFFF' : '#059669'} />
            <Text style={[styles.pillText, activeFilter === 'verified' && styles.pillTextActive]}>
              Verified Only
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeFilter === 'budget' && styles.pillActive]}
            onPress={() => setActiveFilter('budget')}
          >
            <Text style={[styles.pillText, activeFilter === 'budget' && styles.pillTextActive]}>
              Under GH₵1,000
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pill, activeFilter === 'new' && styles.pillActive]}
            onPress={() => setActiveFilter('new')}
          >
            <Text style={[styles.pillText, activeFilter === 'new' && styles.pillTextActive]}>
              New Today
            </Text>
          </Pressable>
        </ScrollView>

        {/* Trending Today Section matching screenshot */}
        <View style={styles.trendingHeader}>
          <View style={styles.trendingTitleRow}>
            <TrendingUp size={18} color="#EA580C" strokeWidth={2.5} />
            <Text style={styles.trendingTitle}>Trending Today</Text>
          </View>
          <Text style={styles.nearbyCountText}>
            {filteredListings.length} items in {selectedRegion === 'all' ? 'All Ghana' : selectedRegion}
          </Text>
        </View>

        {/* Listings 2-Column Grid */}
        <View style={styles.grid}>
          {filteredListings.map((item) => {
            const isSaved = savedIds.includes(item.id);
            return (
              <Pressable
                key={item.id}
                style={styles.listingCard}
                onPress={() => router.push(`/listing/${item.id}` as any)}
              >
                {/* Image Container with Badges */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.listingImage}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Top Left Verified Pill */}
                  <View style={styles.verifiedTag}>
                    <CheckCircle size={11} color="#FFFFFF" />
                    <Text style={styles.verifiedTagText}>VERIFIED</Text>
                  </View>

                  {/* Product Condition overlaid directly on the product image */}
                  {item.condition && (
                    <View style={styles.conditionTag}>
                      <Text style={styles.conditionTagText}>{item.condition}</Text>
                    </View>
                  )}

                  {/* Top Right Heart button with transparent background */}
                  <Pressable
                    style={styles.heartBtn}
                    onPress={() => toggleSave(item.id)}
                  >
                    <Heart
                      size={18}
                      color={isSaved ? '#DC2626' : '#FFFFFF'}
                      fill={isSaved ? '#DC2626' : 'transparent'}
                    />
                  </Pressable>
                </View>

                {/* Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.priceText}>
                    {item.currency} {item.price.toLocaleString()}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.cardLocationRow}>
                    <MapPin size={11} color="#94A3B8" />
                    <Text style={styles.cardLocationText} numberOfLines={1}>
                      {item.location.neighborhood}, {item.location.city}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 16 Ghana Regions Selection Sheet */}
      <Modal
        visible={showRegionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowRegionModal(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Select Region</Text>
                <Text style={styles.sheetSubtitle}>16 Regions in Ghana</Text>
              </View>
              <Pressable
                onPress={() => setShowRegionModal(false)}
                hitSlop={8}
                style={styles.sheetCloseBtn}
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {GHANA_16_REGIONS.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                return (
                  <Pressable
                    key={reg.id}
                    style={styles.regionRow}
                    onPress={() => {
                      setSelectedRegion(reg.id);
                      setShowRegionModal(false);
                    }}
                  >
                    <View style={styles.regionLeft}>
                      <MapPin
                        size={16}
                        color={isSelected ? '#EA580C' : '#94A3B8'}
                      />
                      <Text
                        style={[
                          styles.regionText,
                          isSelected && styles.regionTextSelected,
                        ]}
                      >
                        {reg.name}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color="#EA580C" strokeWidth={2.5} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoImg: {
    width: 44,
    height: 44,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  profileAvatar: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  profileAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
    gap: 10,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoriesSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  categoriesRow: {
    paddingHorizontal: 12,
    gap: 8,
  },
  catItem: {
    alignItems: 'center',
    width: 68,
  },
  catIconSquare: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  artisanBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    overflow: 'hidden',
    position: 'relative',
  },
  artisanBgImage: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 135,
    height: 135,
  },
  artisanContent: {
    padding: 16,
    paddingRight: 70,
    zIndex: 2,
  },
  artisanBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  artisanBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  artisanTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artisanDesc: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
    marginBottom: 12,
  },
  registerTodayBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  registerTodayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  trendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  nearbyCountText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  listingCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  verifiedTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardDetails: {
    padding: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 16,
    marginBottom: 6,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardLocationText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '75%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  sheetCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  sheetList: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  regionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  regionTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
