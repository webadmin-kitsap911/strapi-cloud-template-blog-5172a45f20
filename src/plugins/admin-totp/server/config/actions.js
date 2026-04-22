'use strict';

module.exports = {
  actions: [
    {
      section: 'plugins',
      displayName: 'Read user TOTP status',
      uid: 'users.read',
      subCategory: 'totp',
      pluginName: 'admin-totp',
    },
    {
      section: 'plugins',
      displayName: 'Require TOTP for users',
      uid: 'users.require',
      subCategory: 'totp',
      pluginName: 'admin-totp',
    },
    {
      section: 'plugins',
      displayName: 'Reset user TOTP',
      uid: 'users.reset',
      subCategory: 'totp',
      pluginName: 'admin-totp',
    },
  ],
};
