import { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  imageUri: string | null | undefined; // data URI or remote URL
  onChange: (dataUri: string) => Promise<void> | void;
  size?: number;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
}

/** A circular, tappable photo — pick from library or take a new one, like a profile picture. */
export default function ImagePickerAvatar({ imageUri, onChange, size = 64, placeholderIcon = 'image-outline' }: Props) {
  const [uploading, setUploading] = useState(false);

  const handlePickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.base64) return;
    const mime = asset.mimeType || 'image/jpeg';
    const dataUri = `data:${mime};base64,${asset.base64}`;
    setUploading(true);
    try {
      await onChange(dataUri);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to save photo');
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to pick a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePickedAsset(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePickedAsset(result.assets[0]);
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (index) => { if (index === 1) takePhoto(); else if (index === 2) pickFromLibrary(); }
      );
    } else {
      Alert.alert('Add photo', undefined, [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <TouchableOpacity onPress={openPicker} disabled={uploading} style={[s.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[s.image, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[s.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Ionicons name={placeholderIcon} size={size * 0.4} color="#9CA3AF" />
        </View>
      )}
      <View style={s.cameraBadge}>
        {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={13} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { position: 'relative' },
  image: { backgroundColor: '#F3F4F6' },
  placeholder: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  cameraBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
});
