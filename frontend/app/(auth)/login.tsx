import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Twitter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      const identifier = email;
      await login( identifier, password);
    } catch (error: any) {
      setErrors({ email: error.message || 'Invalid email or password' });
    }
  };

  return (
    <KeyboardAvoidingView
      className='bg-colors.background flex-1 p-6'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerClassName='flex-grow justify-center' >
        <View className='items-center mb-9'>
        
          <Twitter size={40} color={colors.primary} />
        </View>
        
        <Text className='text-colors.text text-2xl font-bold mb-4 text-center'>Log in to Mann</Text>
        
        <View className='space-y-4 mb-6' >
          <Input
            label="Email"
            placeholder="Enter your email or Username"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />
          
         <View className='mt-4'>
           <Button
            title="Log in"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            
          />
         </View>
          
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text className='text-primary text-center mt-4'>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        
        <View className='items-center' >
          <Text className='text-secondaryText text-center'>
            Don't have an account?{' '}
            <Link href="/signup" asChild>
              <Text className='text-primary font-medium'>Sign up</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
