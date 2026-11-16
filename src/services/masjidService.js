import { supabase, unwrap } from './supabase';

// Returns dropdown-ready options: [{ value, label, caption }]. No city = every masjid.
export async function getMasjids(city = '') {
  let query = supabase.from('masjids').select('name, city').order('name');
  if (city) query = query.eq('city', city);
  const rows = unwrap(await query);
  return rows.map((m) => ({ value: m.name, label: m.name, caption: m.city }));
}

export async function addMasjid({ city, name }) {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const { error } = await supabase.from('masjids').insert({ city, name: trimmed });
  if (error) {
    if (error.code === '23505') throw new Error(`${trimmed} is already added in ${city}`);
    if (error.code === '42501') throw new Error('Not allowed. Please log in as admin again.');
    throw new Error(error.message);
  }
  return { name: trimmed, city };
}
