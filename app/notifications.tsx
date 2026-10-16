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
  ArrowLeft,
  TrendingDown,
  MessageCircle,
  CheckCircle,
  ShieldCheck,
  CheckCheck,
  Bell,
} from 'lucide-react-native';
import { INITIAL_NOTIFICATIONS, NotificationItem } from '../src/lib/listingData';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown size={18} color="#059669" />;
      case 'message':
        return <MessageCircle size={18} color="#0284C7" />;
      case 'ad_approved':
        return <CheckCircle size={18} color="#4F46E5" />;
      case 'safety':
        return <ShieldCheck size={18} color="#7C3AED" />;
      default:
        return <Bell size={18} color="#475569" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'price_drop':
        return '#ECFDF5';
      case 'message':
        return '#F0F9FF';
      case 'ad_approved':
        return '#EEF2FF';
      case 'safety':
        return '#F5F3FF';
      default:
        return '#F1F5F9';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.markReadBtn} onPress={markAllAsRead}>
          <CheckCheck size={18} color="#475569" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {notifications.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.itemCard, !item.read && styles.itemCardUnread]}
              onPress={() => {
                if (item.listingId) {
                  router.push(`/listing/${item.listingId}` as any);
                }
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: getIconBg(item.type) }]}>
                {getIcon(item.type)}
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.dot} />}
                </View>

                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              )}
            </Pressable>
          ))}
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
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  list: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxUnread: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },
  body: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
});
