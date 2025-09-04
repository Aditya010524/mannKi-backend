import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function DeleteAccountScreen() {
  const { user, deleteAccount } = useAuth();
const [confirmDelete , setConfirmDelete] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    if (!password || confirmDelete !== 'DELETE') {
      Alert.alert('Error', 'Please enter your password and type DELETE correctly.');
      return;
     
    }

    setIsSubmitting(true);
    try {
      await deleteAccount(password,confirmDelete); // implement API call in useAuth
      Alert.alert(
        'Account Scheduled for Deletion',
        'Your account has been deactivated and will be permanently deleted in 30 days if not recovered.',
        [
          { text: 'OK', onPress: () => router.replace('/login') } // redirect to login/welcome
        ]
      );
    } catch (error: any) {
      console.error('Delete error:', error);
      Alert.alert('Error', error.message || 'Failed to schedule account deletion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-text">Delete Account</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Text className="text-base text-secondaryText mb-6">
          Deleting your account will **deactivate it immediately**. If you do not log in within 30 days, your account will be **permanently deleted**. This action cannot be undone.
        </Text>

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Input
          label="Type DELETE to confirm"
          placeholder="DELETE"
          value={confirmDelete}
        onChangeText={(text) => setConfirmDelete(text.toUpperCase())}


        />

        <View className="mt-6">
          <Button
            title="Delete Account"
            onPress={handleDelete}
            loading={isSubmitting}
            disabled={isSubmitting || confirmDelete !== 'DELETE' || !password}
            fullWidth
           
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
