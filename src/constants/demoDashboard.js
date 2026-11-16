import { BOOKING_STATUS } from '@/constants/options';
import { toDateOnly } from '@/utils/formatters';

// DEMO numbers for the Imam / Masjid dashboard overview (chart, cards, recent requests).
// Replace with the real requests (useMyRequests) when the real dashboard is built.

const daysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return toDateOnly(date);
};

// Requests per day for the last 7 days, oldest first (the last one is today).
export const DEMO_WEEK = [3, 5, 4, 8, 6, 9, 5];

export const DEMO_STATS = { pending: 5, accepted: 18 };

export const DEMO_RECENT = [
  { id: 'demo-1', serviceId: 'imam', masjid: 'Jama Masjid Delhi', date: daysAgo(0), total: 1000, status: BOOKING_STATUS.PENDING },
  { id: 'demo-2', serviceId: 'moazzin', masjid: 'Fatehpuri Masjid', date: daysAgo(1), total: 700, status: BOOKING_STATUS.ACCEPTED },
  { id: 'demo-3', serviceId: 'khadim', masjid: 'Masjid e Jahan Numa', date: daysAgo(2), total: 1500, status: BOOKING_STATUS.ACCEPTED },
  { id: 'demo-4', serviceId: 'imam', masjid: 'Moti Masjid, Lal Qila', date: daysAgo(3), total: 1000, status: BOOKING_STATUS.REJECTED },
];
