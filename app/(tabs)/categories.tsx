import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Wrench,
  Sparkles,
  ArrowRight,
  Tag,
  ShieldCheck,
} from 'lucide-react-native';
import { CATEGORIES } from '../../src/lib/listingData';

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selected?: string }>();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(params.selected || 'cat-5');

  const filteredCategories = CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subcategories.some((sub) => sub.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <Text style={styles.headerSubtitle}>
          Explore goods, verified vehicles, rentals and artisan services
        </Text>

        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories & services..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Categories List */}
        <View style={styles.categoriesList}>
          {filteredCategories.map((cat) => {
            const isExpanded = expandedId === cat.id;

            return (
              <View key={cat.id} style={styles.categoryItem}>
                <Pressable
                  style={styles.categoryHeader}
                  onPress={() => setExpandedId(isExpanded ? null : cat.id)}
                >
                  <View style={[styles.iconBox, { backgroundColor: cat.bgLight }]}>
                    <Tag size={20} color={cat.color} />
                  </View>

                  <View style={styles.categoryInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.catName}>{cat.name}</Text>
                      {cat.id === 'cat-1' || cat.id === 'cat-3' ? (
                        <View style={styles.hotBadge}>
                          <Sparkles size={10} color="#EA580C" />
                          <Text style={styles.hotBadgeText}>Hot</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.catCount}>{cat.count}+ ads available</Text>
                  </View>

                  {isExpanded ? (
                    <ChevronDown size={20} color="#64748B" />
                  ) : (
                    <ChevronRight size={20} color="#94A3B8" />
                  )}
                </Pressable>

                {/* Subcategories Accordion */}
                {isExpanded && (
                  <View style={styles.subcategoriesContainer}>
                    {cat.subcategories.map((sub, index) => (
                      <Pressable
                        key={index}
                        style={styles.subItem}
                        onPress={() =>
                          router.push({
                            pathname: '/(tabs)/index',
                            params: { category: cat.slug, subcategory: sub },
                          } as any)
                        }
                      >
                        <Text style={styles.subItemText}>{sub}</Text>
                        <ChevronRight size={14} color="#CBD5E1" />
                      </Pressable>
                    ))}

                    <Pressable
                      style={styles.viewAllCategoryBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/index',
                          params: { category: cat.slug },
                        } as any)
                      }
                    >
                      <Text style={styles.viewAllText}>View All in {cat.name}</Text>
                      <ArrowRight size={14} color="#EA580C" />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Safe Trading Notice */}
        <View style={styles.footerNotice}>
          <ShieldCheck size={20} color="#64748B" />
          <Text style={styles.footerNoticeText}>
            All ad listings are reviewed for compliance with Haraka Community Guidelines.
          </Text>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  artisanBanner: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 18,
  },
  artisanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  artisanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  artisanTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },
  artisanSub: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 16,
    marginBottom: 12,
  },
  artisanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  artisanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoriesList: {
    gap: 10,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  catCount: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  subcategoriesContainer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  viewAllCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  footerNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});
