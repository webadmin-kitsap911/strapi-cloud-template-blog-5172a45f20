'use strict';

const crypto = require('crypto');

const SESSION_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

module.exports = ({ strapi }) => ({
  async create(adminUserId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000);

    await strapi.db.query('plugin::admin-totp.totp-session').create({
      data: {
        token,
        adminUserId,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    return { token, expiresAt };
  },

  async validate(token) {
    const session = await strapi.db.query('plugin::admin-totp.totp-session').findOne({
      where: { token },
    });

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (session.used) {
      return { valid: false, reason: 'Session already used' };
    }

    if (new Date(session.expiresAt) < new Date()) {
      return { valid: false, reason: 'Session expired' };
    }

    if (session.attempts >= MAX_ATTEMPTS) {
      return { valid: false, reason: 'Too many attempts' };
    }

    return { valid: true, session };
  },

  async incrementAttempts(token) {
    const session = await strapi.db.query('plugin::admin-totp.totp-session').findOne({
      where: { token },
    });

    if (session) {
      await strapi.db.query('plugin::admin-totp.totp-session').update({
        where: { id: session.id },
        data: { attempts: session.attempts + 1 },
      });
    }
  },

  async markUsed(token) {
    const session = await strapi.db.query('plugin::admin-totp.totp-session').findOne({
      where: { token },
    });

    if (session) {
      await strapi.db.query('plugin::admin-totp.totp-session').update({
        where: { id: session.id },
        data: { used: true },
      });
    }
  },

  async cleanup() {
    // Delete expired and used sessions
    const cutoff = new Date();

    await strapi.db.query('plugin::admin-totp.totp-session').deleteMany({
      where: {
        $or: [
          { expiresAt: { $lt: cutoff.toISOString() } },
          { used: true },
        ],
      },
    });
  },

  async deleteForUser(adminUserId) {
    await strapi.db.query('plugin::admin-totp.totp-session').deleteMany({
      where: { adminUserId },
    });
  },
});
