import * as ImagePicker from 'expo-image-picker';

// Opens the gallery and returns { uri, base64, mimeType } for a square-cropped photo, or null if
// the person cancelled. The photo comes back as base64 so it can be uploaded without reading the
// file again (reading a local file through fetch is unreliable on phones).
export async function pickPhoto() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  if (!asset.base64) throw new Error('Could not read the photo. Please try another one.');
  return { uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' };
}
