import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, updateUser, isLoading } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateUser({
        name,
        bio,
        location,
        website,
        profilePic,
        coverPhoto,
      });
      
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
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
      setProfilePic(result.assets[0].uri);
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit profile</Text>
        
        <Button
          title="Save"
          onPress={handleSave}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.coverPhotoContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
          
          <TouchableOpacity style={styles.editCoverButton} onPress={pickCoverImage}>
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          
          <TouchableOpacity style={styles.editProfilePicButton} onPress={pickProfileImage}>
            <Camera size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Add your name"
            value={name}
            onChangeText={setName}
          />
          
          <View style={styles.bioContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Add your bio"
              placeholderTextColor={colors.secondaryText}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={160}
            />
            <Text style={styles.charCount}>{bio.length}/160</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  coverPhotoContainer: {
    position: 'relative',
    height: 150,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  editCoverButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginTop: -40,
    marginLeft: 16,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.background,
  },
  editProfilePicButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: 16,
    marginTop: 40,
  },
  bioContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.secondaryText,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});