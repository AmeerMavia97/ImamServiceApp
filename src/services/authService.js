import { ROLES } from '@/constants/roles';
import { uploadAvatar } from './profileService';
import { supabase } from './supabase';

// Everyone (Imam, Masjid Representative, Admin) is a normal Supabase Auth user.
// The ROLE is read from the database, never trusted from the app:
//   - admin  -> the user is listed in `admin_users` (is_admin() returns true)
//   - imam / masjid -> `profiles.role`
// The database rules (RLS) decide what each person may read or change, so the role checks
// in the app only choose which screens to show.

const mapProfile = (row) => ({
  id: row.id,
  role: row.role,
  name: row.full_name,
  mobile: row.mobile,
  email: row.email,
  city: row.city,
  address: row.address,
  experience: row.experience ?? [],
  languages: row.languages ?? [],
  fee: row.fee,
  openingTime: row.opening_time,
  closingTime: row.closing_time,
  masjidName: row.masjid_name,
  photoUrl: row.photo_url,
  approvalStatus: row.approval_status, // 'pending' | 'approved' | 'rejected'
});

// { id, email, role: 'admin' | 'imam' | 'masjid' | null, profile }
export async function getAccount(user) {
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
  if (adminError) throw new Error(adminError.message);
  if (isAdmin === true) return { id: user.id, email: user.email, role: ROLES.ADMIN, profile: null };

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return { id: user.id, email: user.email, role: data?.role ?? null, profile: data ? mapProfile(data) : null };
}

function loginErrorMessage(error) {
  // Only a real credentials problem says "incorrect"; other problems show their own reason.
  if (error.code === 'invalid_credentials') return 'Incorrect email or password';
  if (error.code === 'email_not_confirmed') {
    return 'This email is not confirmed yet. Please open the confirmation email we sent you.';
  }
  return error.message;
}

// Supabase limits how many emails it can send per hour (confirmation / reset emails), and how
// fast requests may come. Say which limit was hit instead of a vague message.
function rateLimitMessage(error) {
  if (error.code === 'over_email_send_rate_limit') {
    return 'Too many emails were sent. Please wait for a while (up to an hour) and try again.';
  }
  if (error.status === 429) return 'Too many attempts. Please wait a minute and try again.';
  return null;
}

function signUpErrorMessage(error) {
  if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) {
    return 'This email is already registered. Please login.';
  }
  if (error.code === 'weak_password') return 'Password is too weak. Use at least 6 characters.';
  return rateLimitMessage(error) ?? error.message;
}

// Login for everyone. The role (admin / imam / masjid) is read from the database and decides
// the dashboard; an account without any role is signed out again with a clear message.
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(loginErrorMessage(error));

  let account;
  try {
    account = await getAccount(data.user);
  } catch (e) {
    await supabase.auth.signOut();
    throw e;
  }

  if (!account.role) {
    await supabase.auth.signOut();
    throw new Error('This account has no role yet. Please contact support.');
  }
  return account;
}

// Sign up as an Imam or a Masjid Representative. The sign-up trigger in the database
// creates the profile from this metadata (and refuses any role except imam / masjid).
// Returns { needsConfirmation: true } when the email must be confirmed before login,
// otherwise { needsConfirmation: false, account } (already logged in).
export async function signUp({
  role,
  name,
  mobile,
  email,
  city,
  area,
  address,
  masjidName,
  experience,
  languages,
  fee,
  openingTime,
  closingTime,
  password,
  photo,
}) {
  const cleanEmail = email.trim();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        role,
        full_name: name.trim(),
        mobile,
        city,
        // Imam
        area: role === ROLES.IMAM ? (area ?? '').trim() : '',
        experience: role === ROLES.IMAM ? experience ?? [] : [],
        languages: role === ROLES.IMAM ? languages ?? [] : [],
        fee: role === ROLES.IMAM ? String(fee ?? '') : '',
        // Masjid
        masjid_name: role === ROLES.MASJID ? masjidName.trim() : '',
        address: role === ROLES.MASJID ? (address ?? '').trim() : '',
        opening_time: role === ROLES.MASJID ? openingTime ?? '' : '',
        closing_time: role === ROLES.MASJID ? closingTime ?? '' : '',
      },
    },
  });
  if (error) throw new Error(signUpErrorMessage(error));

  // With "Confirm email" on, an already used address comes back as a user without identities.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error('This email is already registered. Please login.');
  }

  // The email must be confirmed first: no login yet, so the photo cannot be uploaded now.
  // (After login the person can add it with "Change photo" on their dashboard.)
  if (!data.session) return { needsConfirmation: true };

  let account = await getAccount(data.user);
  if (photo && account.profile) {
    try {
      const photoUrl = await uploadAvatar(data.user.id, photo);
      account = { ...account, profile: { ...account.profile, photoUrl } };
    } catch {
      // not fatal: the person can add the photo later
    }
  }
  return { needsConfirmation: false, account };
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Sends a Supabase password-reset email. The same message is shown whether or not the
// address exists, so it never reveals which emails have an account.
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  // Rate-limit errors should still be shown; everything else stays silent.
  if (error && (error.status === 429 || error.code === 'over_email_send_rate_limit')) {
    throw new Error(rateLimitMessage(error));
  }
  return { email: email.trim() };
}
