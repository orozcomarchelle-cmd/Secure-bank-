// server/utils/passwordValidation.js
// Simple, dependency-free password strength validation.

const MIN_LENGTH = 8;

/**
 * Validates a password against basic strength rules.
 * Returns { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (typeof password !== "string" || password.length === 0) {
    return { valid: false, errors: ["Password is required."] };
  }
  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long.`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePassword };
