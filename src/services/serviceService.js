import { SERVICES } from '@/constants/services';
import { supabase, unwrap } from './supabase';

// The app defines the structure of each service (namaz lists, duties, icons);
// the database holds the parts the admin can edit: price, unit, limit, description.
const merge = (row) => {
  const base = SERVICES.find((s) => s.id === row.id);
  if (!base) return null;
  return { ...base, price: row.price, unit: row.unit, limit: row.limit_text, description: row.description };
};

export async function getServices() {
  const rows = unwrap(await supabase.from('services').select('*'));
  // Keep the order defined in constants/services.js
  return SERVICES.map((base) => rows.find((r) => r.id === base.id)).filter(Boolean).map(merge);
}

// patch: any of { price (number | null), unit, limit, description }
export async function updateService(id, patch) {
  const update = { updated_at: new Date().toISOString() };
  if ('price' in patch) update.price = patch.price;
  if ('unit' in patch) update.unit = patch.unit;
  if ('limit' in patch) update.limit_text = patch.limit;
  if ('description' in patch) update.description = patch.description;

  const rows = unwrap(await supabase.from('services').update(update).eq('id', id).select());
  // RLS silently updates 0 rows for non-admins, so check that something changed.
  if (!rows.length) throw new Error('Could not save. Please log in as admin again.');
  return merge(rows[0]);
}
