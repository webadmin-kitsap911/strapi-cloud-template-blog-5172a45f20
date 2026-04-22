'use strict';

const { actions } = require('./config/actions');

module.exports = async ({ strapi }) => {
  // Register plugin permissions
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
  // Add TOTP columns to admin_users table
  const knex = strapi.db.connection;

  const hasColumns = await knex.schema.hasColumn('admin_users', 'totp_secret');

  if (!hasColumns) {
    strapi.log.info('[admin-totp] Adding TOTP columns to admin_users table...');

    await knex.schema.alterTable('admin_users', (table) => {
      table.text('totp_secret').nullable();
      table.boolean('totp_enabled').defaultTo(false);
      table.boolean('totp_required').defaultTo(false);
      table.json('totp_backup_codes').nullable();
      table.text('totp_pending_secret').nullable();
    });

    strapi.log.info('[admin-totp] TOTP columns added successfully.');
  }

  // Schedule session cleanup every 10 minutes
  const cleanupInterval = 10 * 60 * 1000;
  setInterval(async () => {
    try {
      await strapi.plugin('admin-totp').service('session').cleanup();
    } catch (error) {
      strapi.log.error('[admin-totp] Session cleanup error:', error);
    }
  }, cleanupInterval);

  // Run initial cleanup
  try {
    await strapi.plugin('admin-totp').service('session').cleanup();
  } catch (error) {
    strapi.log.error('[admin-totp] Initial session cleanup error:', error);
  }

  strapi.log.info('[admin-totp] Plugin initialized successfully.');
};
