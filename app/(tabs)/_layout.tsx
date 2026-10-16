import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, MessageSquare, Plus, LayoutDashboard, Heart, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C2410C',
        tabBarInactiveTintColor: '#4B5563',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Explore (Home icon) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* 2. Messages */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />

      {/* 3. Central Button: Raised circular orange button (#FF6A00) - Plus for Seller/Buyer, Dashboard icon for Artisan/Admin */}
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post Ad / Dashboard',
          tabBarIcon: () => (
            <View style={styles.postButtonContainer}>
              <View style={styles.postButton}>
                <Plus size={30} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* 4. Saved (Heart icon) */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />

      {/* 5. Profile (User icon) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* Categories hidden from bottom bar, accessible via home 'View All' */}
      <Tabs.Screen
        name="categories"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EA580C',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    top: -2,
    right: -4,
  },
  postButtonContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6A00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
