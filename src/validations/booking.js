// Indian mobile number: 10 digits, starting with 6-9 (the +91 code is added on submit)
const MOBILE_REGEX = /^[6-9]\d{9}$/;

// Returns an object of { fieldName: 'error message' }. Empty object = valid.
export function validateBooking(values, service) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Please enter your name (Apna naam likhein)';

  const mobile = values.mobile.replace(/[\s-]/g, '');
  if (!mobile) errors.mobile = 'Please enter your mobile number';
  else if (!MOBILE_REGEX.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';

  if (!values.city) errors.city = 'Please select a city (Shehar chunein)';
  if (!values.masjid.trim()) errors.masjid = 'Please select or enter Masjid name';

  if (service.mode === 'select' && values.selected.length === 0) {
    errors.selected = 'Please select at least one (Kam az kam ek chunein)';
  }

  return errors;
}
