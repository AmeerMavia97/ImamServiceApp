import { EXPERIENCE_OPTIONS, LANGUAGES } from '@/constants/options';
import { ROLES } from '@/constants/roles';

// The Sign Up form for each role (the photo is picked separately, above the fields).
// kind: 'text' | 'phone' | 'email' | 'select' | 'password' | 'multi' (pick several) | 'time' | 'number'
// optional: true = may stay empty.  group: fields with the same group sit side by side in one row.
// (`label` also names the field in error messages)
export function getRegisterFields(role, cityOptions) {
  const email = { key: 'email', label: 'Email', kind: 'email', placeholder: 'Enter your email' };
  const password = { key: 'password', label: 'Password', kind: 'password', placeholder: 'Create a password' };
  const city = { key: 'city', label: 'City', kind: 'select', placeholder: 'Select your city', options: cityOptions };

  if (role === ROLES.MASJID) {
    return [
      { key: 'masjid', label: 'Masjid Name', kind: 'text', placeholder: 'Enter Masjid name' },
      city,
      { key: 'address', label: 'Masjid Address / Location', kind: 'text', placeholder: 'Area, street, landmark' },
      { key: 'name', label: 'Contact Person Name', kind: 'text', placeholder: 'Enter contact person name' },
      { key: 'mobile', label: 'Contact Mobile Number', kind: 'phone', placeholder: '98XXXXXXXX' },
      { key: 'openingTime', label: 'Opening Time', kind: 'time', placeholder: 'From', group: 'timing' },
      { key: 'closingTime', label: 'Closing Time', kind: 'time', placeholder: 'To', group: 'timing' },
      email,
      password,
    ];
  }

  return [
    { key: 'name', label: 'Full Name', kind: 'text', placeholder: 'Enter your full name' },
    { key: 'mobile', label: 'Mobile Number', kind: 'phone', placeholder: '98XXXXXXXX' },
    city,
    { key: 'area', label: 'Area (optional)', kind: 'text', placeholder: 'Your area / locality', optional: true },
    { key: 'experience', label: 'Experience', kind: 'multi', options: EXPERIENCE_OPTIONS },
    { key: 'languages', label: 'Languages', kind: 'multi', options: LANGUAGES },
    { key: 'fee', label: 'Fees per day', kind: 'number', placeholder: 'e.g. 1500' },
    email,
    password,
  ];
}
