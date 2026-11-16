import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboardingSeen: 'arzi:onboardingSeen',
  language: 'arzi:language',
  userRole: 'arzi:userRole',
  myBookingIds: 'arzi:myBookingIds',
};

// There is no user login, so this phone remembers the ids of the bookings it made.
// "My Bookings" asks the database for exactly these ids.
export async function getMyBookingIds() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.myBookingIds);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addMyBookingId(id) {
  try {
    const ids = await getMyBookingIds();
    await AsyncStorage.setItem(KEYS.myBookingIds, JSON.stringify([id, ...ids.filter((x) => x !== id)]));
  } catch {
    // Storage unavailable: the booking is saved, it just will not be listed on this phone.
  }
}

export async function removeMyBookingId(id) {
  try {
    const ids = await getMyBookingIds();
    await AsyncStorage.setItem(KEYS.myBookingIds, JSON.stringify(ids.filter((x) => x !== id)));
  } catch {
    // Storage unavailable: the booking is already deleted, the stale id is simply ignored.
  }
}

// Remembers the language the user picked in the Home dropdown.
export async function getSavedLanguage() {
  try {
    return await AsyncStorage.getItem(KEYS.language);
  } catch {
    return null;
  }
}

export async function saveLanguage(language) {
  try {
    await AsyncStorage.setItem(KEYS.language, language);
  } catch {
    // Storage unavailable: the choice just won't survive a restart.
  }
}

// Remembers that the role screen is done (a visitor chose "User", or someone logged in / signed up),
// so the app opens on Home next time. Not saved yet = the role screen is shown.
export async function getUserRole() {
  try {
    return await AsyncStorage.getItem(KEYS.userRole);
  } catch {
    return null;
  }
}

export async function saveUserRole(role) {
  try {
    await AsyncStorage.setItem(KEYS.userRole, role);
  } catch {
    // Storage unavailable: the role screen may show again next launch. Not fatal.
  }
}

// The intro (onboarding) screen is shown only once, right after install.
export async function hasSeenOnboarding() {
  try {
    return (await AsyncStorage.getItem(KEYS.onboardingSeen)) === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen() {
  try {
    await AsyncStorage.setItem(KEYS.onboardingSeen, 'true');
  } catch {
    // Storage unavailable: the intro may show again next launch. Not fatal.
  }
}
