import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, updateUser, isLoading } = useAuth();
  
  const [displayName, setdisplayName] = useState(user?.displayName || '');
  const [username, setuserName] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
const handleSave = async () => {
  if (!user) return;

  setIsSubmitting(true);

  try {
    const formData = new FormData();

    formData.append("displayName", displayName);
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("location", location);
    formData.append("website", website);

    // ✅ Use state directly instead of formData.get()
    if (avatar && avatar !== user.avatar) {
      const fileName = avatar.split('/').pop();
      const fileType = fileName?.split('.').pop();
      const avatarFile = {
        uri: avatar,
        name: fileName || 'profile.jpg',
        type: `image/${fileType || 'jpeg'}`,
      };

      formData.append("avatar", avatarFile as any);

      console.log("📷 avatar:");
      console.log("   • uri:", avatarFile.uri);
      console.log("   • name:", avatarFile.name);
      console.log("   • type:", avatarFile.type);
    } else {
      console.log("📷 avatar: not available");
    }

    if (coverPhoto && coverPhoto !== user.coverPhoto) {
      const fileName = coverPhoto.split('/').pop();
      const fileType = fileName?.split('.').pop();
      const coverPhotoFile = {
        uri: coverPhoto,
        name: fileName || 'cover.jpg',
        type: `image/${fileType || 'jpeg'}`,
      };

      formData.append("coverPhoto", coverPhotoFile as any);

      console.log("📷 coverPhoto:");
      console.log("   • uri:", coverPhotoFile.uri);
      console.log("   • name:", coverPhotoFile.name);
      console.log("   • type:", coverPhotoFile.type);
if(false){

}    else {
      console.log("📷 coverPhoto: not available");
    }
    }
    await updateUser(formData);
    router.back();
  } catch (error) {
    console.error("❌ Failed to update profile:", error);
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
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCoverPhoto(result.assets[0].uri);
    }
  };
  
  if (!user) return null;
  
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
        
        <Text className='text-xl font-semibold text-text'>Edit profile</Text>
        
        <Button
          title="Save"
          onPress={handleSave}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
      
      <ScrollView className='flex-1'>
        <View className='relative h-[150]'>
          <Image source={{ uri: coverPhoto }} className='w-full h-full' />
          
          <TouchableOpacity className='absolute top-3 right-3 bg-black/60 rounded-full p-2'  onPress={pickCoverImage}>
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        <View className='relative self-start mt-[-40] ml-4'>
          <Image source={{ uri: avatar }} className='w-[100] h-[100] rounded-full' />
          
          <TouchableOpacity className='absolute bottom-0 right-0 bg-black/60 rounded-full p-2' onPress={pickProfileImage}>
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        <View className='mt-10 px-4'>
          <Input
            label="Name"
            placeholder="Add your name"
            value={displayName}
            onChangeText={setdisplayName}
          />
          <Input
            label="Username"
            placeholder="Add your username"
            value={username}
            onChangeText={setuserName}
          />
          
          <View className='mb-4'>
            <Text className='mb-2 text-md font-semibold text-text'>Bio</Text>
            <TextInput
             className='border border-border rounded-lg p-3 text-text text-base min-h-[100] max-h-[200] align-top'
              placeholder="Add your bio"
              placeholderTextColor={colors.secondaryText}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={160}
            />
            <Text className='text-sm text-secondaryText align-self-end '>{bio.length}/160</Text>
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
