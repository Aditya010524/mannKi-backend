import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Laptop, MapPin, Smartphone, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: string;
  device: string;
  ip: string;
  location?: string;
  lastActive: string;
  current?: boolean;
}

export default function ActiveSessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeSessions } = useAuth();

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await activeSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
        console.log('sessions 22',response.data);
       
      }
    } catch (error) {
      console.error("❌ Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Terminate single session
  const handleTerminate = async (sessionId: string) => {
    Alert.alert(
      "End Session",
      "Are you sure you want to terminate this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Terminate",
          style: "destructive",
          onPress: async () => {
            const response = await apiService.delete(
              `${API_ENDPOINTS.ACTIVE_SESSIONS}/${sessionId}`
            );
            if (response.success) {
              setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            } else {
              Alert.alert("Error", response.error || "Failed to terminate session.");
            }
          },
        },
      ]
    );
  };

  // Terminate all sessions
  const handleTerminateAll = async () => {
    Alert.alert(
      "End All Sessions",
      "This will log you out from all devices. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Terminate All",
          style: "destructive",
          onPress: async () => {
            const response = await apiService.delete(API_ENDPOINTS.ACTIVE_SESSIONS);
            if (response.success) {
              setSessions([]);
            } else {
              Alert.alert("Error", response.error || "Failed to terminate all sessions.");
            }
          },
        },
      ]
    );
  };

 return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-card">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Active Sessions</Text>
        <View className="w-6" />
      </View>

      {/* Sessions List */}
      <FlatList
        data={sessions}
        refreshing={loading}
        onRefresh={fetchSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mx-4 my-2 rounded-2xl border ">
            <View className="flex-row justify-between items-start">
              {/* Device Info */}
              <View className="flex-1 p-4">
                <View className="flex-row items-center mb-1">
                  <Laptop size={16} color={colors.primary} className="mr-1" />
                  <Text className="text-base font-semibold">{item.device}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <Laptop size={16} color={colors.primary} className="mr-1" />
                  <Text className="text-base font-semibold">{item.userAgent}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <MapPin size={14} color={colors.secondaryText} className="mr-1" />
                  <Text className="text-sm text-secondaryText">
                    {item.location || "Unknown"} • {item.ip}
                  </Text>
                </View>
                <Text className="text-xs text-secondaryText">
                  Last active: {item.lastUsed}
                </Text>

                {item.current && (
                  <View className="mt-2 px-2 py-1 rounded-full bg-green-100 self-start">
                    <Text className="text-xs font-medium text-green-600">
                      This device
                    </Text>
                  </View>
                )}
              </View>

              {/* Terminate Button */}
              {!item.current && (
                <TouchableOpacity
                  onPress={() => handleTerminate(item.id)}
                  className="p-2"
                >
                  <XCircle size={22} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-secondaryText text-sm">
                No active sessions
              </Text>
            </View>
          )
        }
      />

      {/* Terminate All Button */}
      {sessions.length > 0 && (
        <View className="p-4 border-t border-border bg-card">
          <Button
            title="Log out of all sessions"
            onPress={handleTerminateAll}
            fullWidth
            destructive
          />
        </View>
      )}
    </View>
  );
}
