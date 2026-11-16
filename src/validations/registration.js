const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian mobile: 10 digits starting with 6-9

// fields: [{ key, label, kind: 'text' | 'phone' | 'email' | 'password' | 'select' | 'multi' | 'time' | 'number', optional? }]
// Returns { fieldKey: 'error message' }. Empty object = valid.
export function validateRegistration(fields, values) {
  const errors = {};

  fields.forEach(({ key, label, kind, optional }) => {
    // 'multi' holds a list of picked options, everything else holds text
    if (kind === 'multi') {
      if (!optional && !(values[key]?.length > 0)) errors[key] = `Please select at least one of ${label.toLowerCase()}`;
      return;
    }

    const value = (values[key] ?? '').trim();

    if (!value) {
      if (optional) return;
      errors[key] =
        kind === 'select' || kind === 'time'
          ? `Please select ${label.toLowerCase()}`
          : `Please enter ${label.toLowerCase()}`;
    } else if (kind === 'phone' && !MOBILE_REGEX.test(value)) {
      errors[key] = 'Enter a valid 10-digit mobile number';
    } else if (kind === 'number' && !(Number(value) > 0)) {
      errors[key] = `Enter a valid amount for ${label.toLowerCase()}`;
    } else if (kind === 'email' && !EMAIL_REGEX.test(value)) {
      errors[key] = 'Enter a valid email address';
    } else if (kind === 'password' && value.length < 6) {
      errors[key] = 'Password must be at least 6 characters';
    }
  });

  return errors;
}
