import { supabase, unwrap } from './supabase';

// Admin: approve or reject new Imam / Masjid accounts. Only the admin can read every profile
// and call set_approval (both are checked in the database, see supabase/schema.sql).
const mapAccount = (row) => ({
  id: row.id,
  role: row.role,
  name: row.full_name,
  mobile: row.mobile,
  email: row.email,
  city: row.city,
  address: row.address,
  masjidName: row.masjid_name,
  experience: row.experience ?? [],
  languages: row.languages ?? [],
  fee: row.fee,
  openingTime: row.opening_time,
  closingTime: row.closing_time,
  photoUrl: row.photo_url,
  approvalStatus: row.approval_status,
  createdAt: row.created_at,
});

// Every Imam / Masjid account, newest first.
export async function getAccountsForApproval() {
  const rows = unwrap(await supabase.from('profiles').select('*').order('created_at', { ascending: false }));
  return rows.map(mapAccount);
}

// status: 'approved' | 'rejected' | 'pending'
export async function setApproval(id, status) {
  const { error } = await supabase.rpc('set_approval', { p_id: id, p_status: status });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('Approval is not set up yet. Please run the latest supabase/schema.sql.');
    }
    throw new Error(error.message);
  }
}
