'use strict';

const encryption = require('./encryption');
const session = require('./session');
const totp = require('./totp');
const backupCodes = require('./backup-codes');

module.exports = {
  encryption,
  session,
  totp,
  'backup-codes': backupCodes,
};
