// Shared by the React client (src/) and the Express API (server/) so both
// sides enforce exactly the same rules.

export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt ignores bytes beyond 72

export const NAME_CHARS_ERROR = 'Name can only contain letters and spaces.';
export const PASSWORD_HINT = `At least ${PASSWORD_MIN} characters, with a letter and a number.`;

// Letters from any language (so names like "Peña" work) separated by single spaces.
const NAME_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;
const NAME_DISALLOWED = /[^\p{L} ]/gu;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

// Removes anything that is not a letter or space, for filtering keystrokes.
export function stripInvalidNameChars(value) {
  return String(value ?? '').replace(NAME_DISALLOWED, '');
}

export function validateName(value) {
  const name = normalizeName(value);
  if (!name) return 'Full name is required.';
  if (!NAME_PATTERN.test(name)) return NAME_CHARS_ERROR;
  if (name.length < NAME_MIN) return `Name must be at least ${NAME_MIN} letters.`;
  if (name.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`;
  return '';
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!email) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address (e.g. name@example.com).';
  return '';
}

// Presence only — for login, where any existing password must be accepted.
export function requirePassword(value) {
  return value ? '' : 'Password is required.';
}

// Strength rules for creating or changing a password.
export function validatePassword(value) {
  const password = String(value ?? '');
  if (!password) return requirePassword(password);
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  if (/\s/.test(password)) return 'Password cannot contain spaces.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  return confirmPassword === password ? '' : 'Passwords do not match.';
}

// Runs { field: errorMessage } checks; returns null when everything is valid.
export function collectErrors(checks) {
  const errors = Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
  return Object.keys(errors).length ? errors : null;
}
