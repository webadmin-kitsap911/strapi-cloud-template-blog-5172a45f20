'use strict';

module.exports = [
  {
    method: 'POST',
    path: '/totp/verify',
    handler: 'totp.verify',
    config: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/totp/setup-with-session/begin',
    handler: 'totp.setupBeginWithSession',
    config: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/totp/setup-with-session/complete',
    handler: 'totp.setupCompleteWithSession',
    config: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/totp/setup/begin',
    handler: 'totp.setupBegin',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/totp/setup/complete',
    handler: 'totp.setupComplete',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/totp/disable',
    handler: 'totp.disable',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/totp/status',
    handler: 'totp.status',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/totp/backup-codes/regenerate',
    handler: 'totp.regenerateBackupCodes',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
