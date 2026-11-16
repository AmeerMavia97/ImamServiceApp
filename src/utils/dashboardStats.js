import { BOOKING_STATUS } from '@/constants/options';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Puts a weekday label on each value of a daily series. The last value is today.
// [3, 5, 4] -> [{ label: 'Fri', value: 3 }, { label: 'Sat', value: 5 }, { label: 'Sun', value: 4, today: true }]
export function labelledDays(values) {
  const today = new Date();
  return values.map((value, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (values.length - 1 - i));
    return { label: DAY_LABELS[day.getDay()], value, today: i === values.length - 1 };
  });
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// How many items (anything with a createdAt) were created on each of the last `days` days,
// oldest first, today last: [2, 0, 5, ...]. Feed the result to labelledDays() for a chart.
export function countPerDay(items, days = 7) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i));
    return items.filter((item) => sameDay(new Date(item.createdAt), day)).length;
  });
}

// { total, pending, accepted, rejected }
export function countByStatus(requests) {
  const count = (status) => requests.filter((r) => r.status === status).length;
  return {
    total: requests.length,
    pending: count(BOOKING_STATUS.PENDING),
    accepted: count(BOOKING_STATUS.ACCEPTED),
    rejected: count(BOOKING_STATUS.REJECTED),
  };
}
