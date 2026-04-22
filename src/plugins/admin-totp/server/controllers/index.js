'use strict';

const totp = require('./totp');
const totpAdmin = require('./totp-admin');

module.exports = {
  totp,
  'totp-admin': totpAdmin,
};
