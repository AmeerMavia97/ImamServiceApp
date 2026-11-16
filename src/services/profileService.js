import { supabase } from './supabase';

// base64 text -> bytes (works on the phone and on web).
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Uploads a profile / Masjid photo ({ base64, mimeType } from utils/imagePicker) to the public
// `avatars` bucket and saves its link on the profile. The storage rules only allow a person to
// write inside their own folder (<user id>/). Returns the public link.
export async function uploadAvatar(userId, { base64, mimeType = 'image/jpeg' }) {
  const isPng = mimeType === 'image/png';
  const path = `${userId}/avatar-${Date.now()}.${isPng ? 'png' : 'jpg'}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, base64ToArrayBuffer(base64), { contentType: isPng ? 'image/png' : 'image/jpeg', upsert: true });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const { error: updateError } = await supabase.from('profiles').update({ photo_url: data.publicUrl }).eq('id', userId);
  if (updateError) throw new Error(updateError.message);

  return data.publicUrl;
}
