import { supabase, unwrap } from './supabase';

export async function getCities() {
  const rows = unwrap(await supabase.from('cities').select('name').order('name'));
  return rows.map((row) => row.name);
}

// "Jaipur", "jaipur" and " JAIPUR " are all the same city
export const normalizeCity = (name) => name.trim().replace(/\s+/g, ' ');
export const sameCity = (a, b) => normalizeCity(a).toLowerCase() === normalizeCity(b).toLowerCase();

export async function addCity(name) {
  const trimmed = normalizeCity(name);

  // Check the latest list from the database (the screen's list may be out of date)
  const existing = (await getCities()).find((city) => sameCity(city, trimmed));
  if (existing) throw new Error(`${existing} is already in the list`);

  const { error } = await supabase.from('cities').insert({ name: trimmed });
  if (error) {
    if (error.code === '23505') throw new Error(`${trimmed} is already in the list`);
    if (error.code === '42501') throw new Error('Not allowed. Please log in as admin again.');
    throw new Error(error.message);
  }
  return trimmed;
}
