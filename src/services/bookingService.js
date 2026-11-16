import { addMyBookingId, getMyBookingIds, removeMyBookingId } from '@/utils/storage';
import { supabase, unwrap } from './supabase';

// Database row -> the shape the screens use.
export const mapBooking = (row) => ({
  id: row.id,
  code: `ARZ-${row.booking_no}`, // shown to the user
  serviceId: row.service_id,
  selected: row.selected ?? [],
  people: row.people ?? undefined,
  unitPrice: row.unit_price,
  total: row.total,
  name: row.name,
  mobile: row.mobile,
  city: row.city,
  masjid: row.masjid,
  date: row.booking_date, // 'YYYY-MM-DD'
  payment: row.payment,
  notes: row.notes,
  status: row.status,
  createdAt: row.created_at,
});

// User: create a booking. The database function works out the price itself.
export async function createBooking(payload) {
  const row = unwrap(
    await supabase.rpc('create_booking', {
      p_service_id: payload.serviceId,
      p_selected: payload.selected ?? [],
      p_people: payload.people ?? null,
      p_name: payload.name,
      p_mobile: payload.mobile,
      p_city: payload.city,
      p_masjid: payload.masjid,
      p_booking_date: payload.date, // 'YYYY-MM-DD'
      p_notes: payload.notes ?? '',
    })
  );
  await addMyBookingId(row.id); // remember it on this phone for "My Bookings"
  return mapBooking(row);
}

// User: the bookings made on this phone.
export async function getMyBookings() {
  const ids = await getMyBookingIds();
  if (ids.length === 0) return [];
  const rows = unwrap(await supabase.rpc('get_my_bookings', { p_ids: ids }));
  return rows.map(mapBooking);
}

// User: cancel (delete) one of their own bookings. Only a Pending booking can be cancelled.
export async function cancelBooking(id) {
  const { data, error } = await supabase.rpc('cancel_booking', { p_id: id });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('Cancel is not set up yet. Please run the latest supabase/schema.sql.');
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('This booking can no longer be cancelled.');
  await removeMyBookingId(id);
}

// Admin: every booking.
export async function getAllBookings() {
  const rows = unwrap(await supabase.from('bookings').select('*').order('created_at', { ascending: false }));
  return rows.map(mapBooking);
}

// Admin: accept / reject a booking.
export async function updateBookingStatus(id, status) {
  const rows = unwrap(await supabase.from('bookings').update({ status }).eq('id', id).select());
  if (!rows.length) throw new Error('Could not update. Please log in as admin again.');
  return mapBooking(rows[0]);
}
