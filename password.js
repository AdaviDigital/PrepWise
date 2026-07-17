const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// Basic strength check used at registration — mirrors the hint shown
// on register.html (min 8 chars, at least one letter and one number).
function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

module.exports = { hashPassword, comparePassword, isStrongPassword };
