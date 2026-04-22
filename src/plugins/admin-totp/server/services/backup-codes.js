'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const NUM_CODES = 10;
const CODE_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

const generateCode = () => {
  // Generate a random 8-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars: 0, O, I, 1
  let code = '';
  const bytes = crypto.randomBytes(CODE_LENGTH);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length];
  }
  // Format as XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
};

module.exports = ({ strapi }) => ({
  generateCode,

  async generate() {
    const codes = [];
    const hashedCodes = [];

    for (let i = 0; i < NUM_CODES; i++) {
      const code = generateCode();
      const normalizedCode = code.replace(/-/g, '').toUpperCase();
      const hash = await bcrypt.hash(normalizedCode, BCRYPT_ROUNDS);

      codes.push(code);
      hashedCodes.push({ hash, used: false });
    }

    return { codes, hashedCodes };
  },

  async verify(userId, code) {
    const totpService = strapi.plugin('admin-totp').service('totp');
    const user = await totpService.getAdminUser(userId);

    if (!user || !user.totp_backup_codes) {
      return { valid: false };
    }

    const backupCodes = JSON.parse(user.totp_backup_codes);
    const normalizedCode = code.replace(/-/g, '').toUpperCase();

    for (let i = 0; i < backupCodes.length; i++) {
      const backupCode = backupCodes[i];
      if (backupCode.used) continue;

      const isMatch = await bcrypt.compare(normalizedCode, backupCode.hash);
      if (isMatch) {
        // Mark code as used
        backupCodes[i].used = true;
        await totpService.updateAdminUser(userId, {
          totp_backup_codes: JSON.stringify(backupCodes),
        });

        const remainingCodes = backupCodes.filter((c) => !c.used).length;
        return { valid: true, remainingCodes };
      }
    }

    return { valid: false };
  },

  async getRemainingCount(userId) {
    const totpService = strapi.plugin('admin-totp').service('totp');
    const user = await totpService.getAdminUser(userId);

    if (!user || !user.totp_backup_codes) {
      return 0;
    }

    const backupCodes = JSON.parse(user.totp_backup_codes);
    return backupCodes.filter((c) => !c.used).length;
  },
});
