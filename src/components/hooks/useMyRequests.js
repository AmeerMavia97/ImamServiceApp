import { useQuery } from '@tanstack/react-query';

import { getMyRequests } from '@/services/requestService';
import { useAuth } from '@/store/AuthContext';

// The booking requests of the logged-in Imam / Masjid (shared by the Dashboard and Bookings tabs).
export function useMyRequests() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['my-requests', user?.id],
    queryFn: getMyRequests,
    enabled: Boolean(user),
  });

  return { ...query, requests: query.data ?? [] };
}
