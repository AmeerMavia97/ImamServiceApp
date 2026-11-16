import { mapBooking } from './bookingService';
import { supabase, unwrap } from './supabase';

// Booking requests for an Imam / Masjid Representative. The database decides which
// requests each person may see and answer (see get_my_requests / respond_to_request in
// supabase/schema.sql), so these functions work the same for both roles.

// The requests this person can see, newest first. status: Pending / Accepted / Rejected.
export async function getMyRequests() {
  const rows = unwrap(await supabase.rpc('get_my_requests'));
  return rows.map(mapBooking);
}

// action: 'accept' | 'reject'
export async function respondToRequest(id, action) {
  const { error } = await supabase.rpc('respond_to_request', { p_id: id, p_action: action });
  if (error) {
    if (error.code === 'PGRST202') {
      throw new Error('Requests are not set up yet. Please run the latest supabase/schema.sql.');
    }
    throw new Error(error.message);
  }
}
