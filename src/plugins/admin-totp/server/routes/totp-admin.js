'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/totp/permissions',
    handler: 'totp-admin.getPermissions',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/totp/users',
    handler: 'totp-admin.listUsers',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'PUT',
    path: '/totp/users/:id/required',
    handler: 'totp-admin.setRequired',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/totp/users/:id/reset',
    handler: 'totp-admin.reset',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/totp/users/:id/status',
    handler: 'totp-admin.getUserStatus',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
