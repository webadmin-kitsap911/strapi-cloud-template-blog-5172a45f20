'use strict';

const totpRoutes = require('./totp');
const totpAdminRoutes = require('./totp-admin');

module.exports = {
  admin: {
    type: 'admin',
    routes: [...totpRoutes, ...totpAdminRoutes],
  },
};
