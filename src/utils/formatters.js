const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatAmount(amount) {
  return Number(amount).toLocaleString('en-US');
}

// Accepts a Date, an ISO string, or a date-only string like '2026-11-14'
// (date-only strings are read as LOCAL dates so the day never shifts by timezone).
function toDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

// Date -> '2026-11-14' (local date), the format the database stores.
export function toDateOnly(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 14 Nov 2026
export function formatDate(date) {
  const d = toDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Sat, 14 Nov 2026
export function formatDateLong(date) {
  const d = toDate(date);
  return `${DAYS[d.getDay()]}, ${formatDate(d)}`;
}

// '18:30' -> '6:30 PM' ('' stays '')
export function formatTime(value) {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// Date -> '18:30' (the format saved in the database)
export function toTimeOnly(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
