import { useQuery } from '@tanstack/react-query';

import { getServices } from '@/services/serviceService';

// All services with the admin's latest price / text edits (from the database).
// `services` is [] until loaded, so check `isLoading` before showing prices.
export function useServices() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['services'], queryFn: getServices });
  const services = data ?? [];
  const getService = (id) => services.find((service) => service.id === id);
  return { services, getService, isLoading, isError, refetch };
}
