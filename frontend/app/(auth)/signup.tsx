import React, { useState } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { Twitter } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

export default function SignupScreen() {
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
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

        if (msg.includes("username")) {
          fieldErrors.username = error.response.data.message;
        } else if (msg.includes("email")) {
          fieldErrors.email = error.response.data.message;
        } else {
          fieldErrors.general = error.response.data.message;
        }
      }

      // ✅ Final fallback
      else if (error.message) {
        fieldErrors.general = error.message;
      } else {
        fieldErrors.general = "Signup failed. Please try again.";
      }

      setErrors(fieldErrors);
    }
  };

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1 "
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center p-6">
        <View className="items-center mb-8">
          <Twitter size={40} color={colors.primary} />
        </View>

        <Text className="text-3xl font-bold text-center mb-4">
          Create your account
        </Text>

        {errors.general && (
          <Text style={styles.generalError}>{errors.general}</Text>
        )}

        <View className="mb-6">
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
          <View className="mt-4">
            <Button
              title="Sign up"
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              className="mt-4"
            />
          </View>
        </View>

        <View className="items-center">
          <Text className="text-secondaryText">
            Already have an account?{" "}
            <Link href="/login" asChild>
              <Text className="text-primary font-medium">Log in</Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
