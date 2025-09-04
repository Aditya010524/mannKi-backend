import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';


export default function ChangePasswordScreen() {
  const {changePassword} = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChangePassword = async () => {
    if (!validate()) return;
  try {
      setIsSubmitting(true);
    
    
  const response = await changePassword(currentPassword, newPassword, confirmPassword);
         
       console.log(response)

   
     
      
      Alert.alert(
        'Password Changed',
        'Your password has been successfully changed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    
  } catch (error) {
   
    
  }  
  finally{
    setIsSubmitting(false);
  }
  
 
  };
  
  return (
    <KeyboardAvoidingView
     className='flex-1 bg-background'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text className='text-xl font-semibold'>Change password</Text>
        
        <View className='w-6' />
      </View>
      
      <ScrollView className='flex-1' contentContainerClassName='p-4'>
        <Text className='text-base text-secondaryText mb-6'>
          Enter your current password and a new password to change your password.
        </Text>
        
        <View className='w-full'>
          <Input
            label="Current password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (errors.currentPassword) {
                setErrors({ ...errors, currentPassword: undefined });
              }
            }}
            isPassword
            error={errors.currentPassword}
          />
          
          <Input
            label="New password"
            placeholder="Enter your new password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword });
              }
            }}
            isPassword
            error={errors.newPassword}
          />
          
          <Input
            label="Confirm new password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword });
              }
            }}
            isPassword
            error={errors.confirmPassword}
          />
          
        <View className='mt-6'>
            <Button
            title="Change password"
            onPress={handleChangePassword}
            loading={isSubmitting}
            disabled ={isSubmitting}
            fullWidth
           
          />
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

