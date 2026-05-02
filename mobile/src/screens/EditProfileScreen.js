import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }) {
  const { user } = useUser();
  const theme = useTheme();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [birthday, setBirthday] = useState(user?.unsafeMetadata?.birthday || '');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-format birthday
  const handleBirthdayChange = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 4) + '-' + cleaned.substring(4);
    }
    if (cleaned.length > 6) {
      formatted = formatted.substring(0, 7) + '-' + cleaned.substring(6, 8);
    }
    setBirthday(formatted);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Helper to convert URI to Blob robustly
  const getBlobFromUri = async (uri) => {
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.error('getBlobFromUri Error:', e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Update text fields and metadata
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          birthday
        }
      });

      // 2. Upload image if selected
      if (imageUri) {
        const blob = await getBlobFromUri(imageUri);
        await user.setProfileImage({ file: blob });
      }

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Update Profile Error:', err);
      Alert.alert('Error', err.errors?.[0]?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {imageUri || user?.imageUrl ? (
              <Avatar.Image size={100} source={{ uri: imageUri || user?.imageUrl }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={100} label={firstName?.[0] || '?'} style={styles.avatar} />
            )}
            <View style={styles.editIconContainer}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text variant="bodySmall" style={styles.avatarHint}>Tap to change picture</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Birthday (YYYY-MM-DD)"
            value={birthday}
            onChangeText={handleBirthdayChange}
            mode="outlined"
            keyboardType="numeric"
            maxLength={10}
            style={styles.input}
          />
        </View>

      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { backgroundColor: '#E50914' },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E50914',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0D'
  },
  avatarHint: { color: '#666', marginTop: 12 },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  footer: { padding: 24, paddingBottom: 36, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  saveButton: { borderRadius: 8 }
});
