import { Tabs } from "expo-router";
import { Home, Search, Bell, Mail, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { router, useRouter } from "expo-router";
import { useNotifications } from "@/hooks/useNotifications";
import { View, Text, StyleSheet } from "react-native";

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();
  const { fetchUnreadCount } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const routerInstance = useRouter();
  
  useEffect(() => {
    // Add a small delay to ensure the navigation system is ready
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/(auth)/login");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (user) {
      const loadUnreadCount = async () => {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      };
      
      loadUnreadCount();
      
      // Set up interval to check for new notifications
      const interval = setInterval(loadUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarShowLabel: false,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Search color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Bell color={color} size={24} />
              {unreadCount > 0 && !focused && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <Mail color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700' as const,
    paddingHorizontal: 4,
  },
});