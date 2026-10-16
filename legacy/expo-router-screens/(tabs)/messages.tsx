import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Search,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react-native';
import { INITIAL_CONVERSATIONS } from '../../src/lib/listingData';

export default function MessagesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'buying' | 'selling'>('all');

  const filteredConversations = INITIAL_CONVERSATIONS.filter((c) =>
    c.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
    c.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages & Offers</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats by seller or item..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          <Pressable
            style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.tabBtnText, filterTab === 'all' && styles.tabBtnTextActive]}>
              All ({INITIAL_CONVERSATIONS.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, filterTab === 'buying' && styles.tabBtnActive]}
            onPress={() => setFilterTab('buying')}
          >
            <Text style={[styles.tabBtnText, filterTab === 'buying' && styles.tabBtnTextActive]}>
              Buying
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, filterTab === 'selling' && styles.tabBtnActive]}
            onPress={() => setFilterTab('selling')}
          >
            <Text style={[styles.tabBtnText, filterTab === 'selling' && styles.tabBtnTextActive]}>
              Selling
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredConversations.length > 0 ? (
          <View style={styles.convList}>
            {filteredConversations.map((conv) => (
              <Pressable
                key={conv.id}
                style={styles.convCard}
                onPress={() => router.push(`/chat/${conv.id}` as any)}
              >
                {/* User Avatar with Online Indicator */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: conv.otherUser.avatar }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  {conv.otherUser.online && <View style={styles.onlineDot} />}
                </View>

                {/* Content */}
                <View style={styles.convContent}>
                  <View style={styles.nameRow}>
                    <View style={styles.userNameWrapper}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {conv.otherUser.name}
                      </Text>
                      {conv.otherUser.isVerified && (
                        <CheckCircle size={12} color="#16A34A" />
                      )}
                    </View>
                    <Text style={styles.timeText}>{conv.lastMessageTime}</Text>
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {conv.listingTitle} • ${conv.listingPrice}
                  </Text>

                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {conv.lastMessage}
                  </Text>
                </View>

                {/* Listing thumbnail & unread badge */}
                <View style={styles.rightColumn}>
                  <Image
                    source={{ uri: conv.listingImage }}
                    style={styles.listingThumb}
                    contentFit="cover"
                  />
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MessageSquare size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No messages found</Text>
            <Text style={styles.emptySub}>
              Find a deal you like and tap "Chat with Seller" to make an offer.
            </Text>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#EA580C',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  convList: {
    gap: 10,
  },
  convCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
    marginBottom: 3,
  },
  lastMsg: {
    fontSize: 12,
    color: '#64748B',
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  listingThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  unreadBadge: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
