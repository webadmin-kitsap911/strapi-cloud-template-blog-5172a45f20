'use strict';

const otplib = require('otplib');
const QRCode = require('qrcode');

const ISSUER = 'Kitsap911 Admin';

// Helper functions that don't need strapi
const generateSecret = () => {
  return otplib.generateSecret();
};

const verifyToken = (secret, token) => {
  try {
    const result = otplib.verifySync({ secret, token });
    return result.valid === true;
  } catch (error) {
    // Invalid token format or other errors
    return false;
  }
};

const generateQRCode = async (secret, email) => {
  const otpauth = otplib.generateURI({ secret, label: email, issuer: ISSUER });
  return QRCode.toDataURL(otpauth);
};

module.exports = ({ strapi }) => {
  const getAdminUser = async (userId) => {
    const knex = strapi.db.connection;
    const user = await knex('admin_users')
      .where({ id: userId })
      .first();
    return user;
  };

  const updateAdminUser = async (userId, data) => {
    const knex = strapi.db.connection;
    await knex('admin_users')
      .where({ id: userId })
      .update(data);
  };

  return {
    generateSecret,
    verifyToken,
    generateQRCode,
    getAdminUser,
    updateAdminUser,

    async setupBegin(userId) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const secret = generateSecret();
      const encryptionService = strapi.plugin('admin-totp').service('encryption');
      const encryptedPendingSecret = encryptionService.encrypt(secret);

      await updateAdminUser(userId, {
        totp_pending_secret: encryptedPendingSecret,
      });

      const qrCode = await generateQRCode(secret, user.email);

      return {
        secret,
        qrCode,
      };
    },

    async setupComplete(userId, token) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.totp_pending_secret) {
        throw new Error('No pending TOTP setup found. Please start setup again.');
      }

      const encryptionService = strapi.plugin('admin-totp').service('encryption');
      const secret = encryptionService.decrypt(user.totp_pending_secret);

      if (!verifyToken(secret, token)) {
        throw new Error('Invalid verification code');
      }

      // Generate backup codes
      const backupCodesService = strapi.plugin('admin-totp').service('backup-codes');
      const { codes, hashedCodes } = await backupCodesService.generate();

      // Move pending secret to active secret
      await updateAdminUser(userId, {
        totp_secret: user.totp_pending_secret,
        totp_pending_secret: null,
        totp_enabled: true,
        totp_backup_codes: JSON.stringify(hashedCodes),
      });

      return { backupCodes: codes };
    },

    async disable(userId, password) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const adminService = strapi.admin.services.auth;
      const isValid = await adminService.validatePassword(password, user.password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      await updateAdminUser(userId, {
        totp_secret: null,
        totp_enabled: false,
        totp_backup_codes: null,
        totp_pending_secret: null,
      });

      return { disabled: true };
    },

    async getStatus(userId) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        enabled: !!user.totp_enabled,
        required: !!user.totp_required,
        hasPendingSetup: !!user.totp_pending_secret,
      };
    },

    async verifyForLogin(userId, token) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.totp_secret) {
        throw new Error('TOTP not configured for this user');
      }

      const encryptionService = strapi.plugin('admin-totp').service('encryption');
      const secret = encryptionService.decrypt(user.totp_secret);

      // Try regular TOTP token first
      if (verifyToken(secret, token)) {
        return { valid: true, method: 'totp' };
      }

      // Try backup code
      const backupCodesService = strapi.plugin('admin-totp').service('backup-codes');
      const backupResult = await backupCodesService.verify(userId, token);

      if (backupResult.valid) {
        return { valid: true, method: 'backup' };
      }

      return { valid: false };
    },

    async regenerateBackupCodes(userId, password) {
      const user = await getAdminUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.totp_enabled) {
        throw new Error('TOTP is not enabled');
      }

      // Verify password
      const adminService = strapi.admin.services.auth;
      const isValid = await adminService.validatePassword(password, user.password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      const backupCodesService = strapi.plugin('admin-totp').service('backup-codes');
      const { codes, hashedCodes } = await backupCodesService.generate();

      await updateAdminUser(userId, {
        totp_backup_codes: JSON.stringify(hashedCodes),
      });

      return { backupCodes: codes };
    },
  };
};
