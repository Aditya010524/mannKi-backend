import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link } from 'expo-router';
import { Twitter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSignup = async () => {
  if (!validate()) return;

  setErrors({}); // Clear any previous errors

  try {
    await signup({ name, username, email, password });
   
  } catch (error: any) {
    const fieldErrors: typeof errors = {};

    // ✅ First check for structured backend field errors
    if (error?.response?.data?.errors) {
      error.response.data.errors.forEach((err: any) => {
        const field = err.path;
        const msg = err.msg;
        if (field && msg) {
          fieldErrors[field as keyof typeof fieldErrors] = msg;
        }
      });
    }

    // ✅ Fallback: if backend sent a message (e.g., "Username already taken")
    else if (error?.response?.data?.message) {
      const msg = error.response.data.message.toLowerCase();

      if (msg.includes('username')) {
        fieldErrors.username = error.response.data.message;
      } else if (msg.includes('email')) {
        fieldErrors.email = error.response.data.message;
      } else {
        fieldErrors.general = error.response.data.message;
      }
    }

    // ✅ Final fallback
    else if (error.message) {
      fieldErrors.general = error.message;
    } else {
      fieldErrors.general = 'Signup failed. Please try again.';
    }

    setErrors(fieldErrors);
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Twitter size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Create your account</Text>

        {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}

        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            label="Username"
            placeholder="Choose a username (e.g., vineel_123)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            error={errors.username}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />
          <Button
            title="Sign up"
            onPress={handleSignup}
            loading={isLoading}
            fullWidth
            style={styles.signupButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Link href="/login" asChild>
              <Text style={styles.loginLink}>Log in</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  generalError: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  form: {
    marginBottom: 24,
  },
  signupButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.secondaryText,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '500',
  },
});
