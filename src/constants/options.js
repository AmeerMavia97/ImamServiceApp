// Static dropdown / chip options used across the app.

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

// Starting list of cities. Admin can add more (see services/cityService.js).
export const CITIES = [
  'Agra',
  'Ahmedabad',
  'Aligarh',
  'Bengaluru',
  'Bhopal',
  'Bijnor',
  'Chandigarh',
  'Chennai',
  'Delhi',
  'Faridabad',
  'Ghaziabad',
  'Gurugram',
  'Hyderabad',
  'Jaipur',
  'Kolkata',
  'Lucknow',
  'Meerut',
  'Moradabad',
  'Mumbai',
  'Muzaffarnagar',
  'Noorpur',
  'Palwal',
  'Pirthala',
  'Saharanpur',
];

// What an Imam can do (the "Experience" he picks when registering, and the Home filter).
export const EXPERIENCE_OPTIONS = ['Janaza Namaz', 'Juma', 'Nikah', 'Taraweeh', 'Daily Namaz', 'Eid Namaz', 'Dua'];

export const LANGUAGES = ['Urdu', 'Hindi'];

// Persons that can be booked for Khadim / Cleaning Worker.
export const MIN_PEOPLE = 1;
export const MAX_PEOPLE = 10;


// Fee brackets for the Home filter (per day, in rupees). max: null = no upper limit.
export const FEE_RANGES = [
  { value: 'low', label: 'Up to ₹1,500', min: 0, max: 1500 },
  { value: 'mid', label: '₹1,501–3,000', min: 1501, max: 3000 },
  { value: 'high', label: 'Above ₹3,000', min: 3001, max: null },
];
