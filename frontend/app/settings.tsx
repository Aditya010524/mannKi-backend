import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, LogOut, Lock, Bell, User, Shield, Moon, HelpCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };
  
  const navigateToChangePassword = () => {
    router.push('/change-password');
  };
  
  return (
    <View className='flex-1 bg-background'>
      <View className='flex-row items-center justify-between p-4 border-b border-border'>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text className='text-xl font-bold text-text'>Settings</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView className='flex-1' >
        <View className='border-b border-border py-4'>
          <Text className='text-lg font-bold text-text px-4 py-2'>Account</Text>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 'onPress={() => router.push('/edit-profile')}>
            <User size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Your account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 ' onPress={navigateToChangePassword}>
            <Lock size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Change password</Text>
          </TouchableOpacity>
        </View>
        
        <View className='border-b border-border py-4'>
          <Text className='text-lg font-bold text-text px-4 py-2'>Settings</Text>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 '>
            <Bell size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 '>
            <Shield size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Privacy and safety</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 '>
            <Moon size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Display</Text>
          </TouchableOpacity>
        </View>
        
        <View className='border-b border-border py-4'>
          <Text className='text-lg font-bold text-text px-4 py-2'>Support</Text>
          
          <TouchableOpacity className='flex-row items-center px-4 py-3 '>
            <HelpCircle size={20} color={colors.text} />
            <Text className='ml-5 text-lg  text-text'>Help Center</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className='flex-row items-center px-4 py-3 mt-4' onPress={handleLogout}>
          <LogOut size={20} color={colors.danger} />
          <Text className='ml-5 text-lg  text-danger'>Log out</Text>
        </TouchableOpacity>
        
        <Text className='text-center text-md text-secondaryText mt-4'>Twitter Clone v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
