import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { ArrowLeft, Camera, User } from 'lucide-react-native'; // 2. Import User icon for placeholder
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();


  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Use useEffect to safely populate the form after user data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setAvatar(user.avatar || '');
      setCoverPhoto(user.coverPhoto || '');
    }
  }, [user]);

  // 5. REBUILT `handleSave` FOR OPTIONAL/PARTIAL UPDATES
  const handleSave = async () => {
    if (!user) return;

    const formData = new FormData();

    // Check each text field to see if it has changed
    if (displayName !== user.displayName) formData.append('displayName', displayName);
   
    if (bio !== user.bio) formData.append('bio', bio);
    if (location !== user.location) formData.append('location', location);
    if (website !== user.website) formData.append('website', website);

    // Check if a NEW avatar has been selected
    if (avatar && avatar !== user.avatar) {
      const fileName = avatar.split('/').pop() || 'profile.jpg';
      const fileType = fileName.split('.').pop() || 'jpeg';
      formData.append('avatar', {
        uri: avatar,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }

    // Check if a NEW cover photo has been selected
    if (coverPhoto && coverPhoto !== user.coverPhoto) {
      const fileName = coverPhoto.split('/').pop() || 'cover.jpg';
      const fileType = fileName.split('.').pop() || 'jpeg';
      formData.append('coverPhoto', {
        uri: coverPhoto,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }

    // Only call the API if something has actually changed
    if (formData._parts.length === 0) {
      console.log('No changes to save.');
      router.back();
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser(formData);
      router.back();
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  if (!user) return null; // Or a loading spinner

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
        <Text className="text-xl font-semibold text-text">Edit profile</Text>
        <Button
          title="Save"
          onPress={handleSave}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>

      <ScrollView className="flex-1">
        <View className="relative h-[150] bg-gray-300">
          {/* 6. FIX: Conditionally render Image or a placeholder to prevent crashes */}
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-border" /> // Placeholder color
          )}
          <TouchableOpacity
            className="absolute top-3 right-3 bg-black/60 rounded-full p-2"
            onPress={pickCoverImage}
          >
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        <View className="relative self-start mt-[-40] ml-4">
           {/* 7. FIX: Conditionally render Avatar Image or a placeholder */}
          {avatar ? (
             <Image source={{ uri: avatar }} className="w-[100] h-[100] rounded-full border-4 border-background" />
          ) : (
            <View className="w-[100] h-[100] rounded-full border-4 border-background bg-border items-center justify-center">
              <User size={40} color={colors.secondaryText} />
            </View>
          )}
          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-black/60 rounded-full p-2"
            onPress={pickProfileImage}
          >
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        <View className="mt-10 px-4">
          {/* 8. FIX: Connect input to the correct `displayName` state */}
          <Input
            label="Name"
            placeholder="Add your name"
            value={displayName}
            onChangeText={setDisplayName}
          />
         
          <View className="mb-4">
            <Text className="mb-2 text-md font-semibold text-text">Bio</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-text text-base min-h-[100] max-h-[200] align-top"
              placeholder="Add your bio"
              placeholderTextColor={colors.secondaryText}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={160}
            />
            <Text className="text-sm text-secondaryText self-end">{bio.length}/160</Text>
          </View>
          <Input
            label="Location"
            placeholder="Add your location"
            value={location}
            onChangeText={setLocation}
          />
          <Input
            label="Website"
            placeholder="Add your website"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}