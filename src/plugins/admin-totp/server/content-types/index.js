'use strict';

const totpSession = require('./totp-session/schema.json');

module.exports = {
  'totp-session': { schema: totpSession },
};
