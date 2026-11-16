import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCities } from '@/services/cityService';

// All cities (including the ones the admin added), plus dropdown-ready options.
export function useCities() {
  const { data } = useQuery({ queryKey: ['cities'], queryFn: getCities });
  const cities = useMemo(() => data ?? [], [data]);
  const options = useMemo(() => cities.map((city) => ({ value: city, label: city })), [cities]);
  return { cities, options };
}
