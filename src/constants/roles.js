// The three kinds of account. The role itself always comes from the database
// (see services/authService.js); the app only uses it to pick screens.
export const ROLES = {
  IMAM: 'imam',
  MASJID: 'masjid',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.IMAM]: 'Imam',
  [ROLES.MASJID]: 'Masjid',
  [ROLES.ADMIN]: 'Admin',
};

// Boxes shown at the top of the Sign Up page (nobody can sign up as admin).
// The Login page has no role choice: the role is read from the database after login.
export const REGISTER_ROLE_OPTIONS = [
  { value: ROLES.IMAM, label: ROLE_LABELS[ROLES.IMAM], icon: 'mosque' },
  { value: ROLES.MASJID, label: ROLE_LABELS[ROLES.MASJID], icon: 'home-city' },
];

// Admin approval of a new Imam / Masjid account.
export const APPROVAL = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// The screen each role lands on after login.
export const DASHBOARD_ROUTE = {
  [ROLES.IMAM]: 'ImamDashboard',
  [ROLES.MASJID]: 'MasjidDashboard',
  [ROLES.ADMIN]: 'AdminDashboard',
};
