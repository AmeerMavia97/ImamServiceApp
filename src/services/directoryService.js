import { FEE_RANGES } from '@/constants/options';
import { supabase, unwrap } from './supabase';

// The registered (and approved) Imams and Masjids shown on Home. The database function
// get_directory returns only public columns (no mobile / email) — see supabase/schema.sql.
const mapEntry = (row) => ({
  id: row.id,
  role: row.role,
  name: row.full_name, // the Imam, or the Masjid's contact person
  city: row.city,
  address: row.address, // Imam: area. Masjid: address / location
  masjidName: row.masjid_name,
  experience: row.experience ?? [],
  languages: row.languages ?? [],
  fee: row.fee,
  openingTime: row.opening_time,
  closingTime: row.closing_time,
  photoUrl: row.photo_url,
});

// role: 'imam' | 'masjid'. city filters both; experience, language and fee (a key of FEE_RANGES)
// only apply to Imams.
export async function getDirectory({ role, city = '', experience = '', language = '', fee = '' }) {
  const range = FEE_RANGES.find((r) => r.value === fee);
  const rows = unwrap(
    await supabase.rpc('get_directory', {
      p_role: role,
      p_city: city,
      p_experience: experience,
      p_language: language,
      p_min_fee: range ? range.min : null,
      p_max_fee: range ? range.max : null,
    })
  );
  return rows.map(mapEntry);
}
